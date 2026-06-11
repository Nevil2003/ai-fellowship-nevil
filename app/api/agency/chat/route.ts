import { NextRequest } from "next/server"
import { callAIStream } from "@/lib/ai-unified"

function streamText(text: string) {
  const encoder = new TextEncoder()
  const chunks = text.split(/(\s+)/)
  return new Response(new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`))
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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const messages = Array.isArray(body.messages) ? body.messages : []
  const ai = await callAIStream({
    messages: [
      { role: "system", content: "You are Mastical's strategic AI consultant for agencies, founders, and content teams. Give sharp, practical strategy with clear next steps." },
      ...messages,
    ],
    maxTokens: 1600,
    temperature: 0.7,
  })

  if (ai.ok) return ai

  const last = messages[messages.length - 1]?.content || "the project"
  return streamText(`Here is the practical path I would take:\n\n1. Clarify the buyer and the painful moment they are in.\n2. Turn the offer into one measurable promise.\n3. Create three content angles: pain, proof, and process.\n4. Score each draft before publishing, then reuse the winner across channels.\n\nFor this prompt: "${String(last).slice(0, 180)}", start by writing the exact customer sentence you want someone to say after seeing the campaign. That sentence becomes the north star for the brief.\n\n_Local consultant fallback active. Add AI_API_KEY or GEMINI_API_KEY for full model output._`)
}
