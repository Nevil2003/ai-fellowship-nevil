/**
 * GET /api/social/insights?platform=instagram&workspace_id=xxx
 * Fetch analytics for a specific platform
 */

import { NextRequest, NextResponse } from "next/server"
import { protectRoute } from "@/lib/api-middleware"
import { socialClient } from "@/lib/social-client"
import { getSupabase } from "@/lib/supabase"
import type { PlatformType } from "@/lib/types/social-platforms"

export async function GET(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const platform = searchParams.get("platform") as PlatformType
    const workspace_id = searchParams.get("workspace_id") || "default"

    if (!platform) {
      return NextResponse.json(
        { error: "platform parameter required" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Fetch credentials
    const { data: creds } = await supabase
      ?.from("social_credentials")
      .select("*")
      .eq("platform", platform)
      .eq("workspace_id", workspace_id)
      .single() || { data: null }

    if (!creds) {
      return NextResponse.json(
        {
          error: `No ${platform} credentials found`,
          platform,
          accounts: [],
        },
        { status: 404 }
      )
    }

    // Set credentials and fetch insights
    socialClient.setCredentials(creds)
    const insights = await socialClient.getInsights(platform)

    if (!insights) {
      return NextResponse.json(
        { error: "Failed to fetch insights", platform },
        { status: 500 }
      )
    }

    // Fetch recent posts from database
    const { data: recentPosts } = await supabase
      ?.from("social_posts")
      .select("*")
      .eq("platform", platform)
      .eq("workspace_id", workspace_id)
      .eq("status", "posted")
      .order("posted_at", { ascending: false })
      .limit(5) || { data: [] }

    return NextResponse.json({
      ok: true,
      insights,
      recent_posts: recentPosts || [],
      updated_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error("GET /api/social/insights error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch insights" },
      { status: 500 }
    )
  }
}
