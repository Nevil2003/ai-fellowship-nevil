"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Bell,
  Search,
  Eye,
  Zap,
  ExternalLink,
  RefreshCw,
  Filter,
  Send,
  ChevronDown,
  BarChart2,
  Globe,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

interface Mention {
  id: string
  platform: string
  platformIcon: string
  platformColor: string
  author: string
  handle: string
  content: string
  time: string
  sentiment: "positive" | "neutral" | "negative"
  reach: number
  url: string
  replied: boolean
  priority: "high" | "medium" | "low"
}

const MENTIONS: Mention[] = [
  { id: "1", platform: "X (Twitter)", platformIcon: "X", platformColor: "#1d9bf0", author: "Maya Chen", handle: "@mayachen_mktg", content: "Just used @mastical for our Q2 campaign briefs and honestly blown away. The neural scoring alone is worth it — caught a weak hook before we burned $8k on Meta ads. 🔥", time: "12m ago", sentiment: "positive", reach: 14200, url: "#", replied: false, priority: "high" },
  { id: "2", platform: "Reddit", platformIcon: "R", platformColor: "#ff4500", author: "growthops_guy", handle: "r/marketing", content: "Has anyone tried Mastical for agency work? Heard it's good but seems expensive. Worth it for a 3-person team?", time: "28m ago", sentiment: "neutral", reach: 8700, url: "#", replied: false, priority: "high" },
  { id: "3", platform: "Instagram", platformIcon: "IG", platformColor: "#e1306c", author: "SarahRobbins", handle: "@sarah.brands", content: "Mastical AI + our creative team = 🤌 Generated 3 weeks of content in 2 hours. Story mode is 🔥", time: "1h ago", sentiment: "positive", reach: 22400, url: "#", replied: true, priority: "medium" },
  { id: "4", platform: "X (Twitter)", platformIcon: "X", platformColor: "#1d9bf0", author: "PPC Nerd", handle: "@ppcnerd_official", content: "Unpopular opinion: AI content tools like Mastical are making agencies lazy. The 'neural scoring' is just a gimmick. Real creative instinct > algorithms.", time: "2h ago", sentiment: "negative", reach: 9800, url: "#", replied: false, priority: "high" },
  { id: "5", platform: "Facebook", platformIcon: "FB", platformColor: "#1877f2", author: "Digital Minds Group", handle: "Digital Minds Group", content: "We've been testing Mastical Agency OS for 3 weeks now. Content output is solid, workspace collab is smooth. Neural scoring is genuinely interesting for pre-launch validation.", time: "3h ago", sentiment: "positive", reach: 3200, url: "#", replied: true, priority: "low" },
  { id: "6", platform: "Reddit", platformIcon: "R", platformColor: "#ff4500", author: "startup_cmo_anon", handle: "r/startups", content: "Switched from a traditional agency to Mastical + in-house team. Saved $12k/month. No regrets. AMA.", time: "4h ago", sentiment: "positive", reach: 41000, url: "#", replied: false, priority: "high" },
  { id: "7", platform: "X (Twitter)", platformIcon: "X", platformColor: "#1d9bf0", author: "ContentKing99", handle: "@contentking99", content: "Mastical keeps crashing on my Safari when I try to open the workspace. Anyone else? Pretty frustrating for a paid tool.", time: "5h ago", sentiment: "negative", reach: 1200, url: "#", replied: false, priority: "medium" },
  { id: "8", platform: "Instagram", platformIcon: "IG", platformColor: "#e1306c", author: "FutureOfMarketing", handle: "@futureofmktg", content: "The Mastical x AI content trend is real. Brands that aren't using neural engagement scoring in 2024 are going to fall behind. Not a sponsored post, genuinely impressed.", time: "6h ago", sentiment: "positive", reach: 67000, url: "#", replied: true, priority: "medium" },
]

const SENTIMENT_DATA = [
  { name: "Positive", value: 62, color: "#10b981" },
  { name: "Neutral", value: 24, color: "#64748b" },
  { name: "Negative", value: 14, color: "#ef4444" },
]

const TREND_DATA = [
  { day: "Mon", positive: 18, neutral: 8, negative: 4 },
  { day: "Tue", positive: 24, neutral: 10, negative: 3 },
  { day: "Wed", positive: 16, neutral: 7, negative: 6 },
  { day: "Thu", positive: 31, neutral: 12, negative: 2 },
  { day: "Fri", positive: 28, neutral: 9, negative: 5 },
  { day: "Sat", positive: 14, neutral: 6, negative: 3 },
  { day: "Sun", positive: 22, neutral: 11, negative: 4 },
]

const KEYWORDS = ["mastical", "mastical ai", "@mastical", "mastical agency", "neural scoring", "mastical content"]

const REPLY_TEMPLATES = [
  "Thanks so much! 🙌 We're stoked to be part of your workflow. Any features you'd love to see next?",
  "Really appreciate you sharing this! DM us if you'd like a walkthrough of the neural scoring system — there's more depth there than most realize.",
  "Hey! Sorry to hear you're running into issues. Can you DM us your account details? We'll get it sorted ASAP.",
  "Great question! Mastical is built for teams of all sizes. DM us and we'll walk you through which plan makes sense for 3 people.",
]

const sentimentConfig = {
  positive: { icon: ThumbsUp, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Positive" },
  neutral: { icon: Minus, color: "text-slate-400", bg: "bg-white/[0.05] border-white/[0.08]", label: "Neutral" },
  negative: { icon: ThumbsDown, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Negative" },
}

const priorityDot: Record<string, string> = {
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-white/20",
}

function ReputationGauge({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 55 ? "#f59e0b" : "#ef4444"
  const label = score >= 75 ? "Strong" : score >= 55 ? "Fair" : "At Risk"
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ * 0.75

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeDashoffset={circ * 0.375} strokeLinecap="round" />
        <motion.circle cx="72" cy="72" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ * 0.375}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-3xl font-black" style={{ color }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {score}
        </motion.span>
        <span className="text-[10px] font-bold" style={{ color }}>{label}</span>
      </div>
    </div>
  )
}

export default function ORMPage() {
  const [mentionFilter, setMentionFilter] = useState<"all" | "positive" | "neutral" | "negative">("all")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [replied, setReplied] = useState<Set<string>>(new Set(MENTIONS.filter((m) => m.replied).map((m) => m.id)))
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [newKeyword, setNewKeyword] = useState("")
  const [keywords, setKeywords] = useState(KEYWORDS)

  const filteredMentions = MENTIONS.filter(
    (m) => !dismissed.has(m.id) && (mentionFilter === "all" || m.sentiment === mentionFilter)
  )

  const reputationScore = 74
  const totalMentions = 153
  const weekChange = "+12"

  const sendReply = (id: string) => {
    setReplied((prev) => new Set([...prev, id]))
    setReplyingTo(null)
    setReplyText("")
  }

  return (
    <div className="min-h-full bg-[#09090f]">
      {/* Header */}
      <div className="px-8 py-5 border-b border-white/[0.06] bg-[#0a0a14]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Reputation Management
            </h1>
            <p className="text-xs text-white/30 mt-0.5">Monitor brand mentions, sentiment & respond in real-time</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.07] text-xs text-white/40 hover:text-white/70 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Sync now
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-semibold">Live monitoring</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Overview row */}
        <div className="grid grid-cols-4 gap-4">
          {/* Reputation score */}
          <div className="col-span-1 bg-[#0f0f1a] border border-emerald-500/15 rounded-xl p-5 flex flex-col items-center"
            style={{ boxShadow: "0 0 30px rgba(16,185,129,0.08)" }}>
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-semibold mb-3">Brand Health Score</p>
            <ReputationGauge score={reputationScore} />
            <div className="mt-3 text-center">
              <p className="text-[10px] text-white/30">Based on {totalMentions} mentions</p>
              <p className="text-[10px] text-emerald-400 flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="w-2.5 h-2.5" /> {weekChange} this week
              </p>
            </div>
          </div>

          {/* Sentiment breakdown */}
          <div className="col-span-1 bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5">
            <p className="text-xs font-bold text-white mb-3">Sentiment Split</p>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SENTIMENT_DATA} cx="50%" cy="50%" innerRadius={32} outerRadius={50}
                    dataKey="value" paddingAngle={3}>
                    {SENTIMENT_DATA.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-1">
              {SENTIMENT_DATA.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-white/40">{s.name}</span>
                  </div>
                  <span className="font-bold text-white">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="col-span-2 grid grid-cols-2 gap-3">
            {[
              { label: "Total Mentions", value: totalMentions.toString(), sub: `+${weekChange} this week`, icon: MessageCircle, color: "text-violet-400", trend: true },
              { label: "Positive Mentions", value: "95", sub: "62% of all mentions", icon: ThumbsUp, color: "text-emerald-400", trend: true },
              { label: "Needs Response", value: `${filteredMentions.filter((m) => !replied.has(m.id) && m.priority === "high").length}`, sub: "High priority unanswered", icon: AlertTriangle, color: "text-red-400", trend: false },
              { label: "Avg Reach / Mention", value: "21.4K", sub: "Peak: 89K (Reddit)", icon: Eye, color: "text-cyan-400", trend: true },
            ].map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4">
                  <Icon className={`w-4 h-4 ${s.color} mb-2`} />
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{s.label}</div>
                  <div className={`text-[10px] mt-1 flex items-center gap-1 ${s.trend ? "text-emerald-400" : "text-red-400"}`}>
                    {s.trend ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {s.sub}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Trend chart */}
        <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-bold text-white">Mention Sentiment · Last 7 Days</span>
            </div>
            <div className="flex gap-4">
              {[{ color: "#10b981", label: "Positive" }, { color: "#64748b", label: "Neutral" }, { color: "#ef4444", label: "Negative" }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-[10px] text-white/40">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={TREND_DATA}>
              <defs>
                <linearGradient id="gPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gNeg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="positive" stroke="#10b981" fill="url(#gPos)" strokeWidth={2} />
              <Area type="monotone" dataKey="neutral" stroke="#64748b" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
              <Area type="monotone" dataKey="negative" stroke="#ef4444" fill="url(#gNeg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Mention feed */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest">Live Mentions</h2>
              <div className="flex gap-2">
                {(["all", "positive", "neutral", "negative"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setMentionFilter(f)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                      mentionFilter === f
                        ? f === "positive" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          : f === "negative" ? "bg-red-500/15 text-red-400 border border-red-500/25"
                          : f === "neutral" ? "bg-white/10 text-white border border-white/10"
                          : "bg-white/10 text-white border border-white/10"
                        : "text-white/30 hover:text-white/60"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {filteredMentions.map((mention) => {
                  const sc = sentimentConfig[mention.sentiment]
                  const SIcon = sc.icon
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
                        {/* Priority dot */}
                        <div className="flex flex-col items-center gap-1 pt-1">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[mention.priority]}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0"
                              style={{ background: mention.platformColor }}
                            >
                              {mention.platformIcon}
                            </span>
                            <span className="text-xs font-semibold text-white">{mention.author}</span>
                            <span className="text-[10px] text-white/30">{mention.handle}</span>
                            <span className="text-[9px] text-white/20 ml-auto">{mention.time}</span>
                          </div>

                          <p className="text-xs text-white/65 leading-relaxed mb-3">{mention.content}</p>

                          <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${sc.bg} ${sc.color}`}>
                              <SIcon className="w-2.5 h-2.5" />
                              {sc.label}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-white/30">
                              <Eye className="w-2.5 h-2.5" />
                              {(mention.reach / 1000).toFixed(1)}K reach
                            </div>
                            <a href={mention.url} className="text-[10px] text-white/25 hover:text-white/50 flex items-center gap-0.5 transition-colors">
                              <ExternalLink className="w-2.5 h-2.5" />
                              View
                            </a>

                            <div className="ml-auto flex gap-2">
                              {isReplied ? (
                                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                                  <CheckCircle2 className="w-3 h-3" /> Replied
                                </span>
                              ) : (
                                <button
                                  onClick={() => setReplyingTo(replyingTo === mention.id ? null : mention.id)}
                                  className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 transition-colors px-2 py-1 rounded-lg hover:bg-violet-500/10"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  Reply
                                </button>
                              )}
                              <button
                                onClick={() => setDismissed((prev) => new Set([...prev, mention.id]))}
                                className="text-[10px] text-white/20 hover:text-white/40 transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.04]"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>

                          {/* Reply box */}
                          <AnimatePresence>
                            {replyingTo === mention.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 overflow-hidden"
                              >
                                <div className="bg-[#0a0a14] border border-violet-500/20 rounded-xl p-3">
                                  <div className="flex flex-wrap gap-1.5 mb-2">
                                    {REPLY_TEMPLATES.slice(0, 2).map((t, i) => (
                                      <button
                                        key={i}
                                        onClick={() => setReplyText(t)}
                                        className="text-[9px] text-violet-400/70 hover:text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-full transition-colors"
                                      >
                                        Template {i + 1}
                                      </button>
                                    ))}
                                  </div>
                                  <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write your reply..."
                                    rows={2}
                                    className="w-full bg-transparent text-xs text-white placeholder:text-white/20 outline-none resize-none mb-2"
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={() => sendReply(mention.id)}
                                      disabled={!replyText.trim()}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-xs font-bold text-white disabled:opacity-30 hover:bg-violet-500 transition-colors"
                                    >
                                      <Send className="w-3 h-3" />
                                      Send Reply
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

          {/* Right panel: Keywords + alerts */}
          <div className="space-y-4">
            {/* Keyword monitor */}
            <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-bold text-white">Tracked Keywords</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {keywords.map((kw) => (
                  <div key={kw} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-400 font-medium">
                    {kw}
                    <button
                      onClick={() => setKeywords((prev) => prev.filter((k) => k !== kw))}
                      className="text-violet-400/40 hover:text-violet-300 transition-colors ml-0.5"
                    >×</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newKeyword.trim()) {
                      setKeywords((prev) => [...prev, newKeyword.trim()])
                      setNewKeyword("")
                    }
                  }}
                  placeholder="Add keyword..."
                  className="flex-1 bg-[#0a0a14] border border-white/[0.07] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors"
                />
                <button
                  onClick={() => {
                    if (newKeyword.trim()) {
                      setKeywords((prev) => [...prev, newKeyword.trim()])
                      setNewKeyword("")
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-violet-600 text-xs font-bold text-white hover:bg-violet-500 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Alert config */}
            <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">Alert Triggers</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Negative mention from >10K reach", active: true, color: "text-red-400" },
                  { label: "Unanswered high-priority mention > 2h", active: true, color: "text-amber-400" },
                  { label: "Brand score drops below 60", active: true, color: "text-orange-400" },
                  { label: "Viral mention (>50K reach)", active: false, color: "text-violet-400" },
                  { label: "Competitor mentions spiking", active: false, color: "text-cyan-400" },
                ].map((alert) => (
                  <div key={alert.label} className="flex items-start gap-2.5">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-colors ${alert.active ? "bg-emerald-500 border-emerald-500" : "border-white/20"}`}>
                      {alert.active && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={`text-[11px] leading-snug ${alert.active ? "text-white/70" : "text-white/30"}`}>
                      {alert.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage sources */}
            <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">Coverage Sources</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { source: "X (Twitter)", count: 64, pct: 42 },
                  { source: "Reddit", count: 38, pct: 25 },
                  { source: "Instagram", count: 29, pct: 19 },
                  { source: "Facebook", count: 14, pct: 9 },
                  { source: "Web / News", count: 8, pct: 5 },
                ].map((s) => (
                  <div key={s.source}>
                    <div className="flex justify-between text-[10px] text-white/40 mb-1">
                      <span>{s.source}</span>
                      <span>{s.count} mentions</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${s.pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
