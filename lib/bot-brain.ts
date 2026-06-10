/**
 * Server-side AI brain for the WhatsApp bot.
 * Uses the same domain prompts as the web canvas but returns
 * short, WhatsApp-shaped replies instead of full annotations.
 *
 * Env vars:
 *   AI_PROVIDER     — "openrouter" | "openai"  (default: openrouter)
 *   AI_API_KEY      — the key
 *   AI_MODEL        — e.g. "anthropic/claude-sonnet-4-5"
 */

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
  const provider = (process.env.AI_PROVIDER ?? "openrouter").toLowerCase()
  const apiKey = process.env.AI_API_KEY
  const model = process.env.AI_MODEL ?? "anthropic/claude-sonnet-4-5"
  if (!apiKey) throw new Error("Missing AI_API_KEY")

  const baseUrl =
    provider === "openai" ? "https://api.openai.com/v1" :
    provider === "gemini" ? "https://generativelanguage.googleapis.com/v1beta/openai" :
    "https://openrouter.ai/api/v1"

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  }
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = "https://propstical.com"
    headers["X-Title"] = "Propstical WhatsApp Bot"
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map(m => ({
      role: m.role,
      content: m.images?.length
        ? [
            { type: "text", text: m.text || "[photo attached]" },
            ...m.images.map(url => ({ type: "image_url", image_url: { url } })),
          ]
        : m.text,
    })),
  ]

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      max_tokens: 600,
      temperature: 0.2,
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("askBrain failed:", res.status, err)
    return "Sorry, my brain is offline right now. Try again in a moment 🙏"
  }

  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  return data.choices?.[0]?.message?.content?.trim()
    ?? "Hmm, I didn't catch that. Can you rephrase?"
}
