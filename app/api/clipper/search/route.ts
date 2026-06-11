/**
 * POST /api/clipper/search
 * Search trending videos by category or keyword
 */

import { NextRequest, NextResponse } from "next/server"
import { protectRoute } from "@/lib/api-middleware"
import { createVideoClient } from "@/lib/video-client"
import type { VideoCategory } from "@/lib/video-client"

export async function POST(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  try {
    const { type, query, category, limit = 10 } = await req.json()

    if (!type || !["trending", "keyword"].includes(type)) {
      return NextResponse.json(
        { error: "type must be 'trending' or 'keyword'" },
        { status: 400 },
      )
    }

    const client = createVideoClient()
    let result

    if (type === "trending") {
      if (!category || !["trending", "sports", "tech", "entertainment", "music", "news"].includes(category)) {
        return NextResponse.json(
          { error: "valid category required: trending, sports, tech, entertainment, music, news" },
          { status: 400 },
        )
      }
      result = await client.searchTrending(category as VideoCategory, limit)
    } else {
      if (!query || query.length < 2) {
        return NextResponse.json({ error: "query must be at least 2 characters" }, { status: 400 })
      }
      result = await client.searchByKeyword(query, limit)
    }

    return NextResponse.json({
      ok: true,
      type,
      ...result,
    })
  } catch (err) {
    console.error("Search error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "trending"
    const category = searchParams.get("category") || "trending"
    const query = searchParams.get("q")
    const limit = parseInt(searchParams.get("limit") || "10")

    if (type === "keyword" && !query) {
      return NextResponse.json({ error: "query parameter required for keyword search" }, { status: 400 })
    }

    const client = createVideoClient()
    let result

    if (type === "trending") {
      result = await client.searchTrending(category as VideoCategory, limit)
    } else {
      result = await client.searchByKeyword(query || "", limit)
    }

    return NextResponse.json({
      ok: true,
      type,
      ...result,
    })
  } catch (err) {
    console.error("Search error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Search failed" },
      { status: 500 },
    )
  }
}
