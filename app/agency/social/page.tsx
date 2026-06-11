"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  Heart,
  MessageCircle,
  Repeat2,
  Eye,
  Share2,
  Plus,
  ExternalLink,
  CheckCircle2,
  Clock,
  BarChart2,
  ArrowUpRight,
  Sparkles,
  Send,
  Calendar,
  Users,
  Zap,
  Image,
  X,
  Star,
  UserPlus,
  SlidersHorizontal,
} from "lucide-react"

// Influencer data
const INFLUENCER_NICHES = ["All", "Marketing", "SaaS / Tech", "DTC / E-com", "Content Creator", "Startup"]

interface Influencer {
  id: string
  name: string
  handle: string
  platform: string
  platformColor: string
  platformIcon: string
  avatar: string
  followers: string
  followersRaw: number
  tier: "nano" | "micro" | "mid" | "macro"
  niche: string
  engagementRate: string
  avgReach: string
  relevanceScore: number
  matchReason: string
  priceRange: string
  verified: boolean
}

const INFLUENCERS: Influencer[] = [
  { id: "1", name: "Priya Mehta", handle: "@priya.marketing", platform: "Instagram", platformColor: "#e1306c", platformIcon: "IG", avatar: "PM", followers: "48.2K", followersRaw: 48200, tier: "micro", niche: "Marketing", engagementRate: "6.8%", avgReach: "18K", relevanceScore: 96, matchReason: "Covers AI marketing tools, often reviews SaaS products for agencies", priceRange: "$300–$600/post", verified: true },
  { id: "2", name: "Alex Dunmore", handle: "@alex_saas", platform: "X (Twitter)", platformColor: "#1d9bf0", platformIcon: "X", avatar: "AD", followers: "92.1K", followersRaw: 92100, tier: "mid", niche: "SaaS / Tech", engagementRate: "3.2%", avgReach: "41K", relevanceScore: 91, matchReason: "Tech founder audience, regularly posts about AI and content tools", priceRange: "$500–$1.2K/post", verified: true },
  { id: "3", name: "Lena Kraft", handle: "@lenakraft.creates", platform: "Instagram", platformColor: "#e1306c", platformIcon: "IG", avatar: "LK", followers: "24.7K", followersRaw: 24700, tier: "nano", niche: "Content Creator", engagementRate: "9.4%", avgReach: "9.8K", relevanceScore: 88, matchReason: "Content creation niche with highly engaged audience of freelancers & marketers", priceRange: "$150–$300/post", verified: false },
  { id: "4", name: "Marcus Osei", handle: "@marcusosei", platform: "X (Twitter)", platformColor: "#1d9bf0", platformIcon: "X", avatar: "MO", followers: "31.4K", followersRaw: 31400, tier: "micro", niche: "Startup", engagementRate: "5.1%", avgReach: "12K", relevanceScore: 85, matchReason: "Startup operator sharing tools that help founders move faster", priceRange: "$200–$450/post", verified: false },
  { id: "5", name: "TechReviewsHQ", handle: "r/TechReviewsHQ", platform: "Reddit", platformColor: "#ff4500", platformIcon: "R", avatar: "TR", followers: "128K", followersRaw: 128000, tier: "macro", niche: "SaaS / Tech", engagementRate: "11.2%", avgReach: "89K", relevanceScore: 82, matchReason: "Massive SaaS-focused subreddit, high organic credibility for product reviews", priceRange: "$400–$800/sponsored post", verified: true },
  { id: "6", name: "Divya Shah", handle: "@divya.dtc", platform: "Instagram", platformColor: "#e1306c", platformIcon: "IG", avatar: "DS", followers: "19.8K", followersRaw: 19800, tier: "nano", niche: "DTC / E-com", engagementRate: "8.7%", avgReach: "7.2K", relevanceScore: 78, matchReason: "DTC brand operator audience — ideal for showcasing content ROI metrics", priceRange: "$120–$250/post", verified: false },
]

const tierConfig: Record<string, { label: string; color: string; bg: string }> = {
  nano: { label: "Nano", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  micro: { label: "Micro", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  mid: { label: "Mid-tier", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  macro: { label: "Macro", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
}
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

// Platform definitions
const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    handle: "@mastical.agency",
    color: "#e1306c",
    gradient: "from-pink-600 via-rose-500 to-orange-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    text: "text-pink-400",
    connected: true,
    followers: "24.3K",
    followersRaw: 24300,
    growth: "+4.2%",
    up: true,
    engagement: "5.8%",
    posts: 312,
    reach: "180K",
    icon: "IG",
  },
  {
    id: "x",
    name: "X (Twitter)",
    handle: "@mastical",
    color: "#1d9bf0",
    gradient: "from-sky-500 to-blue-600",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    text: "text-sky-400",
    connected: true,
    followers: "15.6K",
    followersRaw: 15600,
    growth: "+2.1%",
    up: true,
    engagement: "3.4%",
    posts: 891,
    reach: "95K",
    icon: "X",
  },
  {
    id: "facebook",
    name: "Facebook",
    handle: "Mastical Agency",
    color: "#1877f2",
    gradient: "from-blue-600 to-indigo-700",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    connected: true,
    followers: "8.7K",
    followersRaw: 8700,
    growth: "-0.3%",
    up: false,
    engagement: "1.9%",
    posts: 145,
    reach: "42K",
    icon: "FB",
  },
  {
    id: "reddit",
    name: "Reddit",
    handle: "u/mastical_official",
    color: "#ff4500",
    gradient: "from-orange-500 to-red-600",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    text: "text-orange-400",
    connected: true,
    followers: "12.4K",
    followersRaw: 12400,
    growth: "+8.7%",
    up: true,
    engagement: "11.2%",
    posts: 67,
    reach: "320K",
    icon: "R",
  },
  {
    id: "substack",
    name: "Substack",
    handle: "mastical.substack.com",
    color: "#ff6719",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    connected: false,
    followers: "3.2K",
    followersRaw: 3200,
    growth: "+12.4%",
    up: true,
    engagement: "28.5%",
    posts: 24,
    reach: "18K",
    icon: "SS",
  },
]

interface Post {
  id: string
  platform: string
  content: string
  time: string
  likes: number
  comments: number
  shares: number
  impressions: number
  neuralScore: number
  status: "live" | "scheduled" | "draft"
  image?: boolean
}

const POSTS: Post[] = [
  { id: "1", platform: "instagram", content: "🚀 Behind the scenes of how we built our AI content engine. The process was messier than you think — but the results speak for themselves. Swipe for the full breakdown.", time: "2h ago", likes: 1847, comments: 93, shares: 241, impressions: 28400, neuralScore: 91, status: "live", image: true },
  { id: "2", platform: "x", content: "Most brands treat content like a megaphone. The best brands treat it like a conversation. The difference is in the listening. 🧵", time: "4h ago", likes: 634, comments: 47, shares: 189, impressions: 14200, neuralScore: 87, status: "live" },
  { id: "3", platform: "reddit", content: "I analyzed 500 Meta ad campaigns and found the one thing they all had in common when ROAS dropped below 2x...", time: "6h ago", likes: 2341, comments: 312, shares: 88, impressions: 89000, neuralScore: 94, status: "live" },
  { id: "4", platform: "facebook", content: "Q2 is in full swing. Here's what the data tells us about consumer sentiment right now — and what smart brands are doing about it.", time: "1d ago", likes: 234, comments: 18, shares: 41, impressions: 6800, neuralScore: 72, status: "live", image: true },
  { id: "5", platform: "instagram", content: "The agency model is broken. Thread on why we built Mastical and what we're doing differently. ✨", time: "Scheduled · Apr 25, 10am", likes: 0, comments: 0, shares: 0, impressions: 0, neuralScore: 88, status: "scheduled" },
  { id: "6", platform: "x", content: "Hot take: the best-performing content of 2024 will look nothing like 2023. Here's why...", time: "Draft", likes: 0, comments: 0, shares: 0, impressions: 0, neuralScore: 79, status: "draft" },
]

const CHART_DATA = [
  { day: "Mon", instagram: 2400, x: 1200, facebook: 800, reddit: 4200 },
  { day: "Tue", instagram: 3100, x: 1800, facebook: 650, reddit: 5100 },
  { day: "Wed", instagram: 2800, x: 2100, facebook: 920, reddit: 3800 },
  { day: "Thu", instagram: 4200, x: 2800, facebook: 1100, reddit: 7200 },
  { day: "Fri", instagram: 3800, x: 2300, facebook: 980, reddit: 6100 },
  { day: "Sat", instagram: 2100, x: 1400, facebook: 620, reddit: 4800 },
  { day: "Sun", instagram: 2600, x: 1700, facebook: 740, reddit: 5300 },
]

const platformColors: Record<string, string> = {
  instagram: "#e1306c",
  x: "#1d9bf0",
  facebook: "#1877f2",
  reddit: "#ff4500",
  substack: "#ff6719",
}

const platformById = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]))

const statusConfig = {
  live: { label: "Live", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  scheduled: { label: "Scheduled", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  draft: { label: "Draft", color: "text-white/30 bg-white/[0.04] border-white/[0.08]" },
}

function PlatformBadge({ platformId }: { platformId: string }) {
  const p = platformById[platformId]
  if (!p) return null
  return (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-black text-white bg-gradient-to-br ${p.gradient}`}>
      {p.icon}
    </span>
  )
}

function ConnectModal({ platform, onClose }: { platform: typeof PLATFORMS[0]; onClose: () => void }) {
  const [step, setStep] = useState<"confirm" | "auth" | "done">("confirm")

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 10 }}
        className="w-96 bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "confirm" && (
          <>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center text-white font-black text-lg mb-4`}>
              {platform.icon}
            </div>
            <h3 className="text-base font-bold text-white mb-1">Connect {platform.name}</h3>
            <p className="text-xs text-white/40 mb-5">
              Link your {platform.name} account to manage posts, view analytics, and monitor performance directly in Mastical.
            </p>
            <div className="space-y-2 mb-5">
              {["Schedule & publish content", "Real-time engagement analytics", "Neural score tracking per post", "ORM mention monitoring"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-white/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep("auth")}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${platform.gradient} hover:opacity-90 transition-opacity`}
            >
              Authorize {platform.name} →
            </button>
          </>
        )}
        {step === "auth" && (
          <div className="text-center py-4">
            <motion.div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center text-white font-black text-2xl mx-auto mb-4`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {platform.icon}
            </motion.div>
            <p className="text-sm font-semibold text-white mb-1">Connecting to {platform.name}...</p>
            <p className="text-xs text-white/40 mb-4">Authorizing via OAuth 2.0</p>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={() => setStep("done")}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Simulate success →
            </motion.button>
          </div>
        )}
        {step === "done" && (
          <div className="text-center py-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <p className="text-base font-bold text-white mb-1">{platform.name} Connected!</p>
            <p className="text-xs text-white/40 mb-5">Your account is now synced. Analytics will populate within a few minutes.</p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/30 transition-colors">
              Done
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function SocialHubPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [connectingPlatform, setConnectingPlatform] = useState<typeof PLATFORMS[0] | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [composeText, setComposeText] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "x"])
  const [chartMetric, setChartMetric] = useState<"impressions" | "engagement">("impressions")
  const [influencerNiche, setInfluencerNiche] = useState("All")
  const [savedInfluencers, setSavedInfluencers] = useState<Set<string>>(new Set())
  const [followerRange, setFollowerRange] = useState<"all" | "nano" | "micro" | "mid" | "macro">("all")

  const connectedPlatforms = PLATFORMS.filter((p) => p.connected)
  const filteredPosts = activeFilter === "all" ? POSTS : POSTS.filter((p) => p.platform === activeFilter)

  const totalFollowers = connectedPlatforms.reduce((s, p) => s + p.followersRaw, 0)
  const totalReach = "643K"
  const avgEngagement = "6.1%"

  return (
    <div className="min-h-full bg-[#09090f]">
      {/* Header */}
      <div className="px-8 py-5 border-b border-white/[0.06] bg-[#0a0a14]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-pink-400" />
              Social Hub
            </h1>
            <p className="text-xs text-white/30 mt-0.5">Manage every platform from one place</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCompose(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-violet-600 text-sm font-bold text-white hover:opacity-90 transition-opacity shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Compose Post
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Global stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Audience", value: (totalFollowers / 1000).toFixed(1) + "K", icon: Users, color: "text-violet-400", sub: "across connected platforms" },
            { label: "Weekly Reach", value: totalReach, icon: Eye, color: "text-pink-400", sub: "+18% vs last week" },
            { label: "Avg Engagement", value: avgEngagement, icon: Heart, color: "text-rose-400", sub: "industry avg: 2.3%" },
            { label: "Posts Scheduled", value: "7", icon: Calendar, color: "text-amber-400", sub: "next 14 days" },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4">
                <Icon className={`w-4 h-4 ${s.color} mb-2`} />
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-[10px] text-white/40 font-medium mt-0.5">{s.label}</div>
                <div className="text-[10px] text-white/25 mt-0.5">{s.sub}</div>
              </div>
            )
          })}
        </div>

        {/* Platform cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest">Connected Platforms</h2>
            <span className="text-[10px] text-white/25">{connectedPlatforms.length} of {PLATFORMS.length} connected</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PLATFORMS.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -2 }}
                className={`relative rounded-xl border p-4 ${p.connected ? p.border + " " + p.bg : "border-white/[0.06] bg-[#0f0f1a]"} overflow-hidden`}
              >
                {p.connected && (
                  <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                )}
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white font-black text-sm mb-3 shadow-lg`}>
                  {p.icon}
                </div>
                <div className="text-xs font-bold text-white mb-0.5">{p.name}</div>
                <div className="text-[9px] text-white/30 mb-3 truncate">{p.handle}</div>

                {p.connected ? (
                  <>
                    <div className="text-lg font-black text-white">{p.followers}</div>
                    <div className="text-[9px] text-white/35 mb-1">followers</div>
                    <div className={`flex items-center gap-1 text-[10px] font-semibold ${p.up ? "text-emerald-400" : "text-red-400"}`}>
                      {p.up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {p.growth}
                    </div>
                    <div className="mt-2 text-[9px] text-white/30">
                      {p.engagement} eng · {p.reach} reach
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setConnectingPlatform(p)}
                    className={`w-full mt-1 py-1.5 rounded-lg text-[11px] font-bold bg-gradient-to-r ${p.gradient} text-white hover:opacity-90 transition-opacity`}
                  >
                    Connect
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chart + cross-platform reach */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-bold text-white">Impressions · Last 7 Days</span>
              </div>
              <div className="flex gap-3">
                {connectedPlatforms.map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: platformColors[p.id] }} />
                    <span className="text-[10px] text-white/40">{p.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={CHART_DATA}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? (v / 1000).toFixed(0) + "k" : v} />
                <Tooltip
                  contentStyle={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                />
                <Line type="monotone" dataKey="instagram" stroke="#e1306c" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="x" stroke="#1d9bf0" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="facebook" stroke="#1877f2" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="reddit" stroke="#ff4500" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top performing post */}
          <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold text-white">Top Post This Week</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <PlatformBadge platformId="reddit" />
              <span className="text-[10px] text-white/30">Reddit · 6h ago</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed mb-4">
              "I analyzed 500 Meta ad campaigns and found the one thing they all had in common when ROAS dropped below 2x..."
            </p>
            <div className="space-y-2">
              {[
                { label: "Impressions", value: "89K", icon: Eye },
                { label: "Engagement", value: "11.2%", icon: Heart },
                { label: "Neural Score", value: "94%", icon: Sparkles },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Icon className="w-3 h-3" />
                    {label}
                  </div>
                  <span className="font-bold text-white">{value}</span>
                </div>
              ))}
            </div>
            <a href="#" className="flex items-center gap-1 mt-4 text-[10px] text-violet-400 hover:text-violet-300 transition-colors">
              View post <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Posts feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest">Content Feed</h2>
            {/* Filter pills */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${activeFilter === "all" ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
              >
                All
              </button>
              {PLATFORMS.filter((p) => p.connected).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveFilter(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                    activeFilter === p.id ? p.border + " " + p.text + " " + p.bg : "border-transparent text-white/30 hover:text-white/60"
                  }`}
                >
                  {p.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {filteredPosts.map((post) => {
                const p = platformById[post.platform]
                const sc = statusConfig[post.status]
                return (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4 hover:border-white/10 transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Platform avatar */}
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white font-black text-sm shrink-0`}>
                        {p.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-white">{p.name}</span>
                          <span className="text-[10px] text-white/30">{p.handle}</span>
                          <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.color}`}>
                            {sc.label}
                          </span>
                          {post.image && <Image className="w-3 h-3 text-white/25" />}
                        </div>

                        <p className="text-xs text-white/65 leading-relaxed mb-3">{post.content}</p>

                        {post.status === "live" ? (
                          <div className="flex items-center gap-5">
                            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                              <Heart className="w-3 h-3" /> {post.likes.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                              <MessageCircle className="w-3 h-3" /> {post.comments.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                              <Repeat2 className="w-3 h-3" /> {post.shares.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                              <Eye className="w-3 h-3" /> {post.impressions.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 ml-auto">
                              <Sparkles className="w-3 h-3" />
                              <span className="font-bold">{post.neuralScore}%</span>
                              <span className="text-white/30">neural</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-white/25" />
                            <span className="text-[10px] text-white/30">{post.time}</span>
                            <div className="flex items-center gap-1.5 text-[11px] text-violet-400 ml-auto">
                              <Sparkles className="w-3 h-3" />
                              <span className="font-bold">{post.neuralScore}%</span>
                              <span className="text-white/30">predicted neural engagement</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button className="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition-all">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition-all">
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Influencer Suggestions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Suggested Influencers for Your Niche
              </h2>
              <p className="text-[10px] text-white/30 mt-0.5">
                AI-matched creators based on your brand, audience overlap & engagement quality
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 text-white/30" />
                <span className="text-[10px] text-white/30">Tier:</span>
                {(["all", "nano", "micro", "mid", "macro"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFollowerRange(t)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize transition-all ${followerRange === t ? "bg-white/10 text-white" : "text-white/25 hover:text-white/50"}`}
                  >
                    {t === "all" ? "All" : tierConfig[t]?.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {INFLUENCER_NICHES.map((n) => (
                  <button
                    key={n}
                    onClick={() => setInfluencerNiche(n)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all border ${influencerNiche === n ? "bg-violet-500/15 text-violet-300 border-violet-500/30" : "text-white/30 border-transparent hover:text-white/60"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {INFLUENCERS
              .filter((inf) => influencerNiche === "All" || inf.niche === influencerNiche)
              .filter((inf) => followerRange === "all" || inf.tier === followerRange)
              .map((inf) => {
                const tc = tierConfig[inf.tier]
                const isSaved = savedInfluencers.has(inf.id)
                return (
                  <motion.div
                    key={inf.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                    className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4 hover:border-white/10 transition-all relative overflow-hidden"
                  >
                    {/* Relevance badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                      <Sparkles className="w-2.5 h-2.5 text-violet-400" />
                      <span className="text-[9px] font-bold text-violet-400">{inf.relevanceScore}% match</span>
                    </div>

                    {/* Avatar + info */}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                        style={{ background: `linear-gradient(135deg, ${inf.platformColor}cc, ${inf.platformColor}44)`, border: `1px solid ${inf.platformColor}40` }}
                      >
                        {inf.avatar}
                      </div>
                      <div className="flex-1 min-w-0 pr-16">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{inf.name}</span>
                          {inf.verified && <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-white/35 flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-black text-white"
                            style={{ background: inf.platformColor }}
                          >
                            {inf.platformIcon}
                          </span>
                          {inf.handle}
                        </div>
                      </div>
                    </div>

                    {/* Tier + niche */}
                    <div className="flex gap-2 mb-3">
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${tc.color} ${tc.bg}`}>{tc.label}</span>
                      <span className="text-[9px] text-white/30 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">{inf.niche}</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: "Followers", value: inf.followers },
                        { label: "Eng Rate", value: inf.engagementRate },
                        { label: "Avg Reach", value: inf.avgReach },
                      ].map((s) => (
                        <div key={s.label} className="text-center bg-white/[0.03] rounded-lg py-1.5">
                          <div className="text-xs font-bold text-white">{s.value}</div>
                          <div className="text-[8px] text-white/25 mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Match reason */}
                    <p className="text-[10px] text-white/40 leading-snug mb-3 italic">"{inf.matchReason}"</p>

                    {/* Price + actions */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30 font-medium">{inf.priceRange}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSavedInfluencers((prev) => {
                            const next = new Set(prev)
                            if (next.has(inf.id)) next.delete(inf.id)
                            else next.add(inf.id)
                            return next
                          })}
                          className={`p-1.5 rounded-lg transition-all ${isSaved ? "text-yellow-400 bg-yellow-500/10" : "text-white/20 hover:text-yellow-400 hover:bg-yellow-500/10"}`}
                        >
                          <Star className="w-3.5 h-3.5" fill={isSaved ? "currentColor" : "none"} />
                        </button>
                        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 text-[10px] font-bold text-white hover:opacity-90 transition-opacity">
                          <UserPlus className="w-3 h-3" />
                          Reach Out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Compose modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCompose(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94 }}
              className="w-[540px] bg-[#0f0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                <span className="text-sm font-bold text-white">Compose Post</span>
                <button onClick={() => setShowCompose(false)} className="text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <textarea
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  placeholder="What's on your mind? (AI will optimize before posting)"
                  rows={5}
                  className="w-full bg-[#0a0a14] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors resize-none"
                />
                <div className="mt-3 mb-4">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-2">Post to</p>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.filter((p) => p.connected).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPlatforms((prev) =>
                          prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                        )}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          selectedPlatforms.includes(p.id) ? p.border + " " + p.text + " " + p.bg : "border-white/[0.07] text-white/30"
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-sm bg-gradient-to-br ${p.gradient}`} />
                        {p.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.07] text-sm text-white/40 hover:text-white/70 transition-colors">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-colors text-sm">
                    <Sparkles className="w-4 h-4" />
                    AI Optimize
                  </button>
                  <button
                    disabled={!composeText.trim() || selectedPlatforms.length === 0}
                    className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 text-sm font-bold text-white hover:opacity-90 disabled:opacity-30 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                    Publish Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connect platform modal */}
      <AnimatePresence>
        {connectingPlatform && (
          <ConnectModal platform={connectingPlatform} onClose={() => setConnectingPlatform(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
