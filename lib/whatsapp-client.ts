/**
 * Thin wrapper over the Meta WhatsApp Cloud API (Graph v21.0).
 * Env vars:
 *   WHATSAPP_TOKEN          — permanent system-user token
 *   WHATSAPP_PHONE_NUMBER_ID — the "From" number's ID (not the E.164 number)
 */

const API = "https://graph.facebook.com/v21.0"

function env(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

export async function sendText(to: string, body: string): Promise<void> {
  // WhatsApp hard-caps text bodies at 4096 chars.
  const text = body.length > 4000 ? body.slice(0, 3997) + "..." : body
  const res = await fetch(`${API}/${env("WHATSAPP_PHONE_NUMBER_ID")}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("WHATSAPP_TOKEN")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text, preview_url: true },
    }),
  })
  if (!res.ok) {
    console.error("sendText failed:", res.status, await res.text())
  }
}

/**
 * Download a media file from WhatsApp and return it as a base64 data URL
 * (the same shape the web canvas uses so the AI pipeline doesn't care
 * which surface it came from).
 */
export async function downloadMediaAsDataUrl(mediaId: string): Promise<string | null> {
  try {
    const metaRes = await fetch(`${API}/${mediaId}`, {
      headers: { Authorization: `Bearer ${env("WHATSAPP_TOKEN")}` },
    })
    if (!metaRes.ok) return null
    const meta = await metaRes.json() as { url?: string; mime_type?: string }
    if (!meta.url) return null

    const binRes = await fetch(meta.url, {
      headers: { Authorization: `Bearer ${env("WHATSAPP_TOKEN")}` },
    })
    if (!binRes.ok) return null
    const buf = Buffer.from(await binRes.arrayBuffer())
    const mime = meta.mime_type?.split(";")[0] ?? "image/jpeg"
    return `data:${mime};base64,${buf.toString("base64")}`
  } catch (e) {
    console.error("downloadMedia failed:", e)
    return null
  }
}

/**
 * Download a WhatsApp voice note and transcribe it via OpenAI Whisper
 * (cheap, multilingual, handles Hinglish well).  Returns the transcript
 * string or null on failure.
 */
export async function transcribeVoice(mediaId: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null
  try {
    const metaRes = await fetch(`${API}/${mediaId}`, {
      headers: { Authorization: `Bearer ${env("WHATSAPP_TOKEN")}` },
    })
    if (!metaRes.ok) return null
    const meta = await metaRes.json() as { url?: string; mime_type?: string }
    if (!meta.url) return null

    const binRes = await fetch(meta.url, {
      headers: { Authorization: `Bearer ${env("WHATSAPP_TOKEN")}` },
    })
    if (!binRes.ok) return null
    const buf = Buffer.from(await binRes.arrayBuffer())

    const form = new FormData()
    form.append("file", new Blob([buf], { type: meta.mime_type || "audio/ogg" }), "voice.ogg")
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
    console.error("transcribeVoice failed:", e)
    return null
  }
}
