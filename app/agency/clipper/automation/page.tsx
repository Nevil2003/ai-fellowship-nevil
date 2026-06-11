"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ToggleRight,
  ToggleLeft,
  Play,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader,
  TrendingUp,
  Settings,
  Save,
} from "lucide-react"
import type { AutoClipperConfig, AutoClipperJob } from "@/lib/auto-clipper"

const CATEGORIES = ["trending", "sports", "tech", "entertainment", "music", "news"] as const
const PLATFORMS = ["instagram", "x", "reddit", "tiktok"] as const

export default function AutomationPage() {
  const [config, setConfig] = useState<AutoClipperConfig>({
    workspace_id: "default",
    enabled: false,
    run_daily_at: "09:00",
    categories: ["trending"],
    keywords: [],
    platforms: ["x"],
    clips_per_day: 3,
    auto_post: false,
    max_video_duration: 600,
    min_views: 100000,
  })

  const [newKeyword, setNewKeyword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [jobs, setJobs] = useState<AutoClipperJob[]>([])
  const [lastJob, setLastJob] = useState<AutoClipperJob | null>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const res = await fetch("/api/clipper/auto?workspace_id=default")
      const data = await res.json()
      if (data.ok && data.config) {
        setConfig(data.config)
      }
    } catch (err) {
      console.error("Load config error:", err)
    }
  }

  const saveConfig = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/clipper/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          config,
        }),
      })

      const data = await res.json()
      if (data.ok) {
        setConfig(data.config)
      }
    } catch (err) {
      console.error("Save error:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const triggerJob = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/clipper/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "trigger",
          config,
        }),
      })

      const data = await res.json()
      if (data.ok) {
        setLastJob(data.job)
        setJobs([data.job, ...jobs])
      }
    } catch (err) {
      console.error("Trigger error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !config.keywords.includes(newKeyword.trim())) {
      setConfig({
        ...config,
        keywords: [...config.keywords, newKeyword.trim()],
      })
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setConfig({
      ...config,
      keywords: config.keywords.filter((k) => k !== keyword),
    })
  }

  const toggleCategory = (cat: typeof CATEGORIES[number]) => {
    setConfig({
      ...config,
      categories: config.categories.includes(cat)
        ? config.categories.filter((c) => c !== cat)
        : [...config.categories, cat],
    })
  }

  const togglePlatform = (platform: typeof PLATFORMS[number]) => {
    setConfig({
      ...config,
      platforms: config.platforms.includes(platform)
        ? config.platforms.filter((p) => p !== platform)
        : [...config.platforms, platform],
    })
  }

  return (
    <div className="flex flex-col h-screen bg-[#09090f]">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/[0.06] bg-[#0a0a14]">
        <div>
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Automation Settings
          </h1>
          <p className="text-xs text-white/30 mt-0.5">Auto-fetch, clip, and post content daily</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl space-y-6">
          {/* Enable/Disable */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Enable Automation</h2>
                <p className="text-xs text-white/40 mt-1">Auto-fetch trending videos and post clips daily</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                className={`p-3 rounded-lg transition-all ${
                  config.enabled
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/[0.05] text-white/60 hover:bg-white/[0.08]"
                }`}
              >
                {config.enabled ? (
                  <ToggleRight className="w-6 h-6" />
                ) : (
                  <ToggleLeft className="w-6 h-6" />
                )}
              </button>
            </div>
          </motion.div>

          {config.enabled && (
            <>
              {/* Schedule */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-6 space-y-4"
              >
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Schedule
                </h2>

                <div>
                  <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Run Daily At (UTC)</label>
                  <input
                    type="time"
                    value={config.run_daily_at || "09:00"}
                    onChange={(e) => setConfig({ ...config, run_daily_at: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-white/[0.2]"
                  />
                </div>
              </motion.div>

              {/* Categories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-6 space-y-4"
              >
                <h2 className="text-sm font-bold text-white">Trending Categories</h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        config.categories.includes(cat)
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-white/[0.05] text-white/60 hover:bg-white/[0.08] border border-transparent"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Keywords */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-6 space-y-4"
              >
                <h2 className="text-sm font-bold text-white">Search Keywords</h2>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                    placeholder="Add keyword..."
                    className="flex-1 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/[0.2]"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-all"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {config.keywords.map((kw) => (
                    <div key={kw} className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                      <span className="text-xs text-blue-300">{kw}</span>
                      <button
                        onClick={() => removeKeyword(kw)}
                        className="text-xs text-blue-400 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Platforms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-6 space-y-4"
              >
                <h2 className="text-sm font-bold text-white">Post To Platforms</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                        config.platforms.includes(platform)
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-white/[0.05] text-white/60 hover:bg-white/[0.08] border border-transparent"
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <input
                    type="checkbox"
                    checked={config.auto_post}
                    onChange={(e) => setConfig({ ...config, auto_post: e.target.checked })}
                    id="auto_post"
                    className="w-4 h-4"
                  />
                  <label htmlFor="auto_post" className="text-xs text-white/70 cursor-pointer flex-1">
                    Auto-post clipped videos immediately
                  </label>
                </div>
              </motion.div>

              {/* Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-6 space-y-4"
              >
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Clips Per Day</label>
                    <input
                      type="number"
                      value={config.clips_per_day}
                      onChange={(e) => setConfig({ ...config, clips_per_day: parseInt(e.target.value) })}
                      min="1"
                      max="10"
                      className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-white/[0.2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Max Duration (sec)</label>
                    <input
                      type="number"
                      value={config.max_video_duration}
                      onChange={(e) => setConfig({ ...config, max_video_duration: parseInt(e.target.value) })}
                      min="60"
                      max="3600"
                      className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-white/[0.2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Min Views</label>
                    <input
                      type="number"
                      value={config.min_views}
                      onChange={(e) => setConfig({ ...config, min_views: parseInt(e.target.value) })}
                      min="1000"
                      className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-white/[0.2]"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <button
                  onClick={saveConfig}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Settings"}
                </button>

                <button
                  onClick={triggerJob}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {isLoading ? "Running..." : "Run Now"}
                </button>
              </motion.div>
            </>
          )}

          {/* Last Job Status */}
          {lastJob && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-6"
            >
              <h2 className="text-sm font-bold text-white mb-4">Last Job Status</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                  <span className="text-xs text-white/60">Status</span>
                  <div className="flex items-center gap-2">
                    {lastJob.status === "completed" && (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400">Completed</span>
                      </>
                    )}
                    {lastJob.status === "running" && (
                      <>
                        <Loader className="w-4 h-4 text-blue-400 animate-spin" />
                        <span className="text-xs font-semibold text-blue-400">Running</span>
                      </>
                    )}
                    {lastJob.status === "failed" && (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-semibold text-red-400">Failed</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white/[0.03]">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Videos Found</div>
                    <div className="text-lg font-black text-white mt-1">{lastJob.videos_found}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03]">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Clips Created</div>
                    <div className="text-lg font-black text-white mt-1">{lastJob.clips_created}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03]">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Clips Posted</div>
                    <div className="text-lg font-black text-emerald-400 mt-1">{lastJob.clips_posted}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.03]">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Success Rate</div>
                    <div className="text-lg font-black text-white mt-1">
                      {lastJob.clips_created > 0
                        ? `${Math.round((lastJob.clips_posted / lastJob.clips_created) * 100)}%`
                        : "—"}
                    </div>
                  </div>
                </div>

                {lastJob.error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400">{lastJob.error}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
