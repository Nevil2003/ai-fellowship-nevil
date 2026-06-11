"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart2,
  Brain,
  Download,
  Heart,
  LineChart as LineChartIcon,
  MessageSquare,
  PieChart as PieChartIcon,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { getActivity, getStats, timeAgo, type ActivityEvent } from "@/lib/local-stats"

const colors = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f97316", "#f59e0b"]

const kindLabel: Record<ActivityEvent["kind"], string> = {
  generate: "Generated",
  score: "Scored",
  chat: "Consulted",
  campaign: "Campaigns",
  publish: "Published",
  reputation: "Reputation",
}

const kindIcon: Record<ActivityEvent["kind"], React.ElementType> = {
  generate: Sparkles,
  score: Brain,
  chat: MessageSquare,
  campaign: BarChart2,
  publish: Share2,
  reputation: Heart,
}

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: React.ElementType }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">{label}</span>
        <Icon className="w-4 h-4 text-white/20" />
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-[10px] text-white/30 mt-1">{sub}</div>
    </motion.div>
  )
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [dateRange, setDateRange] = useState("30d")

  useEffect(() => {
    const load = () => setEvents(getActivity())
    load()
    window.addEventListener("mastical:activity", load)
    return () => window.removeEventListener("mastical:activity", load)
  }, [])

  const filteredEvents = useMemo(() => {
    if (dateRange === "all") return events
    const days = dateRange === "7d" ? 7 : dateRange === "90d" ? 90 : 30
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    return events.filter((event) => event.ts >= cutoff)
  }, [dateRange, events])

  const stats = getStats()
  const scores = filteredEvents.filter((event) => typeof event.score === "number").map((event) => event.score as number)
  const avgScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null
  const mix = (Object.keys(kindLabel) as ActivityEvent["kind"][])
    .map((kind) => ({ kind, name: kindLabel[kind], value: filteredEvents.filter((event) => event.kind === kind).length }))
    .filter((item) => item.value > 0)

  const timeline = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const key = date.toLocaleDateString("en-US", { weekday: "short" })
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    const dayEnd = dayStart + 24 * 60 * 60 * 1000
    const dayEvents = filteredEvents.filter((event) => event.ts >= dayStart && event.ts < dayEnd)
    return {
      day: key,
      activity: dayEvents.length,
      score: dayEvents.filter((event) => typeof event.score === "number").length,
      publish: dayEvents.filter((event) => event.kind === "publish").length,
    }
  })

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), events: filteredEvents }, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mastical-usage-analytics.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const topAction = mix[0]?.name || "No activity yet"

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#09090f]">
      <div className="shrink-0 px-6 py-4 border-b border-white/[0.06] bg-[#0a0a14]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white">Analytics Dashboard</h1>
            <p className="text-xs text-white/30 mt-0.5">Usage analytics from this workspace, not demo constants</p>
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
            <button onClick={exportJson} className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors" title="Export usage data">
              <Download className="w-4 h-4 text-white/40 hover:text-white/60" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Actions Logged" value={filteredEvents.length.toString()} sub={`${stats.thisWeek.generated + stats.thisWeek.scored} core actions this week`} icon={Users} />
            <StatCard label="Content Generated" value={stats.contentGenerated.toString()} sub="Created in Content Studio" icon={Sparkles} />
            <StatCard label="Scores Run" value={stats.scoresRun.toString()} sub={avgScore ? `${avgScore}% average in this range` : "No scores yet"} icon={Brain} />
            <StatCard label="Top Workflow" value={topAction} sub="Based on local activity mix" icon={TrendingUp} />
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-8 text-center">
              <LineChartIcon className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <h2 className="text-sm font-bold text-white mb-1">No usage data yet</h2>
              <p className="text-xs text-white/35 max-w-md mx-auto">
                Generate content, run a neural score, publish through Social Hub, or scan Reputation. This page will fill with your real workspace activity.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <LineChartIcon className="w-4 h-4" />
                    Activity Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" style={{ fontSize: "12px" }} />
                      <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: "12px" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0a0a14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} labelStyle={{ color: "white" }} />
                      <Bar dataKey="activity" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="score" fill="#10b981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="publish" fill="#ec4899" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4" />
                    Workflow Mix
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={mix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={105} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {mix.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0a0a14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} labelStyle={{ color: "white" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {filteredEvents.slice(0, 12).map((event, index) => {
                    const Icon = kindIcon[event.kind]
                    return (
                      <div key={`${event.ts}-${index}`} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className="w-4 h-4 text-violet-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm text-white font-medium truncate">{event.message}</div>
                            <div className="text-xs text-white/30">{kindLabel[event.kind]} - {timeAgo(event.ts)}</div>
                          </div>
                        </div>
                        {typeof event.score === "number" && <div className="text-sm font-bold text-emerald-400">{event.score}%</div>}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
