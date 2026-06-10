import { NextRequest, NextResponse } from "next/server"
import { callAIJSON } from "@/lib/agency-ai"

const SCORE_SYSTEM = `You are a neuromarketing content analyst trained on Meta TRIBE v2 research, attention science, and persuasion psychology. Analyze content for neural engagement potential.

Respond ONLY with valid JSON matching this exact schema (no markdown, no explanation outside JSON):

{
  "overall": <number 0-100>,
  "label": <"Excellent" | "Strong" | "Good" | "Fair" | "Weak">,
  "dimensions": {
    "emotionalResonance": <number 0-100>,
    "visualAttention": <number 0-100>,
    "cognitiveLoad": <number 0-100>,
    "memorability": <number 0-100>,
    "intentAlignment": <number 0-100>,
    "urgencySignal": <number 0-100>
  },
  "strengths": [<string>, <string>],
  "recommendations": [
    { "priority": <1|2|3>, "action": <string>, "impact": <"High"|"Medium"|"Low"> },
    { "priority": <1|2|3>, "action": <string>, "impact": <"High"|"Medium"|"Low"> },
    { "priority": <1|2|3>, "action": <string>, "impact": <"High"|"Medium"|"Low"> }
  ],
  "heatmap": {
    "opening": <"high"|"medium"|"low">,
    "middle": <"high"|"medium"|"low">,
    "closing": <"high"|"medium"|"low">
  }
}

Scoring guide:
- emotionalResonance: Does it trigger a feeling? Fear, excitement, curiosity, belonging?
- visualAttention: If rendered as an ad, would the eye stop? Strong first line = high score.
- cognitiveLoad: Lower = easier to process = higher score. Simple, scannable = 80+.
- memorability: Will this stick 24 hours later? Concrete specifics score higher than abstractions.
- intentAlignment: Does the content match what someone in a buying mindset needs to hear?
- urgencySignal: Is there a reason to act now? Scarcity, time, social proof = higher score.

Be accurate. Do not inflate scores. A generic piece of copy should score 45-60. Only exceptional content scores 90+.`

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json()

    if (!content || typeof content !== "string" || content.trim().length < 20) {
      return NextResponse.json({ error: "Content too short to analyze" }, { status: 400 })
    }

    const result = await callAIJSON({
      messages: [
        { role: "system", content: SCORE_SYSTEM },
        { role: "user", content: `Analyze this content:\n\n${content.slice(0, 3000)}` },
      ],
      maxTokens: 600,
      temperature: 0.2,
      jsonMode: true,
    })

    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
