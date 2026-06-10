/**
 * Per-phone-number conversation store for the WhatsApp bot.
 *
 * Primary path: Supabase (if NEXT_PUBLIC_SUPABASE_URL + a service-role
 * key are set).  Fallback: in-memory Map (fine for dev, lost on redeploy).
 *
 * We cap history at the last 30 turns to keep token spend sane.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { BotMessage } from "./bot-brain"

const MAX_HISTORY = 30

// ── Supabase (server, service role) ─────────────────────────────────
let _admin: SupabaseClient | null | undefined
function getAdmin(): SupabaseClient | null {
  if (_admin !== undefined) return _admin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { _admin = null; return null }
  _admin = createClient(url, key, { auth: { persistSession: false } })
  return _admin
}

// ── In-memory fallback ──────────────────────────────────────────────
const memory = new Map<string, BotMessage[]>()

// ── API ─────────────────────────────────────────────────────────────
export async function getHistory(phone: string): Promise<BotMessage[]> {
  const admin = getAdmin()
  if (!admin) return memory.get(phone) ?? []

  const { data, error } = await admin
    .from("bot_turns")
    .select("role, text, images")
    .eq("phone", phone)
    .order("created_at", { ascending: true })
    .limit(MAX_HISTORY)
  if (error) {
    console.error("getHistory supabase err:", error.message)
    return memory.get(phone) ?? []
  }
  return (data ?? []).map(r => ({
    role: r.role as BotMessage["role"],
    text: r.text ?? "",
    images: r.images ?? undefined,
  }))
}

export async function appendTurn(phone: string, turn: BotMessage): Promise<void> {
  const admin = getAdmin()
  if (!admin) {
    const prev = memory.get(phone) ?? []
    memory.set(phone, [...prev, turn].slice(-MAX_HISTORY))
    return
  }
  const { error } = await admin.from("bot_turns").insert({
    phone,
    role: turn.role,
    text: turn.text,
    images: turn.images ?? null,
  })
  if (error) console.error("appendTurn supabase err:", error.message)
}

export async function resetPhone(phone: string): Promise<void> {
  memory.delete(phone)
  const admin = getAdmin()
  if (admin) {
    const { error } = await admin.from("bot_turns").delete().eq("phone", phone)
    if (error) console.error("resetPhone supabase err:", error.message)
  }
}
