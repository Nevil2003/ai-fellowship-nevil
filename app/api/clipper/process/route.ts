/**
 * POST /api/clipper/process
 * Process clips - generate titles, captions, and prepare for posting
 */

import { NextRequest, NextResponse } from "next/server"
import { protectRoute, getAuthUser } from "@/lib/api-middleware"
import { createClipper } from "@/lib/clipper"
import type { ClipSegment } from "@/lib/clipper"
import { getSupabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { video_url, segments, workspace_id = "default" } = await req.json()

    if (!video_url || !segments || !Array.isArray(segments)) {
      return NextResponse.json({ error: "video_url and segments array required" }, { status: 400 })
    }

    const clipper = createClipper()
    const task = await clipper.createClipTask(video_url, segments as ClipSegment[])
    const processedTask = await clipper.processClips(task)

    const supabase = getSupabase()
    if (supabase && processedTask.status === "completed") {
      try {
        // Save clips to database
        const clipsToSave = processedTask.clips.map((clip) => ({
          workspace_id,
          user_id: user.userId,
          video_url,
          title: clip.title,
          description: clip.description,
          segment_start: clip.segment.start_time,
          segment_end: clip.segment.end_time,
          duration: clip.duration,
          status: "ready",
        }))

        await supabase.from("clips").insert(clipsToSave)
      } catch (err) {
        console.warn("Could not save clips to Supabase:", err)
      }
    }

    return NextResponse.json({
      ok: true,
      task: processedTask,
      clips: processedTask.clips,
    })
  } catch (err) {
    console.error("Process error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Processing failed" },
      { status: 500 },
    )
  }
}
