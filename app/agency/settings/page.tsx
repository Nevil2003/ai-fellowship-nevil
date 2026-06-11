"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  CheckCircle2,
  Database,
  Loader2,
  Save,
  Server,
  Settings,
  Sparkles,
  User,
  XCircle,
  Youtube,
} from "lucide-react"
import { getSettings, saveSettings, type LocalSettings } from "@/lib/local-stats"

const TONES = ["Professional", "Bold & Energetic", "Casual & Friendly", "Inspirational", "Witty", "Urgent"]

interface SystemStatus {
  ai: { openrouter: boolean; gemini: boolean; ready: boolean; model: string | null }
  supabase: boolean
  youtube: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<LocalSettings | null>(null)
  const [saved, setSaved] = useState(false)
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)

  useEffect(() => {
    setSettings(getSettings())
    fetch("/api/agency/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setStatusLoading(false))
  }, [])

  const update = (patch: Partial<LocalSettings>) => {
    setSettings((current) => (current ? { ...current, ...patch } : current))
    setSaved(false)
  }

  const save = () => {
    if (!settings) return
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!settings) return null

  return (
    <div className="min-h-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-violet-400" />
          Settings
        </h1>
        <p className="text-xs text-white/30 mt-0.5">Workspace preferences and system status</p>
      </motion.div>

      <section className="mb-6 p-5 rounded-xl border border-white/[0.06] bg-[#0f0f1a]">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-violet-400" />
          Profile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-white/40 font-medium mb-1.5">Your name</label>
            <input
              value={settings.userName}
              onChange={(event) => update({ userName: event.target.value })}
              placeholder="Admin"
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] text-white/40 font-medium mb-1.5">Workspace name</label>
            <input
              value={settings.workspaceName}
              onChange={(event) => update({ workspaceName: event.target.value })}
              placeholder="My Workspace"
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors"
            />
          </div>
        </div>
      </section>

      <section className="mb-6 p-5 rounded-xl border border-white/[0.06] bg-[#0f0f1a]">
        <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          Content defaults
        </h2>
        <p className="text-[11px] text-white/30 mb-4">Pre-fills Content Studio and Reputation scans.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-white/40 font-medium mb-1.5">Default brand</label>
            <input
              value={settings.defaultBrand}
              onChange={(event) => update({ defaultBrand: event.target.value })}
              placeholder="e.g. Mastical"
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] text-white/40 font-medium mb-1.5">Default audience</label>
            <input
              value={settings.defaultAudience}
              onChange={(event) => update({ defaultAudience: event.target.value })}
              placeholder="e.g. DTC founders, 25-40"
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-white/40 font-medium mb-1.5">Default tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((tone) => (
                <button
                  key={tone}
                  onClick={() => update({ defaultTone: tone })}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    settings.defaultTone === tone
                      ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                      : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 p-5 rounded-xl border border-white/[0.06] bg-[#0f0f1a]">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          System status
        </h2>
        {statusLoading ? (
          <div className="flex items-center gap-2 text-xs text-white/30">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Checking configuration...
          </div>
        ) : status ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-white/60">AI engine</span>
              {status.ai.ready ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 text-right">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected{status.ai.model ? ` - ${status.ai.model}` : ""}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-red-400 text-right">
                  <XCircle className="w-3.5 h-3.5" />
                  Not configured - set AI_API_KEY or GEMINI_API_KEY
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-white/60 flex items-center gap-1.5">
                <Database className="w-3 h-3 text-white/30" />
                Database persistence
              </span>
              {status.supabase ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected
                </span>
              ) : (
                <span className="text-xs text-white/30 text-right">Local mode - data stays in this browser</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-white/60 flex items-center gap-1.5">
                <Youtube className="w-3 h-3 text-white/30" />
                YouTube search automation
              </span>
              {status.youtube ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected
                </span>
              ) : (
                <span className="text-xs text-white/30 text-right">Manual clipper only - set YOUTUBE_API_KEY for search</span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-white/30">Could not reach status endpoint.</p>
        )}
      </section>

      <button
        onClick={save}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-500 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-violet-500/20"
      >
        {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? "Saved" : "Save changes"}
      </button>
    </div>
  )
}
