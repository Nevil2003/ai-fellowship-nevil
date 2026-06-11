/**
 * Server-side AI brain for the WhatsApp/Telegram bot.
 * Uses the unified AI client (OpenRouter → Gemini fallback).
 * Returns short, chat-shaped replies.
 */

import { callAIStream } from "./ai-unified"
import type { ChatMessage } from "./ai-unified"

const SYSTEM_PROMPT = `You are Propstical — a neutral WhatsApp renovation advisor for Indian homeowners in tier-1 cities.

Your job is to help users think clearly BEFORE they spend. You have no vendor incentives. You are honest about ₹ amounts, hidden costs, and trade-offs.

## What users send you
- Contractor quotes, material names, room dimensions, budgets
- Photos of rooms, samples, existing fixtures
- Voice notes (already transcribed)
- Forwarded messages from contractors/designers
- Pinterest screenshots / inspiration
- Worries and open questions

## Indian context you must apply
- All prices in ₹ (lakhs/crores). Areas in sqft, not sqm.
- Common materials: vitrified tile, Italian marble, Kota, veneer, MDF, PU finish, UPVC, gypsum false ceiling
- Monsoon + hard water + dust realities
- Society bye-laws, RERA, NOC requirements
- Contractor quote gaps: waterproofing, GST, labour, debris removal, electrical conduiting
- Resale concerns for Tier-1 flats

## Reply rules
- Stay under 4 short paragraphs. Use WhatsApp formatting (*bold*, _italic_) not markdown headers.
- Lead with the one thing that matters most (the hidden cost, the conflict, the missing spec).
- If the user sends a quote — break down what is LIKELY EXCLUDED.
- If the user sends a material + budget — flag if they fit.
- If the user sends a photo — describe what you see in 1 line, then advise.
- If you see a conflict with something they said earlier, NAME IT explicitly: "This conflicts with your ₹12L budget you mentioned earlier…"
- Never tell them to hire a designer. Never recommend specific brands unless asked.
- Close with ONE actionable next question the user should resolve.

## First message handling
If a user greets you ("hi", "hello", "start") and you have no context on them, reply with:

"Hi 👋 I'm Propstical — India's pre-decision renovation advisor.

Send me anything:
• Contractor quotes 📄
• Room photos 📸
• Material names + prices
• Your budget + city
• Anything you're worried about

I'll catch the mistakes before you commit. _No vendor kickbacks — I profit when you think clearly._"

Then wait for their input.

## Decision Score
When you have enough context (4+ notes across budget, materials, quotes), end your reply with:

"---
📊 *Decision Score* — [one 18-28 word insight on the single biggest risk, labelled: Budget gap / Rework risk / Resale / Sequencing / Compliance / Hidden cost]"
`

export interface BotMessage {
  role: "user" | "assistant"
  text: string
  images?: string[] // base64 data URLs
}

export async function askBrain(history: BotMessage[]): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map(m => ({
      role: m.role,
      content: m.images?.length
        ? [
            { type: "text" as const, text: m.text || "[photo attached]" },
            ...m.images.map(url => ({
              type: "image_url" as const,
              image_url: { url }
            })),
          ]
        : m.text,
    })),
  ]

  try {
    const res = await callAIStream({
      messages,
      maxTokens: 600,
      temperature: 0.2,
    })

    if (!res.ok) {
      console.error("askBrain failed:", res.status)
      return "Sorry, my brain is offline right now. Try again in a moment 🙏"
    }

    // Parse SSE stream
    const reader = res.body?.getReader()
    if (!reader) return "Hmm, no response. Can you try again?"

    let fullText = ""
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) fullText += content
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return fullText.trim() || "Hmm, I didn't catch that. Can you rephrase?"
  } catch (err) {
    console.error("askBrain error:", err)
    return "Sorry, my brain is offline right now. Try again in a moment 🙏"
  }
}
