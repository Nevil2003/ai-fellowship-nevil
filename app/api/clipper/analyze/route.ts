/**
 * POST /api/clipper/analyze
 * Analyze video and generate clip segments using AI
 */

import { NextRequest, NextResponse } from "next/server"
import { protectRoute, getAuthUser } from "@/lib/api-middleware"
import { createClipper } from "@/lib/clipper"
import { getSupabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { video_url, video_title, video_description, video_duration, workspace_id = "default" } = await req.json()

    if (!video_url || !video_title || !video_duration) {
      return NextResponse.json(
        { error: "video_url, video_title, and video_duration required" },
        { status: 400 },
      )
    }

    const clipper = createClipper()
    const segments = await clipper.generateClipSegments(video_title, video_description || "", video_duration)

    const clipTask = await clipper.createClipTask(video_url, segments)

    const supabase = getSupabase()
    if (supabase) {
      try {
        await supabase.from("clip_tasks").insert({
          workspace_id,
          user_id: user.userId,
          video_url,
          title: video_title,
          segments: segments,
          status: "pending",
        })
      } catch (err) {
        console.warn("Could not save to Supabase:", err)
      }
    }

    return NextResponse.json({
      ok: true,
      task: clipTask,
      segments,
    })
  } catch (err) {
    console.error("Analyze error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 },
    )
  }
}
