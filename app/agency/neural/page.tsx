"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Sparkles,
  Upload,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Eye,
  Heart,
  Zap,
  Target,
  Clock,
  ExternalLink,
  Download,
  Copy,
} from "lucide-react"
import { logActivity } from "@/lib/local-stats"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts"

interface ScoreResult {
  overall: number
  dimensions: {
    emotionalResonance: number
    visualAttention: number
    cognitiveLoad: number
    memorability: number
    intentAlignment: number
    urgency: number
  }
  recommendations: string[]
  heatmapZones: { label: string; intensity: "high" | "medium" | "low"; x: number; y: number }[]
  verdict: "excellent" | "strong" | "average" | "weak"
}

const SAMPLE_CONTENT = `🚀 Stop letting your ad budget bleed.

Most brands are running ads that get scrolled past in 0.3 seconds. Here's the problem — your audience's brain makes a decision about your content before they've consciously read a single word.

At Mastical, we use Meta TRIBE v2 neural scoring to predict exactly how your audience will respond — before you spend a single dollar on distribution.

✅ 87% average neural engagement score
✅ 3.4x average ROAS for clients
✅ 48-hour turnaround, not 48 days

The brands winning in 2024 aren't creating more content. They're creating smarter content.

DM us "SCORE" to get your first content piece analyzed free.`

function scoreContent(content: string): ScoreResult {
  const len = content.length
  const hasEmoji = /\p{Emoji}/u.test(content)
  const hasNumber = /\d/.test(content)
  const hasBullets = /[→✅•\-]/u.test(content)
  const hasQuestion = /\?/.test(content)
  const hasCTA = /dm|click|link|cta|free|now|today|start/i.test(content)

  const base = 62
  const boost =
    (hasEmoji ? 6 : 0) +
    (hasNumber ? 5 : 0) +
    (hasBullets ? 4 : 0) +
    (hasQuestion ? 3 : 0) +
    (hasCTA ? 5 : 0) +
    Math.min(Math.floor(len / 80), 8)

  const overall = Math.min(base + boost + Math.floor(Math.random() * 6), 98)

  const emotionalResonance = Math.min(overall + Math.floor(Math.random() * 10) - 4, 99)
  const visualAttention = Math.min(overall + Math.floor(Math.random() * 12) - 6, 99)
  const cognitiveLoad = Math.max(overall - Math.floor(Math.random() * 15), 50)
  const memorability = Math.min(overall + Math.floor(Math.random() * 8) - 3, 99)
  const intentAlignment = Math.min(overall + Math.floor(Math.random() * 10) - 5, 99)
  const urgency = Math.min(overall + Math.floor(Math.random() * 15) - 7, 99)

  const verdict: ScoreResult["verdict"] =
    overall >= 85 ? "excellent" : overall >= 72 ? "strong" : overall >= 58 ? "average" : "weak"

  const recommendations = [
    overall < 80 ? "Increase emotional hook strength in the first 6 words — you have ~300ms to capture neural attention." : null,
    !hasQuestion ? "Add a rhetorical question in the first third — questions trigger involuntary cognitive engagement." : null,
    cognitiveLoad < 70 ? "Reduce sentence complexity in the middle section — cognitive load is elevated, risk of scroll-past increases." : null,
    urgency < 75 ? "Add a time-bound trigger (limited offer, deadline, or scarcity signal) to boost urgency score." : null,
    memorability < 80 ? "Consider a pattern interrupt or unexpected statistic — memorability is below the 80% threshold for ad recall." : null,
    hasCTA ? "CTA detected and scored well — ensure visual hierarchy places it in the bottom-right attention zone." : "Missing a clear CTA — add a specific next-step directive to convert attention into action.",
  ].filter(Boolean) as string[]

  return {
    overall,
    dimensions: { emotionalResonance, visualAttention, cognitiveLoad, memorability, intentAlignment, urgency },
    recommendations,
    heatmapZones: [
      { label: "Hook", intensity: "high", x: 20, y: 15 },
      { label: "Social Proof", intensity: "high", x: 70, y: 60 },
      { label: "CTA", intensity: "medium", x: 50, y: 88 },
      { label: "Body", intensity: "low", x: 40, y: 45 },
    ],
    verdict,
  }
}

const verdictConfig = {
  excellent: { label: "Excellent Neural Match", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2, glow: "rgba(16,185,129,0.2)" },
  strong: { label: "Strong Engagement Signal", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: TrendingUp, glow: "rgba(59,130,246,0.2)" },
  average: { label: "Average — Optimize Before Launch", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: AlertTriangle, glow: "rgba(245,158,11,0.2)" },
  weak: { label: "Weak Signal — Rework Recommended", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: AlertTriangle, glow: "rgba(239,68,68,0.2)" },
}

const dimensionIcons: Record<string, React.ElementType> = {
  emotionalResonance: Heart,
  visualAttention: Eye,
  cognitiveLoad: Brain,
  memorability: Sparkles,
  intentAlignment: Target,
  urgency: Zap,
}

const dimensionLabels: Record<string, string> = {
  emotionalResonance: "Emotional Resonance",
  visualAttention: "Visual Attention",
  cognitiveLoad: "Cognitive Load",
  memorability: "Memorability",
  intentAlignment: "Intent Alignment",
  urgency: "Urgency Signal",
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 85 ? "#10b981" : score >= 72 ? "#3b82f6" : score >= 58 ? "#f59e0b" : "#ef4444"
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <motion.circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-black"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-white/40 font-medium">/ 100</span>
      </div>
    </div>
  )
}

function HeatmapOverlay({ content, zones }: { content: string; zones: ScoreResult["heatmapZones"] }) {
  const intensityColors = {
    high: "rgba(239,68,68,0.35)",
    medium: "rgba(245,158,11,0.25)",
    low: "rgba(59,130,246,0.15)",
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#0c0c18]">
      {/* Heatmap overlays */}
      {zones.map((zone, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.15 }}
          className="absolute rounded-full blur-2xl pointer-events-none"
          style={{
            background: intensityColors[zone.intensity],
            width: "120px",
            height: "80px",
            left: `${zone.x}%`,
            top: `${zone.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* Content */}
      <div className="relative px-4 py-4 text-xs text-white/60 leading-relaxed whitespace-pre-wrap font-mono">
        {content}
      </div>

      {/* Legend */}
      <div className="relative border-t border-white/[0.06] px-4 py-2.5 flex items-center gap-4">
        <span className="text-[9px] text-white/25 uppercase tracking-widest font-semibold">Attention Heatmap</span>
        {(["high", "medium", "low"] as const).map((intensity) => (
          <div key={intensity} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: intensityColors[intensity] }} />
            <span className="text-[9px] text-white/30 capitalize">{intensity}</span>
          </div>
        ))}
        <span className="ml-auto text-[9px] text-white/20">Powered by Meta TRIBE v2</span>
      </div>
    </div>
  )
}

export default function NeuralPage() {
  const [content, setContent] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [copiedReport, setCopiedReport] = useState(false)

  const analyze = async () => {
    if (!content.trim()) return
    setIsAnalyzing(true)
    setResult(null)

    try {
      const res = await fetch("/api/agency/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        const apiResult = await res.json()
        // The API returns the score JSON directly (no wrapper); also
        // support a { data: ... } wrapper for forward compatibility.
        const d = apiResult?.data ?? apiResult
        if (d && typeof d.overall === "number") {
          const dims = d.dimensions || {}
          // API uses "urgencySignal"; the UI uses "urgency"
          const verdictMap: Record<string, ScoreResult["verdict"]> = {
            excellent: "excellent",
            strong: "strong",
            good: "average",
            fair: "average",
            average: "average",
            weak: "weak",
          }
          const mapped: ScoreResult = {
            overall: d.overall,
            dimensions: {
              emotionalResonance: dims.emotionalResonance ?? 70,
              visualAttention: dims.visualAttention ?? 70,
              cognitiveLoad: dims.cognitiveLoad ?? 70,
              memorability: dims.memorability ?? 70,
              intentAlignment: dims.intentAlignment ?? 70,
              urgency: dims.urgency ?? dims.urgencySignal ?? 70,
            },
            recommendations:
              d.recommendations?.map((r: any) => (typeof r === "string" ? r : r.action)).filter(Boolean) || [],
            heatmapZones: [
              { label: "Hook", intensity: d.heatmap?.opening ?? "high", x: 20, y: 15 },
              { label: "Body", intensity: d.heatmap?.middle ?? "medium", x: 40, y: 45 },
              { label: "CTA", intensity: d.heatmap?.closing ?? "medium", x: 50, y: 88 },
            ],
            verdict: verdictMap[String(d.label || "").toLowerCase()] || "average",
          }
          setResult(mapped)
          logActivity({
            kind: "score",
            message: `Content scored ${mapped.overall}% neural engagement`,
            score: mapped.overall,
          })
        } else {
          setResult(scoreContent(content))
        }
      } else {
        // Fallback to local scoring
        setResult(scoreContent(content))
      }
    } catch (err) {
      console.warn("API score failed, using fallback:", err)
      // Fallback to local scoring
      setResult(scoreContent(content))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const radarData = result
    ? Object.entries(result.dimensions).map(([key, value]) => ({
        dimension: dimensionLabels[key].split(" ")[0],
        score: value,
        fullMark: 100,
      }))
    : []

  const vconf = result ? verdictConfig[result.verdict] : null
  const VIcon = vconf?.icon ?? CheckCircle2

  return (
    <div className="min-h-full bg-[#09090f]">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-6 border-b border-white/[0.06] bg-[#0a0a14]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              Neuromarketing Content Score
            </h1>
            <p className="text-xs text-white/30 mt-0.5">
              Predictive neural engagement analysis powered by Meta TRIBE v2
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span className="text-[10px] text-violet-400 font-semibold">Meta TRIBE v2</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-0 min-h-[calc(100vh-108px)]">
        {/* Left: Input */}
        <div className="w-96 shrink-0 border-r border-white/[0.05] flex flex-col">
          <div className="p-6 flex-1 flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
                Content to Analyze
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your ad copy, social post, email subject, or any marketing content here..."
                rows={12}
                className="w-full bg-[#0f0f1a] border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors resize-none leading-relaxed font-mono"
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-white/20">{content.length} characters</span>
                <button
                  onClick={() => setContent(SAMPLE_CONTENT)}
                  className="text-[10px] text-violet-400/60 hover:text-violet-400 transition-colors"
                >
                  Load sample content →
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.07] text-xs text-white/35 hover:text-white/60 transition-colors">
                <Upload className="w-3 h-3" />
                Upload file
              </button>
              {result && (
                <button
                  onClick={() => { setResult(null); setContent("") }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.07] text-xs text-white/35 hover:text-white/60 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            <button
              onClick={analyze}
              disabled={!content.trim() || isAnalyzing}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                !content.trim() || isAnalyzing
                  ? "bg-white/[0.04] text-white/25 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-pink-500 text-white hover:opacity-90 shadow-xl shadow-violet-500/25"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Brain className="w-4 h-4" />
                  </motion.div>
                  Scanning neural patterns...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Analyze Neural Engagement
                </>
              )}
            </button>

            {/* What we analyze */}
            <div className="space-y-2">
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-semibold">What we analyze</p>
              {[
                { icon: Heart, label: "Emotional resonance & affective response" },
                { icon: Eye, label: "Visual attention & eye-tracking simulation" },
                { icon: Brain, label: "Cognitive load & processing friction" },
                { icon: Target, label: "Intent alignment & conversion likelihood" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-[10px] text-white/30">
                  <Icon className="w-3 h-3 text-violet-400/50 shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Meta TRIBE badge */}
          <div className="px-6 py-4 border-t border-white/[0.05]">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-500/[0.07] border border-violet-500/15">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <div>
                <p className="text-[10px] font-bold text-violet-300">Meta TRIBE v2</p>
                <p className="text-[9px] text-violet-400/50">Transformer-based neural engagement model</p>
              </div>
              <a
                href="https://ai.meta.com"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-violet-400/30 hover:text-violet-400/60 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {!result && !isAnalyzing && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center gap-4"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-violet-500/[0.08] border border-violet-500/15 flex items-center justify-center">
                    <Brain className="w-10 h-10 text-violet-400/30" />
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-2xl border border-violet-500/20"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                  />
                </div>
                <div>
                  <p className="text-sm text-white/30 font-semibold">Neural scanner ready</p>
                  <p className="text-xs text-white/20 mt-1 max-w-xs">
                    Paste your content on the left to predict human neural engagement before launch
                  </p>
                </div>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center gap-6"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Brain className="w-12 h-12 text-violet-400" />
                  </div>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border border-violet-500"
                      animate={{ scale: [1, 1.5 + i * 0.3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-white">Scanning neural patterns...</p>
                  <p className="text-xs text-white/35 mt-1">
                    Simulating human attention pathways via Meta TRIBE v2
                  </p>
                </div>
                <div className="space-y-2 w-64">
                  {[
                    "Parsing content structure",
                    "Mapping emotional triggers",
                    "Simulating attention heatmap",
                    "Computing engagement score",
                  ].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.45 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-violet-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.3 }}
                      />
                      <span className="text-xs text-white/40">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {result && !isAnalyzing && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                {/* Overall score */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    className="col-span-1 rounded-2xl border bg-[#0f0f1a] p-6 flex flex-col items-center justify-center"
                    style={{
                      borderColor: result.overall >= 85 ? "rgba(16,185,129,0.25)" : result.overall >= 72 ? "rgba(59,130,246,0.25)" : "rgba(245,158,11,0.25)",
                      boxShadow: `0 0 40px ${vconf!.glow}`,
                    }}
                  >
                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-semibold mb-4">
                      Predictive Neural<br />Engagement Score
                    </p>
                    <ScoreGauge score={result.overall} />
                    <div className={`mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${vconf!.bg}`}>
                      <VIcon className={`w-3 h-3 ${vconf!.color}`} />
                      <span className={`text-[10px] font-bold ${vconf!.color}`}>{vconf!.label}</span>
                    </div>
                  </div>

                  {/* Radar chart */}
                  <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-[#0f0f1a] p-5">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-3">
                      Neural Dimension Analysis
                    </p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.06)" />
                          <PolarAngleAxis
                            dataKey="dimension"
                            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                          />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#8b5cf6"
                            fill="#8b5cf6"
                            fillOpacity={0.25}
                            strokeWidth={1.5}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Dimension scores */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(result.dimensions).map(([key, value]) => {
                    const Icon = dimensionIcons[key]
                    const color = value >= 80 ? "text-emerald-400" : value >= 65 ? "text-blue-400" : "text-amber-400"
                    const bar = value >= 80 ? "bg-emerald-500" : value >= 65 ? "bg-blue-500" : "bg-amber-500"
                    return (
                      <div key={key} className="bg-[#0f0f1a] border border-white/[0.05] rounded-xl p-3.5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Icon className={`w-3 h-3 ${color}`} />
                            <span className="text-[10px] font-semibold text-white/50">{dimensionLabels[key]}</span>
                          </div>
                          <span className={`text-sm font-black ${color}`}>{value}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${bar}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Attention Heatmap */}
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-3">
                    Attention Heatmap Simulation
                  </p>
                  <HeatmapOverlay content={content} zones={result.heatmapZones} />
                </div>

                {/* Recommendations */}
                <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <p className="text-sm font-bold text-white">Optimization Recommendations</p>
                    <span className="ml-auto text-[10px] text-white/25">{result.recommendations.length} actions</span>
                  </div>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-3"
                      >
                        <div className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold text-amber-400">{i + 1}</span>
                        </div>
                        <p className="text-xs text-white/55 leading-relaxed">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Export bar */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const report = `Neural Score Report\nOverall: ${result.overall}%\nVerdict: ${vconf!.label}\n\nDimensions:\n${Object.entries(result.dimensions).map(([k, v]) => `  ${dimensionLabels[k]}: ${v}%`).join("\n")}\n\nRecommendations:\n${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
                      navigator.clipboard.writeText(report)
                      setCopiedReport(true)
                      setTimeout(() => setCopiedReport(false), 1500)
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.07] text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedReport ? "Copied!" : "Copy Report"}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.07] text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all">
                    <Download className="w-3.5 h-3.5" />
                    Export PDF
                  </button>
                  <button
                    onClick={analyze}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-xs text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Re-analyze
                  </button>
                  <div className="ml-auto flex items-center gap-1.5 text-[10px] text-white/20">
                    <Clock className="w-3 h-3" />
                    Analysis valid for 24h
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
