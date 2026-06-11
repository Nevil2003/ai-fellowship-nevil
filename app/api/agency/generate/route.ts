import { NextRequest } from "next/server"
import { callAIStream } from "@/lib/ai-unified"

function streamText(text: string) {
  const encoder = new TextEncoder()
  const words = text.split(/(\s+)/)
  return new Response(new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: word } }] })}\n\n`))
        await new Promise((resolve) => setTimeout(resolve, 8))
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"))
      controller.close()
    },
  }), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  })
}

function localDraft({ type, brand, audience, message, tone }: Record<string, string>) {
  const channel = type === "ads" ? "ad concept" : type === "blog" ? "blog outline" : type === "email" ? "email" : type === "video" ? "video script" : "social post"
  return `# ${brand || "Brand"} ${channel}\n\n**Audience:** ${audience || "Your target buyer"}\n**Tone:** ${tone || "Professional"}\n\n## Hook\nMost teams do not need more content. They need sharper content that earns attention before the scroll wins.\n\n## Draft\n${message || "Turn the core offer into a clear, specific story."}\n\nHere is the angle: show the pain, name the cost of waiting, then make the next step feel obvious.\n\n## CTA\nTry one focused workflow today, measure the response, and double down on the signal.\n\n_Local draft generated without an external AI key. Add AI_API_KEY or GEMINI_API_KEY for full model output._`
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const prompt = `Create ${body.type || "social"} content for:
Brand: ${body.brand || "Brand"}
Audience: ${body.audience || "Target audience"}
Message: ${body.message || "Core message"}
Tone: ${body.tone || "Professional"}

Return polished, copy-ready marketing content with a strong hook, specific proof, and CTA.`

  const ai = await callAIStream({
    messages: [
      { role: "system", content: "You are Mastical's senior content strategist. Be specific, conversion-minded, and concise." },
      { role: "user", content: prompt },
    ],
    maxTokens: 1200,
    temperature: 0.75,
  })

  if (ai.ok) return ai
  return streamText(localDraft(body))
}
