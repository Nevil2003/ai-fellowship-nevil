"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Image,
  FileText,
  Mail,
  Video,
  Copy,
  Download,
  RefreshCw,
  Brain,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react"

type Tab = "social" | "ads" | "blog" | "email" | "video"

const TABS: { key: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { key: "social", label: "Social Posts", icon: Image, color: "from-pink-600 to-rose-600" },
  { key: "ads", label: "Meta Ads", icon: Sparkles, color: "from-violet-600 to-purple-600" },
  { key: "blog", label: "Blog Article", icon: FileText, color: "from-blue-600 to-indigo-600" },
  { key: "email", label: "Email", icon: Mail, color: "from-amber-600 to-orange-600" },
  { key: "video", label: "Video Script", icon: Video, color: "from-red-600 to-rose-700" },
]

const TONES = ["Professional", "Bold & Energetic", "Casual & Friendly", "Inspirational", "Witty", "Urgent"]

interface BriefForm {
  brand: string
  audience: string
  message: string
  tone: string
}

interface NeuralScoreData {
  overall: number
  label: string
  dimensions: Record<string, number>
  strengths: string[]
  recommendations: { priority: number; action: string; impact: string }[]
}

function NeuralMini({ score, label, loading }: { score: number; label: string; loading?: boolean }) {
  const color = score >= 85 ? "text-emerald-400" : score >= 70 ? "text-amber-400" : "text-red-400"
  const bg = score >= 85 ? "bg-emerald-500/10 border-emerald-500/20" : score >= 70 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20"
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${loading ? "bg-white/[0.04] border-white/[0.08]" : bg}`}>
      <Brain className={`w-3.5 h-3.5 ${loading ? "text-white/30 animate-pulse" : color}`} />
      {loading ? (
        <span className="text-xs text-white/30">Scoring neural engagement...</span>
      ) : (
        <>
          <span className={`text-xs font-bold ${color}`}>{score}%</span>
          <span className="text-xs text-white/40">{label} · Neural Engagement</span>
        </>
      )}
      <ChevronRight className="w-3 h-3 text-white/20 ml-auto" />
    </div>
  )
}

function StreamingOutput({
  content,
  score,
  scoreLoading,
  onCopy,
  copied,
}: {
  content: string
  score: NeuralScoreData | null
  scoreLoading: boolean
  onCopy: () => void
  copied: boolean
}) {
  const lines = content.split("\n")

  return (
    <div className="space-y-4">
      <NeuralMini
        score={score?.overall ?? 0}
        label={score?.label ?? ""}
        loading={scoreLoading || (!score && content.length > 0)}
      />

      <div className="relative group bg-[#0c0c18] border border-white/[0.06] rounded-xl p-4 hover:border-white/10 transition-colors">
        <button
          onClick={onCopy}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 transition-all"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3 text-white/40" />
          )}
        </button>
        <div className="text-xs text-white/65 leading-relaxed font-mono whitespace-pre-wrap pr-8">
          {lines.map((line, j) => {
            if (line.startsWith("**") && line.endsWith("**")) {
              return <div key={j} className="font-bold text-white font-sans mb-1 mt-2 first:mt-0">{line.replace(/\*\*/g, "")}</div>
            }
            if (line.startsWith("**") && line.includes("**")) {
              return <div key={j} className="text-violet-300 font-semibold font-sans">{line.replace(/\*\*/g, "")}</div>
            }
            if (line.startsWith("#")) {
              return <div key={j} className="text-white font-bold text-sm font-sans mb-1">{line.replace(/^#+\s/, "")}</div>
            }
            if (line === "---") return <div key={j} className="border-t border-white/[0.06] my-2" />
            if (line === "") return <div key={j} className="h-1" />
            return <div key={j}>{line}</div>
          })}
          {content.length === 0 && <span className="text-white/20">Generating...</span>}
        </div>
      </div>

      {score && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0c0c18] border border-white/[0.06] rounded-xl p-4 space-y-3"
        >
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">AI Recommendations</p>
          {score.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                r.impact === "High" ? "bg-red-500/20 text-red-400" :
                r.impact === "Medium" ? "bg-amber-500/20 text-amber-400" :
                "bg-blue-500/20 text-blue-400"
              }`}>{r.impact}</span>
              <p className="text-xs text-white/50 leading-relaxed">{r.action}</p>
            </div>
          ))}
        </motion.div>
      )}

      <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-white/[0.07] rounded-xl text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.03] transition-all">
        <Download className="w-3.5 h-3.5" />
        Export as PDF
      </button>
    </div>
  )
}

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("social")
  const [form, setForm] = useState<BriefForm>({ brand: "", audience: "", message: "", tone: "Bold & Energetic" })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isScoring, setIsScoring] = useState(false)
  const [streamedContent, setStreamedContent] = useState<string | null>(null)
  const [neuralScore, setNeuralScore] = useState<NeuralScoreData | null>(null)
  const [copied, setCopied] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!

  const generate = async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsGenerating(true)
    setStreamedContent("")
    setNeuralScore(null)
    setIsScoring(false)

    try {
      const res = await fetch("/api/agency/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          type: activeTab,
          brand: form.brand,
          audience: form.audience,
          message: form.message,
          tone: form.tone,
        }),
      })

      if (!res.ok || !res.body) throw new Error(`API error ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6).trim()
          if (data === "[DONE]") break
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              accumulated += delta
              setStreamedContent(accumulated)
            }
          } catch { /* partial chunk */ }
        }
      }

      // Score the completed content
      if (accumulated.length > 50) {
        setIsScoring(true)
        try {
          const scoreRes = await fetch("/api/agency/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: accumulated }),
          })
          if (scoreRes.ok) {
            const scoreData = await scoreRes.json()
            setNeuralScore(scoreData)
          }
        } catch { /* score is optional */ }
        setIsScoring(false)
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setStreamedContent("Error generating content. Please try again.")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const copyAll = () => {
    if (!streamedContent) return
    navigator.clipboard.writeText(streamedContent.replace(/\*\*/g, "").replace(/^#+\s/gm, ""))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="min-h-full bg-[#09090f]">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/[0.06] bg-[#0a0a14]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              Content Studio
            </h1>
            <p className="text-xs text-white/30 mt-0.5">
              Generate neural-optimized content across every channel
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-semibold">Claude Sonnet · Live AI</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-5">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.key === activeTab
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setStreamedContent(null); setNeuralScore(null) }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-white/[0.06]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-0 h-[calc(100vh-160px)]">
        {/* Left: Brief form */}
        <div className="w-80 shrink-0 border-r border-white/[0.05] overflow-y-auto">
          <div className="p-6 space-y-5">
            <div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeTabConfig.color} flex items-center justify-center mb-4 shadow-lg`}>
                <activeTabConfig.icon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-sm font-bold text-white mb-1">{activeTabConfig.label}</h2>
              <p className="text-xs text-white/35">Fill in your brief and let the AI do the heavy lifting.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                  Brand Name
                </label>
                <input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="e.g. NovaSkin, Verde, FitLife"
                  className="w-full bg-[#0f0f1a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                  Target Audience
                </label>
                <input
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  placeholder="e.g. Millennial women, 28–40, health-conscious"
                  className="w-full bg-[#0f0f1a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                  Key Message / Offer
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="What's the core idea or offer you want to communicate?"
                  rows={3}
                  className="w-full bg-[#0f0f1a] border border-white/[0.08] rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
                  Tone of Voice
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TONES.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setForm({ ...form, tone })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border ${
                        form.tone === tone
                          ? "bg-violet-600/25 text-violet-300 border-violet-500/40"
                          : "text-white/35 border-white/[0.07] hover:border-white/15 hover:text-white/60"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                isGenerating
                  ? "bg-white/[0.05] text-white/30 cursor-not-allowed"
                  : `bg-gradient-to-r ${activeTabConfig.color} text-white hover:opacity-90 shadow-lg`
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Content
                </>
              )}
            </button>

            {streamedContent && !isGenerating && (
              <button
                onClick={generate}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/[0.07] text-xs text-white/35 hover:text-white/55 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            )}
          </div>
        </div>

        {/* Right: Output */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {!streamedContent && !isGenerating && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeTabConfig.color} flex items-center justify-center mb-4 opacity-30`}>
                  <activeTabConfig.icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-white/25 font-medium">Fill in your brief and click Generate</p>
                <p className="text-xs text-white/15 mt-1">
                  Real AI generation · Claude Sonnet · Neural scored on completion
                </p>
              </motion.div>
            )}

            {isGenerating && !streamedContent && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center gap-5"
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeTabConfig.color} flex items-center justify-center shadow-2xl`}>
                    <activeTabConfig.icon className="w-8 h-8 text-white" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-violet-400"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/60 font-semibold">Connecting to Claude Sonnet...</p>
                  <p className="text-xs text-white/25 mt-1">Writing your content in real-time</p>
                </div>
              </motion.div>
            )}

            {streamedContent !== null && (
              <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Generated {activeTabConfig.label}</h3>
                  {isGenerating && (
                    <span className="flex items-center gap-1.5 text-[10px] text-violet-400">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                      Streaming...
                    </span>
                  )}
                </div>
                <StreamingOutput
                  content={streamedContent}
                  score={neuralScore}
                  scoreLoading={isScoring}
                  onCopy={copyAll}
                  copied={copied}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
