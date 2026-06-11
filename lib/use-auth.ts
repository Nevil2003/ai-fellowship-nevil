"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { getSupabase } from "./supabase"

/**
 * Minimal auth hook for Propstical Canvas.
 * Returns null when Supabase is not configured — callers should fall
 * back to anonymous / localStorage-only mode in that case.
 */
export function useAuth(): {
  user: User | null
  isLoading: boolean
  isEnabled: boolean
  signInWithEmail: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
} {
  const supabase = getSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(!!supabase)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      setIsLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [supabase])

  return {
    user,
    isLoading,
    isEnabled: !!supabase,
    async signInWithEmail(email) {
      if (!supabase) return { error: "Supabase not configured" }
      const { error } = await supabase.auth.signInWithOtp({ email })
      return { error: error?.message ?? null }
    },
    async signOut() {
      if (supabase) await supabase.auth.signOut()
    },
  }
}
