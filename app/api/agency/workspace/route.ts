/**
 * /api/agency/workspace
 * Workspace management endpoint for campaigns, content, and team
 */

import { NextRequest, NextResponse } from "next/server"
import { protectRoute, getAuthUser, errorResponse, successResponse } from "@/lib/api-middleware"
import { getSupabase } from "@/lib/supabase"
import {
  CreateCampaignSchema,
  CreateBrandProfileSchema,
  type Campaign,
  type BrandProfile,
} from "@/lib/types/agency"

// In-memory fallback when Supabase is not configured
const memoryWorkspaces = new Map<string, any>()

/**
 * GET /api/agency/workspace
 * Returns workspace metadata, campaigns, and content summary
 */
export async function GET(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  const user = await getAuthUser(req)
  if (!user) return errorResponse("Unauthorized", 401)

  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get("workspace_id") || "default"

  try {
    const supabase = getSupabase()

    if (!supabase) {
      // Fallback: return mock workspace data
      const workspace = memoryWorkspaces.get(workspaceId) || {
        id: workspaceId,
        name: "My Workspace",
        created_at: new Date().toISOString(),
        campaigns: [],
        brand_profile: null,
      }
      return successResponse(workspace)
    }

    // Fetch workspace
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .eq("user_id", user.userId)
      .single()

    if (!workspace) {
      return errorResponse("Workspace not found", 404)
    }

    // Fetch campaigns
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })

    // Fetch brand profile
    const { data: brandProfile } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("workspace_id", workspaceId)
      .single()

    // Count content by status
    const { data: contentStats } = await supabase
      .from("content")
      .select("status", { count: "exact", head: false })
      .eq("workspace_id", workspaceId)

    const stats = {
      total_content: contentStats?.length || 0,
      draft_content: contentStats?.filter((c: any) => c.status === "draft").length || 0,
      published_content: contentStats?.filter((c: any) => c.status === "published").length || 0,
    }

    return successResponse({
      workspace,
      campaigns: campaigns || [],
      brand_profile: brandProfile || null,
      stats,
    })
  } catch (err) {
    console.error("GET /api/agency/workspace error:", err)
    return errorResponse("Failed to fetch workspace", 500)
  }
}

/**
 * POST /api/agency/workspace/campaign
 * Create a new campaign
 */
export async function POST(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  const user = await getAuthUser(req)
  if (!user) return errorResponse("Unauthorized", 401)

  try {
    const body = await req.json()
    const { workspace_id, ...campaignData } = body

    // Validate input
    const parsed = CreateCampaignSchema.safeParse(campaignData)
    if (!parsed.success) {
      return errorResponse(`Validation error: ${parsed.error.message}`, 400)
    }

    const workspaceId = workspace_id || "default"
    const supabase = getSupabase()

    if (!supabase) {
      // Fallback: store in memory
      const campaign = {
        id: Math.random().toString(36).substr(2, 9),
        workspace_id: workspaceId,
        ...parsed.data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const workspace = memoryWorkspaces.get(workspaceId) || { campaigns: [] }
      workspace.campaigns = [...(workspace.campaigns || []), campaign]
      memoryWorkspaces.set(workspaceId, workspace)

      return successResponse(campaign, 201)
    }

    // Verify workspace exists
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("id", workspaceId)
      .eq("user_id", user.userId)
      .single()

    if (!workspace) {
      return errorResponse("Workspace not found", 404)
    }

    // Insert campaign
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .insert({
        workspace_id: workspaceId,
        ...parsed.data,
      })
      .select()
      .single()

    if (error) {
      console.error("Campaign insert error:", error)
      return errorResponse("Failed to create campaign", 500)
    }

    return successResponse(campaign, 201)
  } catch (err) {
    console.error("POST /api/agency/workspace error:", err)
    return errorResponse("Failed to create campaign", 500)
  }
}

/**
 * PUT /api/agency/workspace
 * Update workspace settings or brand profile
 */
export async function PUT(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  const user = await getAuthUser(req)
  if (!user) return errorResponse("Unauthorized", 401)

  try {
    const body = await req.json()
    const { workspace_id, type, ...updateData } = body

    if (!type) {
      return errorResponse("type field required (brand_profile|workspace)", 400)
    }

    const workspaceId = workspace_id || "default"
    const supabase = getSupabase()

    if (!supabase) {
      // Fallback: update in memory
      const workspace = memoryWorkspaces.get(workspaceId) || {}
      if (type === "brand_profile") {
        workspace.brand_profile = { ...workspace.brand_profile, ...updateData }
      } else if (type === "workspace") {
        Object.assign(workspace, updateData)
      }
      memoryWorkspaces.set(workspaceId, workspace)
      return successResponse(workspace)
    }

    if (type === "brand_profile") {
      const parsed = CreateBrandProfileSchema.safeParse(updateData)
      if (!parsed.success) {
        return errorResponse(`Validation error: ${parsed.error.message}`, 400)
      }

      const { data: profile, error } = await supabase
        .from("brand_profiles")
        .upsert({
          workspace_id: workspaceId,
          ...parsed.data,
        })
        .select()
        .single()

      if (error) {
        console.error("Brand profile upsert error:", error)
        return errorResponse("Failed to update brand profile", 500)
      }

      return successResponse(profile)
    }

    if (type === "workspace") {
      const { data: workspace, error } = await supabase
        .from("workspaces")
        .update(updateData)
        .eq("id", workspaceId)
        .eq("user_id", user.userId)
        .select()
        .single()

      if (error) {
        console.error("Workspace update error:", error)
        return errorResponse("Failed to update workspace", 500)
      }

      return successResponse(workspace)
    }

    return errorResponse("Invalid type parameter", 400)
  } catch (err) {
    console.error("PUT /api/agency/workspace error:", err)
    return errorResponse("Failed to update workspace", 500)
  }
}
