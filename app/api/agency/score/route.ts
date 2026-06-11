import { NextRequest, NextResponse } from "next/server"

function clamp(value: number, min = 0, max = 99) {
  return Math.max(min, Math.min(max, value))
}

function scoreContent(content: string) {
  const len = content.length
  const hasEmoji = /\p{Emoji}/u.test(content)
  const hasNumber = /\d/.test(content)
  const hasBullets = /[->*•-]/u.test(content)
  const hasQuestion = /\?/.test(content)
  const hasCTA = /dm|click|link|cta|free|now|today|start|book|try|download/i.test(content)
  const hasSpecificity = /\b\d+(\.\d+)?%|\$\d+|\b\d+x\b|\b\d+\s?(days|hours|weeks)\b/i.test(content)

  const base = 58
  const boost =
    (hasEmoji ? 5 : 0) +
    (hasNumber ? 5 : 0) +
    (hasBullets ? 4 : 0) +
    (hasQuestion ? 4 : 0) +
    (hasCTA ? 7 : 0) +
    (hasSpecificity ? 6 : 0) +
    Math.min(Math.floor(len / 90), 8)

  const overall = clamp(base + boost)
  const dimensions = {
    emotionalResonance: clamp(overall + (hasQuestion ? 4 : -3)),
    visualAttention: clamp(overall + (hasBullets || hasEmoji ? 5 : -5)),
    cognitiveLoad: clamp(88 - Math.max(0, Math.floor(len / 90) - 4) * 4, 45, 99),
    memorability: clamp(overall + (hasSpecificity ? 5 : -4)),
    intentAlignment: clamp(overall + (hasCTA ? 6 : -8)),
    urgency: clamp(overall + (/now|today|limited|deadline|last/i.test(content) ? 7 : -6)),
  }
  const verdict = overall >= 85 ? "excellent" : overall >= 72 ? "strong" : overall >= 58 ? "average" : "weak"

  return {
    overall,
    label: verdict === "excellent" ? "Excellent" : verdict === "strong" ? "Strong" : verdict === "average" ? "Average" : "Weak",
    dimensions,
    strengths: [
      hasSpecificity ? "Specific proof points make the claim easier to believe." : null,
      hasCTA ? "The call to action is clear enough to convert attention." : null,
      hasBullets || hasEmoji ? "The structure is scannable and visually varied." : null,
    ].filter(Boolean),
    recommendations: [
      !hasQuestion ? { text: "Add a question or tension line near the hook.", impact: "Medium" } : null,
      !hasSpecificity ? { text: "Add a concrete number, outcome, timeframe, or named proof point.", impact: "High" } : null,
      !hasCTA ? { text: "End with one specific next step.", impact: "High" } : null,
      dimensions.cognitiveLoad < 70 ? { text: "Shorten the middle section to reduce cognitive load.", impact: "Medium" } : null,
    ].filter(Boolean),
    heatmapZones: [
      { label: "Hook", intensity: "high", x: 20, y: 15 },
      { label: "Proof", intensity: hasSpecificity ? "high" : "medium", x: 70, y: 60 },
      { label: "CTA", intensity: hasCTA ? "high" : "low", x: 50, y: 88 },
      { label: "Body", intensity: "medium", x: 40, y: 45 },
    ],
    verdict,
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const content = String(body.content || "")
  if (!content.trim()) return NextResponse.json({ error: "Content is required" }, { status: 400 })
  return NextResponse.json(scoreContent(content))
}
