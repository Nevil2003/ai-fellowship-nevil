/**
 * API Middleware for Mastical OS
 * - Session validation
 * - Simple rate limiting (in-memory)
 * - Error handling
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 60 // requests per window

/**
 * Simple in-memory rate limiter
 * Key format: "{userId}:{endpoint}"
 */
export function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

/**
 * Get authenticated user from request
 * Checks Authorization header (Bearer token) or Supabase session cookie
 */
export async function getAuthUser(req: NextRequest): Promise<{ userId: string } | null> {
  // Check Authorization header
  const auth = req.headers.get("authorization")
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7)
    // In a real app, verify JWT here. For now, accept any token.
    // TODO: Implement proper JWT verification
    return { userId: "anonymous" }
  }

  // Try to get user from Supabase session (requires NEXT_PUBLIC_SUPABASE_URL)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    // No Supabase configured, allow anonymous
    return { userId: "anonymous" }
  }

  try {
    const supabase = createClient(url, anonKey)
    const cookie = req.cookies.get("sb-auth-token")?.value
    if (cookie) {
      const { data } = await supabase.auth.getUser(cookie)
      if (data.user) {
        return { userId: data.user.id }
      }
    }
  } catch (err) {
    console.warn("Failed to verify Supabase session:", err)
  }

  // Fallback: anonymous user
  return { userId: "anonymous" }
}

/**
 * Middleware: Protect route and apply rate limiting
 */
export async function protectRoute(req: NextRequest): Promise<NextResponse | null> {
  const user = await getAuthUser(req)

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Rate limiting key: userId + endpoint path
  const path = new URL(req.url).pathname
  const rateLimitKey = `${user.userId}:${path}`

  if (!checkRateLimit(rateLimitKey)) {
    return new NextResponse(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Attach user info to request (custom header for passing to handlers)
  // Note: Next.js Request is immutable, so we return the user separately
  return null
}

/**
 * Error response helper
 */
export function errorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json(
    { error: message },
    { status }
  )
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    { ok: true, data },
    { status }
  )
}
