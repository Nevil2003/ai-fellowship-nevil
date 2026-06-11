"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  TrendingDown,
  Heart,
  MessageCircle,
  Eye,
  Users,
  Calendar,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Instagram,
  Twitter,
  MessageSquare,
  Mail,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface PlatformStats {
  platform: "instagram" | "x" | "reddit" | "substack"
  followers: number
  engagement_rate: number
  reach: number
  avg_engagement: number
  posts_count: number
  growth: number
}

interface PostPerformance {
  id: string
  platform: string
  text: string
  engagement: number
  reach: number
  date: string
}

interface AnalyticsData {
  platforms: PlatformStats[]
  posts: PostPerformance[]
  timeline: Array<{ date: string; reach: number; engagement: number }>
}

const MOCK_ANALYTICS: AnalyticsData = {
  platforms: [
    {
      platform: "instagram",
      followers: 12400,
      engagement_rate: 6.8,
      reach: 45200,
      avg_engagement: 307,
      posts_count: 24,
      growth: 12.5,
    },
    {
      platform: "x",
      followers: 28900,
      engagement_rate: 3.2,
      reach: 89200,
      avg_engagement: 284,
      posts_count: 156,
      growth: 8.2,
    },
    {
      platform: "reddit",
      followers: 0,
      engagement_rate: 11.2,
      reach: 156000,
      avg_engagement: 1204,
      posts_count: 8,
      growth: 45.8,
    },
  ],
  posts: [
    {
      id: "1",
      platform: "instagram",
      text: "New product launch campaign",
      engagement: 487,
      reach: 12400,
      date: "2024-06-08",
    },
    {
      id: "2",
      platform: "x",
      text: "Industry insights thread",
      engagement: 1203,
      reach: 34500,
      date: "2024-06-07",
    },
    {
      id: "3",
      platform: "reddit",
      text: "AMA in r/startup",
      engagement: 2345,
      reach: 89200,
      date: "2024-06-06",
    },
  ],
  timeline: [
    { date: "Jun 1", reach: 45000, engagement: 280 },
    { date: "Jun 3", reach: 52000, engagement: 320 },
    { date: "Jun 5", reach: 64000, engagement: 410 },
    { date: "Jun 7", reach: 89200, engagement: 610 },
  ],
}

const platformIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  x: Twitter,
  reddit: MessageSquare,
  substack: Mail,
}

const platformColors: Record<string, string> = {
  instagram: "text-pink-400 bg-pink-500/10",
  x: "text-blue-400 bg-blue-500/10",
  reddit: "text-orange-400 bg-orange-500/10",
  substack: "text-violet-400 bg-violet-500/10",
}

const chartColors = ["#ec4899", "#3b82f6", "#f97316", "#8b5cf6"]

function StatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string
  value: string | number
  change?: number
  icon: React.ElementType
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">
          {label}
        </span>
        <Icon className="w-4 h-4 text-white/20" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-white">{value}</span>
        {change !== undefined && (
          <span
            className={`text-xs font-semibold flex items-center gap-1 ${
              change >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </motion.div>
  )
}

function PlatformCard({ stats }: { stats: PlatformStats }) {
  const Icon = platformIcons[stats.platform]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5 ${platformColors[stats.platform]} border-opacity-40`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <span className="font-bold text-white capitalize">{stats.platform}</span>
        </div>
        <span className={`text-xs font-bold ${stats.growth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {stats.growth >= 0 ? "+" : ""}{stats.growth}%
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs text-white/40 mb-1">Followers</div>
          <div className="text-xl font-black text-white">
            {stats.followers ? stats.followers.toLocaleString() : "N/A"}
          </div>
        </div>

        <div>
          <div className="text-xs text-white/40 mb-1">Engagement Rate</div>
          <div className="text-xl font-black text-white">{stats.engagement_rate}%</div>
        </div>

        <div className="pt-3 border-t border-white/[0.06]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-white/30">Avg Engagement</div>
              <div className="text-sm font-bold text-white">{stats.avg_engagement}</div>
            </div>
            <div>
              <div className="text-[10px] text-white/30">Posts</div>
              <div className="text-sm font-bold text-white">{stats.posts_count}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>(MOCK_ANALYTICS)
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState("30d")

  useEffect(() => {
    // TODO: Fetch real analytics from /api/social/insights
    setIsLoading(false)
  }, [dateRange])

  const totalReach = data.platforms.reduce((sum, p) => sum + p.reach, 0)
  const totalEngagement = data.posts.reduce((sum, p) => sum + p.engagement, 0)
  const avgEngagementRate =
    (data.platforms.reduce((sum, p) => sum + p.engagement_rate, 0) / data.platforms.length).toFixed(1)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#09090f]">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/[0.06] bg-[#0a0a14]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white">Analytics Dashboard</h1>
            <p className="text-xs text-white/30 mt-0.5">Cross-platform performance insights</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-white/[0.2]"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            <button className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors">
              <Download className="w-4 h-4 text-white/40 hover:text-white/60" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6 max-w-7xl">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Reach"
              value={totalReach.toLocaleString()}
              change={8.2}
              icon={Users}
            />
            <StatCard label="Total Engagement" value={totalEngagement.toLocaleString()} change={12.5} icon={Heart} />
            <StatCard
              label="Avg Engagement Rate"
              value={`${avgEngagementRate}%`}
              change={3.1}
              icon={TrendingUp}
            />
            <StatCard label="Top Platform" value="Reddit" icon={MessageSquare} />
          </div>

          {/* Platform Cards */}
          <div>
            <h2 className="text-sm font-bold text-white mb-4">Platform Performance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.platforms.map((platform) => (
                <PlatformCard key={platform.platform} stats={platform} />
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-6"
            >
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <LineChartIcon className="w-4 h-4" />
                Reach & Engagement Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: "12px" }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a0a14",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "white" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reach"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={{ fill: "#ec4899", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Platform Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-6"
            >
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                Reach by Platform
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.platforms}
                    dataKey="reach"
                    nameKey="platform"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.platforms.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a0a14",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "white" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Top Performing Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-6"
          >
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Top Performing Posts
            </h3>
            <div className="space-y-3">
              {data.posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium mb-1">{post.text}</div>
                    <div className="text-xs text-white/30">
                      <span className={platformColors[post.platform]}>{post.platform}</span> • {post.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{post.engagement.toLocaleString()}</div>
                    <div className="text-xs text-white/30">{post.reach.toLocaleString()} reach</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
