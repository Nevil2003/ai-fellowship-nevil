import { NextRequest, NextResponse } from "next/server"
import { sendText, sendChatAction, downloadFileAsDataUrl, transcribeVoiceFile } from "@/lib/telegram-client"
import { askBrain, type BotMessage } from "@/lib/bot-brain"
import { getHistory, appendTurn, resetPhone } from "@/lib/bot-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
// Serverless function timeout — cold start + AI call can take ~20s
export const maxDuration = 60

/**
 * Optional: if you set TELEGRAM_WEBHOOK_SECRET when registering the
 * webhook, Telegram echoes it on every POST. We verify it to reject
 * spoofed traffic.  Leave it blank to skip the check.
 */
function verifySecret(req: NextRequest): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!expected) return true
  const got = req.headers.get("x-telegram-bot-api-secret-token")
  return got === expected
}

export async function POST(req: NextRequest) {
  if (!verifySecret(req)) return new NextResponse("forbidden", { status: 403 })

  const update = await req.json().catch(() => null)

  // CRITICAL: Must AWAIT the handler. On Vercel serverless, any pending
  // promise is terminated the instant we return — a fire-and-forget
  // .catch() pattern silently kills the AI call mid-flight and the
  // user never gets a reply.  Telegram's webhook timeout is lenient
  // (~60s) so awaiting is safe as long as our work fits in maxDuration.
  if (update) {
    try {
      await handleUpdate(update)
    } catch (err) {
      console.error("handleUpdate err:", err)
    }
  }

  return NextResponse.json({ ok: true })
}

// ── Simple GET for manual health checks ─────────────────────────────
export async function GET() {
  return NextResponse.json({
    ok: true,
    bot: "propstical-telegram",
    configured: !!process.env.TELEGRAM_BOT_TOKEN,
  })
}

async function handleUpdate(update: any): Promise<void> {
  const msg = update.message ?? update.edited_message
  if (!msg) return
  const chatId = msg.chat?.id
  if (!chatId) return

  const chatKey = `tg:${chatId}`

  // ── Typing indicator while we think ─────────────────────────────
  sendChatAction(chatId, "typing").catch(() => {})

  // ── Extract content ─────────────────────────────────────────────
  let userText = ""
  const images: string[] = []

  if (msg.text) {
    userText = msg.text
  } else if (msg.photo && Array.isArray(msg.photo) && msg.photo.length > 0) {
    // Telegram sends multiple sizes — the last is the largest
    const largest = msg.photo[msg.photo.length - 1]
    const dataUrl = await downloadFileAsDataUrl(largest.file_id, "image/jpeg")
    if (dataUrl) images.push(dataUrl)
    userText = msg.caption ?? ""
  } else if (msg.voice) {
    const transcript = await transcribeVoiceFile(msg.voice.file_id)
    if (!transcript) {
      await sendText(chatId, "I couldn't hear that voice note clearly — try typing it, or re-record 🙏")
      return
    }
    userText = `[voice] ${transcript}`
  } else if (msg.audio) {
    const transcript = await transcribeVoiceFile(msg.audio.file_id)
    if (!transcript) return
    userText = `[audio] ${transcript}`
  } else if (msg.document) {
    await sendText(chatId, "Docs aren't supported yet — paste the contractor quote as text, or send me a photo of it 📄")
    return
  } else if (msg.sticker || msg.location || msg.contact) {
    return
  } else {
    return
  }

  // ── Commands ────────────────────────────────────────────────────
  const cmd = userText.trim().toLowerCase()
  if (cmd === "/start") {
    await sendText(chatId,
`👋 I'm *Propstical* — India's pre-decision renovation advisor.

Send me anything:
• Contractor quotes 📄
• Room photos 📸
• Material names + prices
• Your budget + city
• Anything you're worried about

I catch mistakes *before* you commit.
_No vendor kickbacks. I profit when you think clearly._

Type /reset anytime to start over.`)
    return
  }
  if (cmd === "/reset") {
    await resetPhone(chatKey)
    await sendText(chatId, "Cleared. Send me anything to start fresh 🙏")
    return
  }
  if (cmd === "/help") {
    await sendText(chatId, "Just type or photograph anything about your renovation. I'll ask follow-ups. /reset clears memory.")
    return
  }

  // ── Ask the brain ───────────────────────────────────────────────
  const history = await getHistory(chatKey)
  const turn: BotMessage = {
    role: "user",
    text: userText || "[photo attached]",
    ...(images.length ? { images } : {}),
  }

  let reply: string
  try {
    reply = await askBrain([...history, turn])
  } catch (e) {
    console.error("askBrain threw:", e)
    reply = "My brain hiccupped. Try that in a moment 🙏"
  }

  // Persist (skip raw image bytes to keep Supabase small)
  await appendTurn(chatKey, { role: "user", text: userText || "[photo]" })
  await appendTurn(chatKey, { role: "assistant", text: reply })
  await sendText(chatId, reply)
}
