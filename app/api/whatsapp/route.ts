import { NextRequest, NextResponse } from "next/server"
import { sendText, downloadMediaAsDataUrl, transcribeVoice } from "@/lib/whatsapp-client"
import { askBrain, type BotMessage } from "@/lib/bot-brain"
import { getHistory, appendTurn, resetPhone } from "@/lib/bot-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// ── Meta webhook verification (one-time, on setup) ─────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse("forbidden", { status: 403 })
}

// ── Inbound messages ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Respond 200 fast — Meta retries aggressively if we take > 20s.
  // Process in the background so the webhook never times out.
  const body = await req.json().catch(() => null)
  if (body) processEvent(body).catch(err => console.error("processEvent err:", err))
  return NextResponse.json({ ok: true })
}

async function processEvent(body: any): Promise<void> {
  const entries = body?.entry ?? []
  for (const entry of entries) {
    const changes = entry.changes ?? []
    for (const change of changes) {
      const value = change.value
      const messages = value?.messages ?? []
      for (const msg of messages) {
        await handleMessage(msg).catch(e => console.error("handleMessage err:", e))
      }
    }
  }
}

async function handleMessage(msg: any): Promise<void> {
  const from: string = msg.from
  if (!from) return

  // ── Extract content by type ──────────────────────────────────
  let userText = ""
  const images: string[] = []

  if (msg.type === "text") {
    userText = msg.text?.body ?? ""
  } else if (msg.type === "image") {
    const caption = msg.image?.caption ?? ""
    const dataUrl = msg.image?.id ? await downloadMediaAsDataUrl(msg.image.id) : null
    if (dataUrl) images.push(dataUrl)
    userText = caption || ""
  } else if (msg.type === "audio" || msg.type === "voice") {
    const mediaId = msg.audio?.id ?? msg.voice?.id
    const transcript = mediaId ? await transcribeVoice(mediaId) : null
    if (!transcript) {
      await sendText(from, "I couldn't hear that voice note clearly — try typing it, or re-record?")
      return
    }
    userText = `[voice note] ${transcript}`
  } else if (msg.type === "document") {
    await sendText(from, "Docs don't work yet — for now, paste the contractor quote as text or send me a photo of it 📄")
    return
  } else {
    // Stickers, locations, contacts, etc.
    return
  }

  // ── Slash-style commands ─────────────────────────────────────
  const cmd = userText.trim().toLowerCase()
  if (cmd === "/reset" || cmd === "reset") {
    await resetPhone(from)
    await sendText(from, "Cleared. Send me anything to start fresh 🙏")
    return
  }

  // ── Call the brain ───────────────────────────────────────────
  const history = await getHistory(from)
  const turn: BotMessage = {
    role: "user",
    text: userText,
    ...(images.length ? { images } : {}),
  }
  const nextHistory = [...history, turn]

  let reply: string
  try {
    reply = await askBrain(nextHistory)
  } catch (e) {
    console.error("askBrain threw:", e)
    reply = "My brain hiccupped. Try that again in a moment 🙏"
  }

  // Persist both turns + reply to the user.
  // Skip persisting raw image data URLs to Supabase (they're huge) —
  // we keep them in-context only for this one turn.
  await appendTurn(from, { role: "user", text: userText })
  await appendTurn(from, { role: "assistant", text: reply })
  await sendText(from, reply)
}
