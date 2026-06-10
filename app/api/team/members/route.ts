/**
 * GET/POST /api/team/members
 * List team members and invite new ones
 */

import { NextRequest, NextResponse } from "next/server"
import { protectRoute, getAuthUser } from "@/lib/api-middleware"
import { getSupabase } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  try {
    const { searchParams } = new URL(req.url)
    const workspace_id = searchParams.get("workspace_id") || "default"

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({
        members: [
          { id: "1", name: "You", email: "user@example.com", role: "owner", accepted: true },
        ],
      })
    }

    const { data: members, error } = await supabase
      .from("workspace_members")
      .select(`
        id,
        user_id,
        role,
        accepted_at,
        users:user_id (id, email, user_metadata)
      `)
      .eq("workspace_id", workspace_id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({
      ok: true,
      members: (members || []).map((m: any) => ({
        id: m.user_id,
        name: m.users?.user_metadata?.name || m.users?.email || "Unknown",
        email: m.users?.email,
        role: m.role,
        accepted: !!m.accepted_at,
      })),
    })
  } catch (err) {
    console.error("GET /api/team/members error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch members" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const authError = await protectRoute(req)
  if (authError) return authError

  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { workspace_id, email, role } = await req.json()

    if (!email || !role) {
      return NextResponse.json(
        { error: "email and role required" },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

    // Find user by email
    const { data: users } = await supabase.auth.admin.listUsers()
    const targetUser = users?.users?.find((u) => u.email === email)

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found. They must have a Mastical account." },
        { status: 404 }
      )
    }

    // Create workspace member
    const { data: member, error } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id,
        user_id: targetUser.id,
        role,
        invited_by: user.userId,
        invited_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "User is already a member" },
          { status: 409 }
        )
      }
      throw error
    }

    // Log activity
    await supabase.from("activity_log").insert({
      workspace_id,
      user_id: user.userId,
      action_type: "invite",
      resource_type: "member",
      resource_id: targetUser.id,
      description: `Invited ${email} as ${role}`,
    })

    return NextResponse.json(
      {
        ok: true,
        member: {
          id: targetUser.id,
          name: targetUser.user_metadata?.name || email,
          email,
          role,
          accepted: false,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("POST /api/team/members error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to invite member" },
      { status: 500 }
    )
  }
}
