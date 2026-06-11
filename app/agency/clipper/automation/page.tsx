"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ToggleRight,
  ToggleLeft,
  Play,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader,
  TrendingUp,
  Settings,
  Save,
  Plus,
  X,
  Sparkles,
} from "lucide-react"

const CATEGORIES = ["trending", "sports", "tech", "entertainment", "music", "news"] as const
const PLATFORMS = ["instagram", "x", "reddit", "tiktok"] as const

interface AutoClipperConfig {
  workspace_id: string
  enabled: boolean
  run_daily_at: string
  categories: string[]
  keywords: string[]
  platforms: string[]
  clips_per_day: number
  auto_post: boolean
  max_video_duration: number
  min_views: number
}

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
  const [isSaving, setIsSaving] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [lastJob, setLastJob] = useState<any>(null)

  const saveConfig = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/clipper/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", config }),
      })
      const data = await res.json()
      if (data.ok) {
        // Success toast would go here
      }
    } catch (err) {
      console.error("Save error:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const runNow = async () => {
    setIsRunning(true)
    try {
      const res = await fetch("/api/clipper/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger", config }),
      })
      const data = await res.json()
      if (data.ok) {
        setLastJob(data.job)
      }
    } catch (err) {
      console.error("Run error:", err)
    } finally {
      setIsRunning(false)
    }
  }

  const toggleCategory = (cat: string) => {
    setConfig({
      ...config,
      categories: config.categories.includes(cat)
        ? config.categories.filter((c) => c !== cat)
        : [...config.categories, cat],
    })
  }

  const togglePlatform = (platform: string) => {
    setConfig({
      ...config,
      platforms: config.platforms.includes(platform)
        ? config.platforms.filter((p) => p !== platform)
        : [...config.platforms, platform],
    })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-40"
        >
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl blur opacity-75" />
                  <div className="relative bg-black rounded-xl p-3">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Auto-Clipper
                  </h1>
                  <p className="text-xs text-white/50 mt-1">Automated video discovery & clipping</p>
                </div>
              </div>

              <motion.button
                onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-4 rounded-xl transition-all ${
                  config.enabled
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/50"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {config.enabled ? (
                  <ToggleRight className="w-6 h-6 text-white" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-white" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
          {config.enabled ? (
            <>
              {/* Schedule */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-purple-900/50 border border-purple-500/20 p-8 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Schedule</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-3">Daily Run Time (UTC)</label>
                    <input
                      type="time"
                      value={config.run_daily_at}
                      onChange={(e) => setConfig({ ...config, run_daily_at: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500/50 transition-all backdrop-blur-sm text-lg font-semibold"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Categories */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-purple-900/50 border border-purple-500/20 p-8 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Trending Categories</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all capitalize text-sm ${
                        config.categories.includes(cat)
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                          : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
                      }`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Keywords */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-purple-900/50 border border-purple-500/20 p-8 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Search Keywords</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                      placeholder="Add keyword..."
                      className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all backdrop-blur-sm"
                    />
                    <motion.button
                      onClick={addKeyword}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {config.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                      {config.keywords.map((kw) => (
                        <motion.div
                          key={kw}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/50"
                        >
                          <span className="text-sm text-purple-300">{kw}</span>
                          <button
                            onClick={() => removeKeyword(kw)}
                            className="text-purple-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Platforms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-purple-900/50 border border-purple-500/20 p-8 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Post Platforms</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PLATFORMS.map((platform) => (
                      <motion.button
                        key={platform}
                        onClick={() => togglePlatform(platform)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all capitalize text-sm ${
                          config.platforms.includes(platform)
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                            : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
                        }`}
                      >
                        {platform}
                      </motion.button>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.auto_post}
                        onChange={(e) => setConfig({ ...config, auto_post: e.target.checked })}
                        className="w-5 h-5 rounded accent-purple-600"
                      />
                      <span className="text-sm font-semibold text-white/80">
                        Auto-post clips immediately after creation
                      </span>
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-purple-900/50 border border-purple-500/20 p-8 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Clipping Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-3">Clips Per Day</label>
                    <input
                      type="number"
                      value={config.clips_per_day}
                      onChange={(e) => setConfig({ ...config, clips_per_day: parseInt(e.target.value) })}
                      min="1"
                      max="10"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500/50 transition-all backdrop-blur-sm font-semibold text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-3">Max Duration (sec)</label>
                    <input
                      type="number"
                      value={config.max_video_duration}
                      onChange={(e) => setConfig({ ...config, max_video_duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500/50 transition-all backdrop-blur-sm font-semibold text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-3">Min Views</label>
                    <input
                      type="number"
                      value={config.min_views}
                      onChange={(e) => setConfig({ ...config, min_views: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500/50 transition-all backdrop-blur-sm font-semibold text-lg"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Last Job */}
              {lastJob && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-500/20 p-8 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Last Run</h3>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/50">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-400">Completed</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Videos Found", value: lastJob.videos_found, color: "blue" },
                      { label: "Clips Created", value: lastJob.clips_created, color: "purple" },
                      { label: "Clips Posted", value: lastJob.clips_posted, color: "emerald" },
                      {
                        label: "Success Rate",
                        value: lastJob.clips_created > 0 ? `${Math.round((lastJob.clips_posted / lastJob.clips_created) * 100)}%` : "—",
                        color: "amber",
                      },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        className={`p-4 rounded-xl bg-${color}-500/10 border border-${color}-500/30 text-center`}
                      >
                        <div className={`text-3xl font-black text-${color}-400 mb-2`}>{value}</div>
                        <div className="text-xs font-semibold text-white/60">{label}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-4 pt-8"
              >
                <motion.button
                  onClick={saveConfig}
                  disabled={isSaving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-blue-500/50"
                >
                  {isSaving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Settings
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={runNow}
                  disabled={isRunning}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/50 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  {isRunning ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Run Now
                    </>
                  )}
                </motion.button>
              </motion.div>
            </>
          ) : (
            /* Disabled State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-8"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-800 to-purple-900 flex items-center justify-center border-2 border-purple-500/30"
              >
                <Zap className="w-16 h-16 text-white/30" />
              </motion.div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white">Auto-Clipper Disabled</h2>
                <p className="text-white/60 text-lg">Enable automation to start auto-searching, clipping, and posting videos</p>
              </div>
              <motion.button
                onClick={() => setConfig({ ...config, enabled: true })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Enable Auto-Clipper
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
