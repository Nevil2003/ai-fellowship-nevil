/**
 * POST /api/social/post
 * Post content to social platforms (Instagram, X, Reddit, Substack)
 */

import { NextRequest, NextResponse } from "next/server"
import { protectRoute } from "@/lib/api-middleware"
import { socialClient } from "@/lib/social-client"
import { getSupabase } from "@/lib/supabase"
import type { CreatePostInput } from "@/lib/types/social-platforms"

export async function POST(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  try {
    const body: CreatePostInput & { workspace_id: string } = await req.json()
    const { platform, text, media_urls, scheduled_at, workspace_id } = body

    // Validate input
    if (!platform || !text) {
      return NextResponse.json(
        { error: "platform and text required" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Fetch platform credentials from database
    const { data: creds, error: credsError } = await supabase
      ?.from("social_credentials")
      .select("*")
      .eq("platform", platform)
      .eq("workspace_id", workspace_id)
      .single() || { data: null, error: new Error("No Supabase") }

    if (!creds) {
      return NextResponse.json(
        {
          error: `No ${platform} credentials configured. Connect your account in Settings.`,
        },
        { status: 403 }
      )
    }

    // Set credentials in client
    socialClient.setCredentials(creds)

    // Post to platform
    const result = await socialClient.postContent(platform, {
      text,
      media_urls,
      scheduled_at,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to post" },
        { status: 500 }
      )
    }

    // Save post record to database (if Supabase available)
    if (supabase && result.post_id) {
      await supabase.from("social_posts").insert({
        workspace_id,
        platform,
        text,
        media_urls: media_urls || [],
        status: scheduled_at ? "scheduled" : "posted",
        posted_at: scheduled_at ? null : new Date().toISOString(),
        scheduled_at: scheduled_at || null,
        url: `https://${platform}.com/posts/${result.post_id}`,
      })
    }

    return NextResponse.json(
      {
        ok: true,
        platform,
        post_id: result.post_id,
        message: `Posted to ${platform}`,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("POST /api/social/post error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to post" },
      { status: 500 }
    )
  }
}
