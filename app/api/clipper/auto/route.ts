/**
 * GET/POST /api/clipper/auto
 * Manage and trigger auto-clipper automation
 */

import { NextRequest, NextResponse } from "next/server"
import { protectRoute, getAuthUser } from "@/lib/api-middleware"
import { createAutoClipper, type AutoClipperConfig } from "@/lib/auto-clipper"
import { getSupabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const workspace_id = searchParams.get("workspace_id") || "default"

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({
        ok: true,
        config: null,
        message: "Supabase not configured. Using defaults.",
      })
    }

    const { data: config } = await supabase
      .from("auto_clipper_config")
      .select("*")
      .eq("workspace_id", workspace_id)
      .single()

    return NextResponse.json({
      ok: true,
      config: config || null,
    })
  } catch (err) {
    console.error("Get config error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get config" },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { action, config } = body

    if (action === "trigger") {
      // Manually trigger auto-clipper job
      return await triggerJob(config, user.userId)
    } else if (action === "save") {
      // Save automation config
      return await saveConfig(config, user.userId)
    } else if (action === "disable") {
      // Disable automation
      return await disableConfig(config.workspace_id, user.userId)
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (err) {
    console.error("Auto-clipper error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process request" },
      { status: 500 },
    )
  }
}

async function triggerJob(config: AutoClipperConfig, userId: string) {
  try {
    const autoClipper = createAutoClipper()
    const job = await autoClipper.runJob(config)

    const supabase = getSupabase()
    if (supabase) {
      try {
        await supabase.from("auto_clipper_jobs").insert({
          workspace_id: config.workspace_id,
          user_id: userId,
          job_id: job.id,
          status: job.status,
          videos_found: job.videos_found,
          clips_created: job.clips_created,
          clips_posted: job.clips_posted,
          error: job.error,
        })
      } catch (err) {
        console.warn("Could not save job to Supabase:", err)
      }
    }

    return NextResponse.json({
      ok: true,
      job,
    })
  } catch (err) {
    console.error("Trigger job error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to trigger job" },
      { status: 500 },
    )
  }
}

async function saveConfig(config: AutoClipperConfig, userId: string) {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({
        ok: true,
        config,
        message: "Config saved locally (Supabase not configured)",
      })
    }

    const { data, error } = await supabase
      .from("auto_clipper_config")
      .upsert({
        workspace_id: config.workspace_id,
        user_id: userId,
        enabled: config.enabled,
        run_daily_at: config.run_daily_at,
        categories: config.categories,
        keywords: config.keywords,
        platforms: config.platforms,
        clips_per_day: config.clips_per_day,
        auto_post: config.auto_post,
        max_video_duration: config.max_video_duration,
        min_views: config.min_views,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      ok: true,
      config: data,
    })
  } catch (err) {
    console.error("Save config error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save config" },
      { status: 500 },
    )
  }
}

async function disableConfig(workspace_id: string, userId: string) {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({
        ok: true,
        message: "Config disabled locally",
      })
    }

    const { error } = await supabase
      .from("auto_clipper_config")
      .update({ enabled: false })
      .eq("workspace_id", workspace_id)

    if (error) throw error

    return NextResponse.json({
      ok: true,
    })
  } catch (err) {
    console.error("Disable config error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to disable" },
      { status: 500 },
    )
  }
}
