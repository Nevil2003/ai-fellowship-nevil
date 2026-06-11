/**
 * Lightweight local activity log + usage stats for Mastical OS.
 * Stored in localStorage so the dashboard reflects what the user
 * actually did (generated content, scored content, chat sessions)
 * instead of hardcoded demo numbers.
 */

export type ActivityKind = "generate" | "score" | "chat" | "campaign" | "publish" | "reputation"

export interface ActivityEvent {
  kind: ActivityKind
  message: string
  ts: number // epoch ms
  score?: number
}

const KEY = "mastical:activity"
const MAX_EVENTS = 50

function safeParse(raw: string | null): ActivityEvent[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function getActivity(): ActivityEvent[] {
  if (typeof window === "undefined") return []
  return safeParse(window.localStorage.getItem(KEY))
}

export function logActivity(event: Omit<ActivityEvent, "ts">) {
  if (typeof window === "undefined") return
  const events = getActivity()
  events.unshift({ ...event, ts: Date.now() })
  window.localStorage.setItem(KEY, JSON.stringify(events.slice(0, MAX_EVENTS)))
  // Let any open dashboard update live
  window.dispatchEvent(new CustomEvent("mastical:activity"))
}

export interface UsageStats {
  contentGenerated: number
  scoresRun: number
  chatSessions: number
  avgNeuralScore: number | null
  thisWeek: { generated: number; scored: number }
}

export function getStats(): UsageStats {
  const events = getActivity()
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const scores = events.filter((e) => typeof e.score === "number").map((e) => e.score as number)
  return {
    contentGenerated: events.filter((e) => e.kind === "generate").length,
    scoresRun: events.filter((e) => e.kind === "score").length,
    chatSessions: events.filter((e) => e.kind === "chat").length,
    avgNeuralScore: scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null,
    thisWeek: {
      generated: events.filter((e) => e.kind === "generate" && e.ts > weekAgo).length,
      scored: events.filter((e) => e.kind === "score" && e.ts > weekAgo).length,
    },
  }
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

/** Settings stored locally (defaults used to prefill Studio & Chat) */
export interface LocalSettings {
  workspaceName: string
  userName: string
  defaultBrand: string
  defaultAudience: string
  defaultTone: string
}

const SETTINGS_KEY = "mastical:settings"

export function getSettings(): LocalSettings {
  const fallback: LocalSettings = {
    workspaceName: "My Workspace",
    userName: "Admin",
    defaultBrand: "",
    defaultAudience: "",
    defaultTone: "Professional",
  }
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

export function saveSettings(settings: LocalSettings) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  window.dispatchEvent(new CustomEvent("mastical:settings"))
}
