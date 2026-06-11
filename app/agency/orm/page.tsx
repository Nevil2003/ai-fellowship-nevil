"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  MessageCircle,
  Minus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { getSettings, logActivity } from "@/lib/local-stats"

type Sentiment = "positive" | "neutral" | "negative"
type Priority = "high" | "medium" | "low"

interface Mention {
  id: string
  platform: string
  platformIcon: string
  platformColor: string
  author: string
  handle: string
  content: string
  time: string
  sentiment: Sentiment
  reach: number
  url: string
  replied: boolean
  priority: Priority
  draftReply?: string
}

const sentimentConfig = {
  positive: { icon: ThumbsUp, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Positive" },
  neutral: { icon: Minus, color: "text-slate-400", bg: "bg-white/[0.05] border-white/[0.08]", label: "Neutral" },
  negative: { icon: ThumbsDown, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Negative" },
}

const priorityDot: Record<Priority, string> = {
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-white/20",
}

const sentimentColors: Record<Sentiment, string> = {
  positive: "#10b981",
  neutral: "#64748b",
  negative: "#ef4444",
}

function ReputationGauge({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 55 ? "#f59e0b" : "#ef4444"
  const label = score >= 75 ? "Strong" : score >= 55 ? "Fair" : "At Risk"
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const dash = (score / 100) * circumference * 0.75

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 144 144">
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="10"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={circumference * 0.375}
          strokeLinecap="round"
        />
        <motion.circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`}
          strokeDashoffset={circumference * 0.375}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${circumference}` }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-[10px] font-bold" style={{ color }}>{label}</span>
      </div>
    </div>
  )
}

export default function ORMPage() {
  const [mentionFilter, setMentionFilter] = useState<"all" | Sentiment>("all")
  const [mentions, setMentions] = useState<Mention[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState("")
  const [scanQuery, setScanQuery] = useState("Mastical")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [copiedReply, setCopiedReply] = useState<string | null>(null)
  const [replied, setReplied] = useState<Set<string>>(new Set())
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const scanMentions = async (query = scanQuery) => {
    const cleanQuery = query.trim() || "Mastical"
    setIsScanning(true)
    setScanError("")
    try {
      const settings = getSettings()
      const brand = settings.defaultBrand || cleanQuery
      const res = await fetch(`/api/orm/mentions?q=${encodeURIComponent(cleanQuery)}&brand=${encodeURIComponent(brand)}`)
      if (!res.ok) throw new Error("Could not scan public sources")
      const data = await res.json()
      setMentions(data.mentions || [])
      setReplied(new Set())
      setDismissed(new Set())
      logActivity({ kind: "reputation", message: `Scanned reputation mentions for ${cleanQuery}` })
    } catch (error) {
      setScanError((error as Error).message || "Scan failed")
      setMentions([])
    } finally {
      setIsScanning(false)
    }
  }

  useEffect(() => {
    const settings = getSettings()
    const brand = settings.defaultBrand || "Mastical"
    setScanQuery(brand)
    scanMentions(brand)
    // Run once on mount only. scanMentions intentionally reads current local settings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredMentions = mentions.filter(
    (mention) => !dismissed.has(mention.id) && (mentionFilter === "all" || mention.sentiment === mentionFilter)
  )

  const sentimentCounts = useMemo(() => ({
    positive: mentions.filter((mention) => mention.sentiment === "positive").length,
    neutral: mentions.filter((mention) => mention.sentiment === "neutral").length,
    negative: mentions.filter((mention) => mention.sentiment === "negative").length,
  }), [mentions])

  const sourceData = useMemo(() => {
    const counts = mentions.reduce<Record<string, { name: string; value: number; color: string }>>((acc, mention) => {
      acc[mention.platform] ||= { name: mention.platform, value: 0, color: mention.platformColor }
      acc[mention.platform].value += 1
      return acc
    }, {})
    return Object.values(counts)
  }, [mentions])

  const sentimentData = (Object.keys(sentimentCounts) as Sentiment[])
    .map((sentiment) => ({ name: sentimentConfig[sentiment].label, value: sentimentCounts[sentiment], color: sentimentColors[sentiment] }))
    .filter((item) => item.value > 0)

  const totalMentions = mentions.length
  const reputationScore = totalMentions
    ? Math.round(((sentimentCounts.positive + sentimentCounts.neutral * 0.65) / totalMentions) * 100)
    : 0
  const needsResponse = filteredMentions.filter((mention) => mention.priority === "high" && !replied.has(mention.id)).length
  const avgReach = totalMentions ? Math.round(mentions.reduce((sum, mention) => sum + mention.reach, 0) / totalMentions) : 0

  const copyReply = async (mention: Mention) => {
    const text = mention.draftReply || ""
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopiedReply(mention.id)
    setTimeout(() => setCopiedReply(null), 1400)
  }

  const sendReply = (id: string) => {
    setReplied((prev) => new Set([...prev, id]))
    setReplyingTo(null)
    setReplyText("")
  }

  return (
    <div className="min-h-full bg-[#09090f]">
      <div className="px-8 py-5 border-b border-white/[0.06] bg-[#0a0a14]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Reputation Management
            </h1>
            <p className="text-xs text-white/30 mt-0.5">Live Reddit and Hacker News mention scanning with copy-ready replies</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2">
              <Search className="w-3.5 h-3.5 text-white/25" />
              <input
                value={scanQuery}
                onChange={(event) => setScanQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") scanMentions()
                }}
                className="w-44 bg-transparent text-xs text-white outline-none placeholder:text-white/20"
                placeholder="Brand or competitor"
              />
            </div>
            <button
              onClick={() => scanMentions()}
              disabled={isScanning}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.07] text-xs text-white/50 hover:text-white/80 disabled:opacity-40 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
              {isScanning ? "Scanning" : "Scan now"}
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-semibold">Public APIs only</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-[#0f0f1a] border border-emerald-500/15 rounded-xl p-5 flex flex-col items-center">
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-semibold mb-3">Brand Health Score</p>
            <ReputationGauge score={reputationScore} />
            <p className="text-[10px] text-white/30 mt-3">Based on {totalMentions} live mentions</p>
          </div>

          <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5">
            <p className="text-xs font-bold text-white mb-3">Sentiment Split</p>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentData.length ? sentimentData : [{ name: "No mentions", value: 1, color: "#334155" }]} cx="50%" cy="50%" innerRadius={32} outerRadius={50} dataKey="value" paddingAngle={3}>
                    {(sentimentData.length ? sentimentData : [{ name: "No mentions", value: 1, color: "#334155" }]).map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {(sentimentData.length ? sentimentData : [{ name: "No mentions", value: 0, color: "#334155" }]).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-white/40">{item.name}</span>
                  </div>
                  <span className="font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Live Mentions", value: totalMentions.toString(), sub: "Reddit + Hacker News", icon: MessageCircle, color: "text-violet-400" },
              { label: "Needs Response", value: needsResponse.toString(), sub: "High priority unanswered", icon: AlertTriangle, color: "text-red-400" },
              { label: "Avg Reach", value: avgReach.toString(), sub: "Votes, points, comments", icon: Eye, color: "text-cyan-400" },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4">
                  <Icon className={`w-4 h-4 ${stat.color} mb-2`} />
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{stat.label}</div>
                  <div className="text-[10px] text-white/25 mt-1">{stat.sub}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest">Live Mentions</h2>
              <div className="flex gap-2">
                {(["all", "positive", "neutral", "negative"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setMentionFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                      mentionFilter === filter ? "bg-white/10 text-white border border-white/10" : "text-white/30 hover:text-white/60"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {scanError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-300">
                  {scanError}
                </div>
              )}
              {!isScanning && !scanError && filteredMentions.length === 0 && (
                <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-6 text-center">
                  <Globe className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-sm font-bold text-white mb-1">No public mentions found</p>
                  <p className="text-xs text-white/35">Try a broader brand, competitor, or category keyword.</p>
                </div>
              )}

              <AnimatePresence>
                {filteredMentions.map((mention) => {
                  const config = sentimentConfig[mention.sentiment]
                  const SentimentIcon = config.icon
                  const isReplied = replied.has(mention.id)
                  return (
                    <motion.div
                      key={mention.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4 hover:border-white/10 transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="pt-1">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[mention.priority]}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0" style={{ background: mention.platformColor }}>
                              {mention.platformIcon}
                            </span>
                            <span className="text-xs font-semibold text-white">{mention.author}</span>
                            <span className="text-[10px] text-white/30">{mention.handle}</span>
                            <span className="text-[9px] text-white/20 ml-auto">{mention.time}</span>
                          </div>
                          <p className="text-xs text-white/65 leading-relaxed mb-3">{mention.content}</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${config.bg} ${config.color}`}>
                              <SentimentIcon className="w-2.5 h-2.5" />
                              {config.label}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-white/30">
                              <Eye className="w-2.5 h-2.5" />
                              {mention.reach.toLocaleString()} reach signal
                            </div>
                            <a href={mention.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/25 hover:text-white/50 flex items-center gap-0.5 transition-colors">
                              <ExternalLink className="w-2.5 h-2.5" />
                              View
                            </a>
                            <div className="ml-auto flex gap-2">
                              {mention.draftReply && (
                                <button onClick={() => copyReply(mention)} className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors px-2 py-1 rounded-lg hover:bg-cyan-500/10">
                                  <Copy className="w-3 h-3" />
                                  {copiedReply === mention.id ? "Copied" : "Copy reply"}
                                </button>
                              )}
                              {isReplied ? (
                                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                                  <CheckCircle2 className="w-3 h-3" /> Replied
                                </span>
                              ) : (
                                <button onClick={() => {
                                  setReplyingTo(replyingTo === mention.id ? null : mention.id)
                                  setReplyText(mention.draftReply || "")
                                }} className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 transition-colors px-2 py-1 rounded-lg hover:bg-violet-500/10">
                                  <MessageCircle className="w-3 h-3" />
                                  Reply
                                </button>
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {replyingTo === mention.id && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                                <div className="bg-[#0a0a14] border border-violet-500/20 rounded-xl p-3">
                                  <textarea
                                    value={replyText}
                                    onChange={(event) => setReplyText(event.target.value)}
                                    placeholder="Write your reply..."
                                    rows={3}
                                    className="w-full bg-transparent text-xs text-white placeholder:text-white/20 outline-none resize-none mb-2"
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button onClick={() => sendReply(mention.id)} disabled={!replyText.trim()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-xs font-bold text-white disabled:opacity-30 hover:bg-violet-500 transition-colors">
                                      <Send className="w-3 h-3" />
                                      Mark replied
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">Live Sources</span>
              </div>
              {sourceData.length ? (
                <div className="space-y-3">
                  {sourceData.map((source) => (
                    <div key={source.name}>
                      <div className="flex justify-between text-[10px] text-white/40 mb-1">
                        <span>{source.name}</span>
                        <span>{source.value} mentions</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: source.color }} initial={{ width: 0 }} animate={{ width: `${Math.max(8, (source.value / totalMentions) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/30">Sources populate after a scan finds public mentions.</p>
              )}
            </div>

            <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">How It Works</span>
              </div>
              <p className="text-xs text-white/45 leading-relaxed">
                This module searches Reddit and Hacker News public APIs with exact keyword filtering. Sentiment is classified locally, and reply drafts are generated from the brand context without pretending to post on your behalf.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
