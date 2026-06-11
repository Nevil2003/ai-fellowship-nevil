/**
 * Unified AI client for Mastical OS
 * Supports OpenRouter (primary) and Gemini (fallback)
 * Both streaming and JSON modes
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string | Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }>
}

export interface AICallOptions {
  messages: ChatMessage[]
  maxTokens?: number
  temperature?: number
  jsonMode?: boolean
}

interface AIProvider {
  name: string
  baseUrl: string
  apiKey: string | undefined
  model: string
}

function getProviders(): { primary: AIProvider; fallback: AIProvider } {
  const primaryKey = process.env.AI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY
  // Any OpenAI-compatible endpoint works: OpenRouter (default),
  // Nous Research (Hermes), Groq, Together, etc.
  const baseUrl = (process.env.AI_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "")
  const aiModel = process.env.AI_MODEL || "anthropic/claude-sonnet-4.5"

  const primary: AIProvider = {
    name: baseUrl.includes("openrouter.ai") ? "openrouter" : "custom",
    baseUrl,
    apiKey: primaryKey,
    model: aiModel,
  }

  const fallback: AIProvider = {
    name: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKey: geminiKey,
    model: "gemini-2.0-flash",
  }

  return { primary, fallback }
}

function buildHeaders(provider: AIProvider): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${provider.apiKey}`,
  }

  if (provider.name === "openrouter") {
    headers["HTTP-Referer"] = "https://mastical.os"
    headers["X-Title"] = "Mastical OS"
  }

  return headers
}

async function callAI(
  options: AICallOptions,
  provider: AIProvider,
  streaming: boolean
): Promise<Response> {
  const { messages, maxTokens = 1500, temperature = 0.7, jsonMode = false } = options

  const url = `${provider.baseUrl}/chat/completions`

  const body: Record<string, any> = {
    model: provider.model,
    messages,
    max_tokens: maxTokens,
    temperature,
    stream: streaming,
  }

  // Only OpenRouter is guaranteed to accept response_format; custom
  // endpoints (e.g. Nous) rely on the prompt's JSON-only instruction
  // plus the regex fallback in callAIJSON.
  if (jsonMode && provider.name === "openrouter") {
    body.response_format = { type: "json_object" }
  }

  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(provider),
    body: JSON.stringify(body),
  })

  return response
}

/**
 * Call AI with streaming response (SSE format)
 * Tries OpenRouter first, falls back to Gemini
 */
export async function callAIStream(options: AICallOptions): Promise<Response> {
  const { primary, fallback } = getProviders()

  if (primary.apiKey && primary.apiKey !== "YOUR_KEY_HERE") {
    const res = await callAI(options, primary, true)
    if (res.ok) {
      return new Response(res.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "X-Accel-Buffering": "no",
        },
      })
    }
    // Primary failed, try fallback
    console.warn(`OpenRouter failed (${res.status}), trying Gemini fallback`)
  }

  if (fallback.apiKey && fallback.apiKey !== "YOUR_KEY_HERE") {
    const res = await callAI(options, fallback, true)
    if (res.ok) {
      return new Response(res.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "X-Accel-Buffering": "no",
        },
      })
    }
    return new Response(JSON.stringify({ error: `Gemini failed: ${res.status}` }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })
  }

  return new Response(
    JSON.stringify({
      error: "No AI provider configured. Set AI_API_KEY (OpenRouter) or GEMINI_API_KEY.",
    }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  )
}

/**
 * Call AI with JSON response
 * Tries OpenRouter first, falls back to Gemini
 */
export async function callAIJSON(options: AICallOptions): Promise<unknown> {
  const { primary, fallback } = getProviders()

  if (primary.apiKey && primary.apiKey !== "YOUR_KEY_HERE") {
    const res = await callAI(options, primary, false)
    if (res.ok) {
      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content
      try {
        return JSON.parse(raw)
      } catch {
        const match = raw?.match(/\{[\s\S]+\}/)
        if (match) return JSON.parse(match[0])
        throw new Error("Invalid JSON from OpenRouter")
      }
    }
    console.warn(`OpenRouter failed (${res.status}), trying Gemini fallback`)
  }

  if (fallback.apiKey && fallback.apiKey !== "YOUR_KEY_HERE") {
    const res = await callAI(options, fallback, false)
    if (res.ok) {
      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content
      try {
        return JSON.parse(raw)
      } catch {
        const match = raw?.match(/\{[\s\S]+\}/)
        if (match) return JSON.parse(match[0])
        throw new Error("Invalid JSON from Gemini")
      }
    }
    throw new Error(`Gemini failed: ${res.status}`)
  }

  throw new Error("No AI provider configured. Set AI_API_KEY or GEMINI_API_KEY.")
}
