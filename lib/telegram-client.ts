/**
 * Telegram Bot API client.
 * Env: TELEGRAM_BOT_TOKEN
 */

function token(): string {
  const t = process.env.TELEGRAM_BOT_TOKEN
  if (!t) throw new Error("Missing TELEGRAM_BOT_TOKEN")
  return t
}

const api = () => `https://api.telegram.org/bot${token()}`

export async function sendText(chatId: number | string, text: string): Promise<void> {
  const body = text.length > 4000 ? text.slice(0, 3997) + "..." : text
  const res = await fetch(`${api()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: body,
      parse_mode: "Markdown",
      disable_web_page_preview: false,
    }),
  })
  if (!res.ok) {
    // Retry without markdown in case the user sent text that broke the parser.
    await fetch(`${api()}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: body }),
    })
  }
}

export async function sendChatAction(chatId: number | string, action: "typing" | "upload_photo"): Promise<void> {
  await fetch(`${api()}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action }),
  }).catch(() => {})
}

/**
 * Resolve a Telegram file_id to a downloadable URL, fetch it, and return
 * a base64 data URL suitable for the vision AI pipeline.
 */
export async function downloadFileAsDataUrl(fileId: string, fallbackMime = "image/jpeg"): Promise<string | null> {
  try {
    const metaRes = await fetch(`${api()}/getFile?file_id=${fileId}`)
    if (!metaRes.ok) return null
    const meta = await metaRes.json() as { ok: boolean; result?: { file_path?: string } }
    if (!meta.ok || !meta.result?.file_path) return null

    const fileUrl = `https://api.telegram.org/file/bot${token()}/${meta.result.file_path}`
    const binRes = await fetch(fileUrl)
    if (!binRes.ok) return null
    const buf = Buffer.from(await binRes.arrayBuffer())

    // Infer MIME from extension
    const ext = meta.result.file_path.split(".").pop()?.toLowerCase()
    const mime = ext === "png" ? "image/png"
      : ext === "webp" ? "image/webp"
      : ext === "gif" ? "image/gif"
      : ext === "jpg" || ext === "jpeg" ? "image/jpeg"
      : fallbackMime

    return `data:${mime};base64,${buf.toString("base64")}`
  } catch (e) {
    console.error("downloadFileAsDataUrl failed:", e)
    return null
  }
}

/**
 * Download a Telegram voice note (.oga) and transcribe via OpenAI Whisper.
 * Returns transcript text, or null if OPENAI_API_KEY is missing / on failure.
 */
export async function transcribeVoiceFile(fileId: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null
  try {
    const metaRes = await fetch(`${api()}/getFile?file_id=${fileId}`)
    if (!metaRes.ok) return null
    const meta = await metaRes.json() as { ok: boolean; result?: { file_path?: string } }
    if (!meta.ok || !meta.result?.file_path) return null

    const fileUrl = `https://api.telegram.org/file/bot${token()}/${meta.result.file_path}`
    const binRes = await fetch(fileUrl)
    if (!binRes.ok) return null
    const buf = Buffer.from(await binRes.arrayBuffer())

    const form = new FormData()
    form.append("file", new Blob([buf], { type: "audio/ogg" }), "voice.ogg")
    form.append("model", "whisper-1")

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    })
    if (!r.ok) return null
    const j = await r.json() as { text?: string }
    return j.text ?? null
  } catch (e) {
    console.error("transcribeVoiceFile failed:", e)
    return null
  }
}
