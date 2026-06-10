"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Returns a Supabase client if env vars are configured, otherwise null.
 * Propstical Canvas defaults to localStorage-only; Supabase is opt-in and
 * layered on top so the app always works even without backend credentials.
 */
let _client: SupabaseClient | null | undefined

export function getSupabase(): SupabaseClient | null {
  if (_client !== undefined) return _client
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    _client = null
    return null
  }
  _client = createClient(url, anon, {
    auth: { persistSession: true, autoRefreshToken: true },
  })
  return _client
}

export function isSupabaseEnabled(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
