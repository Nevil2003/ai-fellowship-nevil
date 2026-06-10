"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  MessageSquareText,
  Kanban,
  Sparkles,
  Brain,
  ArrowRight,
  TrendingUp,
  Users,
  FileText,
  Zap,
  ExternalLink,
  Clock,
  CheckCircle2,
  Circle,
  BarChart2,
  Flame,
} from "lucide-react"

const stats = [
  {
    label: "Active Campaigns",
    value: "12",
    change: "+3 this week",
    icon: Kanban,
    color: "violet",
    glow: "rgba(139,92,246,0.15)",
  },
  {
    label: "Content Generated",
    value: "248",
    change: "+41 this week",
    icon: FileText,
    color: "pink",
    glow: "rgba(236,72,153,0.15)",
  },
  {
    label: "Team Online",
    value: "4 / 6",
    change: "2 members offline",
    icon: Users,
    color: "cyan",
    glow: "rgba(6,182,212,0.15)",
  },
  {
    label: "Avg Neural Score",
    value: "87%",
    change: "+5% vs last month",
    icon: Brain,
    color: "green",
    glow: "rgba(16,185,129,0.15)",
  },
]

const quickActions = [
  {
    href: "/agency/chat",
    label: "Start AI Consultation",
    sub: "Dump your ideas — get a strategy",
    icon: MessageSquareText,
    gradient: "from-violet-600 to-violet-800",
    glow: "shadow-violet-500/20",
  },
  {
    href: "/agency/workspace",
    label: "Open Workspace",
    sub: "Manage campaigns & team boards",
    icon: Kanban,
    gradient: "from-pink-600 to-rose-700",
    glow: "shadow-pink-500/20",
  },
  {
    href: "/agency/studio",
    label: "Generate Content",
    sub: "Social, ads, blogs, email & scripts",
    icon: Sparkles,
    gradient: "from-indigo-600 to-blue-700",
    glow: "shadow-indigo-500/20",
  },
  {
    href: "/agency/neural",
    label: "Score My Content",
    sub: "Predict neural engagement & attention",
    icon: Brain,
    gradient: "from-emerald-600 to-teal-700",
    glow: "shadow-emerald-500/20",
  },
]

const activity = [
  {
    icon: CheckCircle2,
    color: "text-emerald-400",
    message: "Meta Ad copy for Q2 Campaign scored 91% neural engagement",
    time: "2m ago",
  },
  {
    icon: Sparkles,
    color: "text-violet-400",
    message: "Jordan generated 6 Instagram posts for FitLife brand",
    time: "18m ago",
  },
  {
    icon: Users,
    color: "text-pink-400",
    message: "Sarah moved 'TechCorp Launch' to Review stage",
    time: "34m ago",
  },
  {
    icon: Brain,
    color: "text-cyan-400",
    message: "Email newsletter scored 79% — 3 recommendations applied",
    time: "1h ago",
  },
  {
    icon: MessageSquareText,
    color: "text-yellow-400",
    message: "AI Consultant session: Brand strategy for NovaSkin completed",
    time: "2h ago",
  },
  {
    icon: Circle,
    color: "text-white/30",
    message: "New workspace campaign created: 'UrbanWear Summer Drop'",
    time: "3h ago",
  },
]

const colorMap: Record<string, string> = {
  violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  pink: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" },
  }),
}

export default function AgencyDashboard() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <div className="min-h-full px-8 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-xs text-white/30 font-medium">Day 14 streak — keep the momentum</span>
        </div>
        <h1 className="text-3xl font-black text-white">
          {greeting}, Admin.{" "}
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            Let&apos;s build.
          </span>
        </h1>
        <p className="text-sm text-white/40 mt-1.5">
          Your agency OS is live — 4 campaigns running, 2 pending neural review.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              custom={i}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className={`relative overflow-hidden rounded-xl p-4 border bg-[#0f0f1a] ${colorMap[stat.color].split(" ").slice(2).join(" ")}`}
              style={{ boxShadow: `0 0 30px ${stat.glow}` }}
            >
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-3 ${colorMap[stat.color]}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-white mb-0.5">{stat.value}</div>
              <div className="text-[11px] text-white/40 font-medium mb-1">{stat.label}</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400/80">{stat.change}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.href}
                  custom={i + 4}
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                >
                  <Link href={action.href}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative overflow-hidden rounded-xl p-5 border border-white/[0.06] bg-[#0f0f1a] hover:border-white/10 transition-all cursor-pointer shadow-lg ${action.glow}`}
                    >
                      <div
                        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${action.gradient} opacity-[0.04]`}
                      />
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-lg`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-sm font-bold text-white mb-1">{action.label}</div>
                      <div className="text-xs text-white/40">{action.sub}</div>
                      <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest">Live Activity</h2>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-400/70">Live</span>
            </span>
          </div>
          <div className="space-y-1">
            {activity.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={i}
                  custom={i + 8}
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  className="flex gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${item.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/60 leading-relaxed">{item.message}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-2.5 h-2.5 text-white/20" />
                      <span className="text-[10px] text-white/25">{item.time}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Performance bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-8 p-5 rounded-xl border border-white/[0.06] bg-[#0f0f1a]"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-bold text-white">Weekly Content Performance</span>
          </div>
          <span className="text-xs text-white/30">Apr 14 – Apr 21</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
            const heights = [45, 70, 55, 90, 75, 40, 60]
            const scores = [82, 88, 79, 94, 91, 76, 87]
            return (
              <div key={day} className="flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-16">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heights[i]}%` }}
                    transition={{ delay: 0.6 + i * 0.05, duration: 0.5, ease: "easeOut" }}
                    className="w-full rounded-sm bg-gradient-to-t from-violet-600/60 to-violet-400/30 max-h-full"
                    title={`Neural Score: ${scores[i]}%`}
                  />
                </div>
                <span className="text-[9px] text-white/30 font-medium">{day}</span>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Mastical Growth Partner Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl p-8 border border-violet-500/20 bg-gradient-to-r from-violet-950/80 via-indigo-950/60 to-violet-950/80"
      >
        {/* Glow orbs */}
        <div className="absolute -top-1/2 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-1/3 -left-1/6 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-[10px] font-bold text-yellow-400/80 uppercase tracking-[0.2em]">
                Growth Partner
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mb-3 leading-tight">
              Ready to scale beyond content?
            </h2>
            <p className="text-sm text-white/50 leading-relaxed max-w-xl">
              You&apos;ve got the content engine running. Now let&apos;s build the product. If you want to launch a
              new MVP or automate complex operational workflows,{" "}
              <span className="text-white/80 font-semibold">use our brain.</span>
            </p>
          </div>
          <div className="shrink-0">
            <a
              href="https://mastical.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-500 rounded-xl text-white font-bold text-sm hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-xl shadow-violet-500/30 cursor-pointer"
            >
              Contact Mastical.com
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </motion.div>

      <div className="h-8" />
    </div>
  )
}
