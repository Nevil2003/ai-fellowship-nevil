import { NextResponse } from "next/server"

/**
 * GET /api/agency/status
 * Reports which backend integrations are configured.
 * Returns booleans only — never the keys themselves.
 */
export async function GET() {
  const openrouter = !!process.env.AI_API_KEY && process.env.AI_API_KEY !== "YOUR_KEY_HERE"
  const gemini = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_KEY_HERE"
  return NextResponse.json({
    ai: {
      openrouter,
      gemini,
      ready: openrouter || gemini,
      model: openrouter ? process.env.AI_MODEL || "anthropic/claude-sonnet-4.5" : gemini ? "gemini-2.0-flash" : null,
    },
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}
