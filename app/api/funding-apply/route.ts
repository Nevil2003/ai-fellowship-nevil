import { NextRequest, NextResponse } from "next/server"
import { PROPSTICAL_CONTEXT } from "@/lib/funding-programs"

export async function POST(req: NextRequest) {
  try {
    const { programName, programType, question, questionId, apiKey, modelId, provider, customBaseUrl } = await req.json()

    if (!apiKey) {
      return NextResponse.json({ error: "No API key provided" }, { status: 400 })
    }

    const systemPrompt = `You are an expert startup advisor and grant writer helping Propstical apply for funding programs.

Here is everything about Propstical:
- Company: ${PROPSTICAL_CONTEXT.company}
- Tagline: ${PROPSTICAL_CONTEXT.tagline}
- Problem: ${PROPSTICAL_CONTEXT.problem}
- Solution: ${PROPSTICAL_CONTEXT.solution}
- Market: ${PROPSTICAL_CONTEXT.market}
- Traction: ${PROPSTICAL_CONTEXT.traction}
- Tech Stack: ${PROPSTICAL_CONTEXT.techStack}
- Business Model: ${PROPSTICAL_CONTEXT.businessModel}
- Vision: ${PROPSTICAL_CONTEXT.vision}
- Raise: ${PROPSTICAL_CONTEXT.raise}
- Team: ${PROPSTICAL_CONTEXT.team}

WRITING RULES:
- Write in first-person as the founder (Nevil Parekh)
- Be specific, concrete, and honest — no fluff or buzzwords
- Use numbers and specifics wherever possible
- Tailor the answer to what ${programName} (${programType}) values most
- Keep answers within the requested word count
- Sound human, direct, and passionate — not like a brochure
- Avoid starting with "I" as the very first word when possible
- End with something memorable or forward-looking when appropriate`

    const userPrompt = `Program: ${programName}
Question: ${question}

Write a compelling, honest, and tailored answer to this specific question for ${programName}.
The answer should reflect Propstical's unique positioning as India's first AI home decision canvas.
Focus on what makes this answer resonate specifically with ${programName}'s thesis and values.
Return only the answer text — no preamble, no labels, no formatting headers.`

    const baseUrl = customBaseUrl?.trim() || getBaseUrl(provider)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    }
    if (provider === "openrouter") {
      headers["HTTP-Referer"] = "https://propstical.com"
      headers["X-Title"] = "Propstical Funding Agent"
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: `AI API error: ${err}` }, { status: 500 })
    }

    const data = await response.json()
    const answer = data.choices?.[0]?.message?.content?.trim() || ""

    return NextResponse.json({ answer, questionId })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

function getBaseUrl(provider: string): string {
  if (provider === "openai") return "https://api.openai.com/v1"
  if (provider === "zai") return "https://api.z.ai/api/paas/v4"
  return "https://openrouter.ai/api/v1"
}
