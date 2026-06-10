import { NextRequest } from "next/server"
import { callAIStream } from "@/lib/agency-ai"

type ContentType = "social" | "ads" | "blog" | "email" | "video"

function buildSystemPrompt(type: ContentType): string {
  const base = `You are a world-class content strategist and copywriter at Mastical Agency OS. Write content that is sharp, specific, high-converting, and ready to use. Never write generic filler. Every line should earn its place.`

  const specs: Record<ContentType, string> = {
    social: `${base}

Generate 3 social media posts for the given brand/brief:
1. An Instagram caption with hook, value, and CTA (include relevant hashtags)
2. A Twitter/X thread opener (1 of 4) that teases insight
3. A LinkedIn post with a professional hook, numbered insight list, and engagement question

Format each with a bold header like **Instagram Caption**, **Twitter/X Thread**, **LinkedIn Post**.
Use line breaks for readability. Include emojis sparingly and strategically.`,

    ads: `${base}

Generate 3 Meta ad variants for the given brand/brief:
1. Problem/Solution angle — open with a pain point, bridge to solution
2. Social Proof angle — open with a testimonial or result stat
3. Direct Offer angle — clear value proposition and offer

For each variant write: Primary Text (3–5 sentences), Headline (6–8 words), Description (1 sentence), CTA button label.
Format with bold **Ad Variant A/B/C** headers. Be specific, not vague.`,

    blog: `${base}

Generate a complete blog article outline AND the first 400 words of the article for the given brand/brief.

Include:
- SEO title (under 60 chars)
- Meta description (under 155 chars)
- Target keyword
- Full section outline (H2s and H3s)
- Hook paragraph (150 words, start with a surprising stat or bold claim)
- Introduction section (250 words)

Format clearly with markdown headers.`,

    email: `${base}

Generate a 2-email welcome/nurture sequence for the given brand/brief:

Email 1 (Day 0): Welcome email
- Subject line + preview text
- Warm personal open
- 3 clear next steps
- Single CTA

Email 2 (Day 3): Value delivery
- Subject line + preview text
- Lead with an insight or framework
- Teach something genuinely useful
- Soft CTA

Format with **Email #1** and **Email #2** headers. Include subject lines clearly labeled.`,

    video: `${base}

Generate a complete short-form video script (45–60 seconds) for TikTok/Reels/Shorts for the given brand/brief.

Structure:
- [0:00–0:03] HOOK — First words that stop the scroll (state it)
- [0:03–0:12] AGITATE — Make the problem feel real
- [0:12–0:35] EDUCATE — The insight, framework, or reveal
- [0:35–0:50] PROOF — Result or credibility signal
- [0:50–0:60] CTA — Clear single next action

Add director notes in (parentheses) for visuals/cuts.
Also write the caption + hashtags to post with the video.`,
  }

  return specs[type] || base
}

export async function POST(req: NextRequest) {
  try {
    const { type, brand, audience, message, tone } = await req.json()

    const userPrompt = [
      brand && `Brand: ${brand}`,
      audience && `Target audience: ${audience}`,
      message && `Key message: ${message}`,
      tone && `Tone: ${tone}`,
    ]
      .filter(Boolean)
      .join("\n")

    return callAIStream({
      messages: [
        { role: "system", content: buildSystemPrompt(type as ContentType) },
        { role: "user", content: userPrompt || "Generate content for a premium agency brand." },
      ],
      maxTokens: 2000,
      temperature: 0.75,
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
}
