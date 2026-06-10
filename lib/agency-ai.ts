// Shared AI client for all agency API routes.
// Uses Google Gemini (free tier: 1500 req/day) via its OpenAI-compatible endpoint.
// Drop-in: same streaming SSE format as OpenAI/OpenRouter.

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface AICallOptions {
  messages: ChatMessage[]
  maxTokens?: number
  temperature?: number
  jsonMode?: boolean
}

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai"

export function getAIConfig() {
  const key = process.env.GEMINI_API_KEY
  const model = process.env.AI_MODEL || "gemini-2.0-flash"
  return { key, model }
}

export async function callAIStream(options: AICallOptions): Promise<Response> {
  const { key, model } = getAIConfig()

  if (!key || key === "YOUR_KEY_HERE") {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY not configured. Get a free key at aistudio.google.com" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    )
  }

  const { messages, maxTokens = 1500, temperature = 0.7 } = options

  const upstream = await fetch(`${GEMINI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  })

  if (!upstream.ok) {
    const err = await upstream.text()
    return new Response(JSON.stringify({ error: err }), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  })
}

export async function callAIJSON(options: AICallOptions): Promise<unknown> {
  const { key, model } = getAIConfig()

  if (!key || key === "YOUR_KEY_HERE") {
    throw new Error("GEMINI_API_KEY not configured")
  }

  const { messages, maxTokens = 600, temperature = 0.2 } = options

  const res = await fetch(`${GEMINI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      stream: false,
      messages,
      max_tokens: maxTokens,
      temperature,
      response_format: { type: "json_object" },
    }),
  })

  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`)

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content
  try {
    return JSON.parse(raw)
  } catch {
    const match = raw?.match(/\{[\s\S]+\}/)
    if (!match) throw new Error("Invalid JSON response from AI")
    return JSON.parse(match[0])
  }
}
