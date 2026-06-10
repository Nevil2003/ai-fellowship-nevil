"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  MoreHorizontal,
  Sparkles,
  Brain,
  Image,
  FileText,
  Video,
  Mail,
  Clock,
  Bell,
  Users,
  Search,
  Filter,
  Calendar,
} from "lucide-react"

type Stage = "Discovery" | "In Production" | "Review" | "Live"

interface Card {
  id: string
  title: string
  brand: string
  type: "Social" | "Ad" | "Blog" | "Email" | "Video"
  stage: Stage
  assignees: string[]
  due: string
  neuralScore?: number
  priority: "high" | "medium" | "low"
  tags: string[]
}

const typeIcons: Record<string, React.ElementType> = {
  Social: Image,
  Ad: Sparkles,
  Blog: FileText,
  Email: Mail,
  Video: Video,
}

const typeColors: Record<string, string> = {
  Social: "bg-pink-500/15 text-pink-400 border-pink-500/25",
  Ad: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  Blog: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Email: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Video: "bg-red-500/15 text-red-400 border-red-500/25",
}

const priorityColors: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-amber-500/20 text-amber-400",
  low: "bg-emerald-500/20 text-emerald-400",
}

const AVATAR_COLORS = [
  "from-violet-500 to-pink-500",
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
]

const STAGES: Stage[] = ["Discovery", "In Production", "Review", "Live"]

const stageColors: Record<Stage, string> = {
  Discovery: "border-slate-500/20",
  "In Production": "border-blue-500/20",
  Review: "border-amber-500/20",
  Live: "border-emerald-500/20",
}

const stageHeaderColors: Record<Stage, string> = {
  Discovery: "text-slate-400",
  "In Production": "text-blue-400",
  Review: "text-amber-400",
  Live: "text-emerald-400",
}

const INITIAL_CARDS: Card[] = [
  { id: "1", title: "Q2 Brand Awareness Campaign", brand: "NovaSkin", type: "Social", stage: "Discovery", assignees: ["J", "S"], due: "Apr 28", priority: "high", tags: ["Instagram", "TikTok"] },
  { id: "2", title: "Summer Sale Email Sequence", brand: "UrbanWear", type: "Email", stage: "Discovery", assignees: ["M"], due: "May 2", priority: "medium", tags: ["6-part series"] },
  { id: "3", title: "Performance Max Ad Creative", brand: "FitLife", type: "Ad", stage: "In Production", assignees: ["J", "A"], due: "Apr 25", neuralScore: 88, priority: "high", tags: ["Meta", "Google"] },
  { id: "4", title: "Founder Story Video Script", brand: "Verde Protein", type: "Video", stage: "In Production", assignees: ["S"], due: "Apr 27", priority: "medium", tags: ["YouTube", "Reels"] },
  { id: "5", title: "SEO Blog — Top 10 Protein Sources", brand: "Verde Protein", type: "Blog", stage: "In Production", assignees: ["M", "J"], due: "Apr 24", neuralScore: 74, priority: "low", tags: ["2,500 words", "SEO"] },
  { id: "6", title: "Retargeting Ad Copy — 3 Variants", brand: "NovaSkin", type: "Ad", stage: "Review", assignees: ["A", "S"], due: "Apr 23", neuralScore: 91, priority: "high", tags: ["Meta", "A/B test"] },
  { id: "7", title: "Influencer Brief Document", brand: "UrbanWear", type: "Blog", stage: "Review", assignees: ["M"], due: "Apr 22", priority: "medium", tags: ["PDF brief"] },
  { id: "8", title: "Launch Week Social Posts (12×)", brand: "FitLife", type: "Social", stage: "Live", assignees: ["J", "A", "S"], due: "Apr 20", neuralScore: 85, priority: "high", tags: ["Published"] },
  { id: "9", title: "Welcome Email Series", brand: "NovaSkin", type: "Email", stage: "Live", assignees: ["M"], due: "Apr 18", neuralScore: 79, priority: "medium", tags: ["Active", "3-part"] },
]

const TEAM = [
  { initial: "J", name: "Jordan M.", role: "Content Lead", online: true, typing: "In Production" as Stage },
  { initial: "S", name: "Sarah K.", role: "Art Director", online: true, typing: null },
  { initial: "M", name: "Marcus T.", role: "Copywriter", online: true, typing: null },
  { initial: "A", name: "Aisha R.", role: "Strategist", online: false, typing: null },
]

const NOTIFICATIONS = [
  { text: "NovaSkin retargeting ad scored 91% neural engagement", time: "2m", hot: true },
  { text: "Jordan moved 'Performance Max' to Review", time: "12m", hot: false },
  { text: "Sarah left a comment on the influencer brief", time: "30m", hot: false },
  { text: "2 campaigns due in 48 hours", time: "1h", hot: false },
]

function KanbanCard({ card, onDragStart }: { card: Card; onDragStart: (card: Card) => void }) {
  const TypeIcon = typeIcons[card.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}
      draggable
      onDragStart={() => onDragStart(card)}
      className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-3.5 cursor-grab active:cursor-grabbing select-none"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-semibold ${typeColors[card.type]}`}>
          <TypeIcon className="w-2.5 h-2.5" />
          {card.type}
        </div>
        <div className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${priorityColors[card.priority]}`}>
          {card.priority}
        </div>
      </div>

      {/* Title & brand */}
      <h3 className="text-xs font-semibold text-white leading-snug mb-1">{card.title}</h3>
      <p className="text-[10px] text-white/35 mb-3 font-medium">{card.brand}</p>

      {/* Tags */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {card.tags.map((tag) => (
            <span key={tag} className="text-[9px] text-white/30 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Neural score */}
      {card.neuralScore && (
        <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/15">
          <Brain className="w-2.5 h-2.5 text-emerald-400" />
          <span className="text-[10px] text-emerald-400 font-bold">{card.neuralScore}%</span>
          <span className="text-[9px] text-emerald-400/50">neural engagement</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {card.assignees.map((a, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} border border-[#0f0f1a] flex items-center justify-center text-[8px] font-bold text-white`}
            >
              {a}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 text-white/25">
          <Clock className="w-2.5 h-2.5" />
          <span className="text-[9px]">{card.due}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function WorkspacePage() {
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS)
  const [dragCard, setDragCard] = useState<Card | null>(null)
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null)
  const [showNotifs, setShowNotifs] = useState(false)
  const [newCardStage, setNewCardStage] = useState<Stage | null>(null)
  const [newCardTitle, setNewCardTitle] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Fetch workspace campaigns from API
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await fetch("/api/agency/workspace?workspace_id=default")
        if (res.ok) {
          const data = await res.json()
          if (data.data?.campaigns && Array.isArray(data.data.campaigns)) {
            // Map API campaigns to card format (with fallback to INITIAL_CARDS if empty)
            const apiCards = data.data.campaigns.map((campaign: any) => ({
              id: campaign.id || Math.random().toString(36).substr(2, 9),
              title: campaign.name,
              brand: campaign.target_audience || "New Campaign",
              type: (campaign.channels?.[0]?.includes("instagram") ? "Social" :
                     campaign.channels?.[0]?.includes("email") ? "Email" :
                     campaign.channels?.[0]?.includes("ad") ? "Ad" : "Social") as Card["type"],
              stage: (campaign.status === "active" ? "In Production" :
                      campaign.status === "completed" ? "Live" : "Discovery") as Stage,
              assignees: ["M"],
              due: campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : "TBD",
              priority: campaign.budget && campaign.budget > 5000 ? "high" : "medium" as const,
              tags: campaign.channels || [],
            }))
            if (apiCards.length > 0) {
              setCards(apiCards)
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch workspace:", err)
        // Fallback to INITIAL_CARDS
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkspace()
  }, [])

  const handleDrop = (stage: Stage) => {
    if (!dragCard) return
    setCards((prev) => prev.map((c) => (c.id === dragCard.id ? { ...c, stage } : c)))
    setDragCard(null)
    setDragOverStage(null)
  }

  const addCard = async (stage: Stage) => {
    if (!newCardTitle.trim()) return

    try {
      // Create campaign via API
      const res = await fetch("/api/agency/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: "default",
          name: newCardTitle,
          status: stage === "Discovery" ? "draft" : "active",
          target_audience: "New Audience",
        }),
      })

      if (res.ok) {
        const apiCampaign = await res.json()
        const card: Card = {
          id: apiCampaign.data?.id || Date.now().toString(),
          title: newCardTitle,
          brand: "New Brand",
          type: "Social",
          stage,
          assignees: ["J"],
          due: "TBD",
          priority: "medium",
          tags: [],
        }
        setCards((prev) => [...prev, card])
      }
    } catch (err) {
      console.error("Failed to create campaign:", err)
      // Fallback: still add to local state
      const card: Card = {
        id: Date.now().toString(),
        title: newCardTitle,
        brand: "New Brand",
        type: "Social",
        stage,
        assignees: ["J"],
        due: "TBD",
        priority: "medium",
        tags: [],
      }
      setCards((prev) => [...prev, card])
    }

    setNewCardTitle("")
    setNewCardStage(null)
  }

  const typingMember = TEAM.find((t) => t.typing)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#09090f]">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/[0.06] bg-[#0a0a14]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white">Campaign Workspace</h1>
            <p className="text-xs text-white/30 mt-0.5">
              {cards.length} cards across {STAGES.length} stages
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Typing indicator */}
            {typingMember && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400"
              >
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 rounded-full bg-blue-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                {typingMember.name} is working in {typingMember.typing}
              </motion.div>
            )}

            {/* Team avatars */}
            <div className="flex -space-x-2">
              {TEAM.map((m, i) => (
                <div
                  key={m.initial}
                  title={`${m.name} · ${m.online ? "Online" : "Offline"}`}
                  className={`relative w-7 h-7 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i]} border-2 border-[#0a0a14] flex items-center justify-center text-[9px] font-bold text-white`}
                >
                  {m.initial}
                  {m.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-[#0a0a14]" />
                  )}
                </div>
              ))}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs((v) => !v)}
                className="relative p-2 rounded-lg border border-white/[0.07] hover:bg-white/[0.05] transition-colors"
              >
                <Bell className="w-4 h-4 text-white/40" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full" />
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.96 }}
                    className="absolute right-0 top-10 w-72 bg-[#0f0f1a] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Notifications</span>
                      <span className="text-[10px] text-violet-400 cursor-pointer hover:text-violet-300">Mark all read</span>
                    </div>
                    {NOTIFICATIONS.map((n, i) => (
                      <div key={i} className="px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                        <div className="flex items-start gap-2">
                          {n.hot && <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1 shrink-0" />}
                          <p className="text-xs text-white/60 leading-snug flex-1">{n.text}</p>
                          <span className="text-[9px] text-white/25 shrink-0">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.07] bg-[#0f0f1a]">
              <Search className="w-3.5 h-3.5 text-white/30" />
              <input
                placeholder="Search campaigns..."
                className="bg-transparent text-xs text-white/60 placeholder:text-white/25 outline-none w-28"
              />
            </div>

            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.07] text-xs text-white/40 hover:text-white/70 transition-colors">
              <Filter className="w-3 h-3" />
              Filter
            </button>

            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 text-xs font-bold text-white hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20">
              <Plus className="w-3.5 h-3.5" />
              New Campaign
            </button>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full px-6 py-5" style={{ minWidth: "max-content" }}>
          {STAGES.map((stage) => {
            const stageCards = cards.filter((c) => c.stage === stage)
            const isDragOver = dragOverStage === stage

            return (
              <div
                key={stage}
                className={`flex flex-col w-64 shrink-0 rounded-xl border transition-all ${
                  isDragOver
                    ? "border-violet-500/50 bg-violet-500/5"
                    : stageColors[stage] + " bg-[#0b0b15]"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage) }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={() => handleDrop(stage)}
              >
                {/* Column header */}
                <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${stageHeaderColors[stage]}`}>{stage}</span>
                    <span className="text-[10px] text-white/25 bg-white/[0.06] px-1.5 py-0.5 rounded-full">
                      {stageCards.length}
                    </span>
                  </div>
                  <button className="text-white/20 hover:text-white/50 transition-colors">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
                  <AnimatePresence>
                    {stageCards.map((card) => (
                      <KanbanCard key={card.id} card={card} onDragStart={setDragCard} />
                    ))}
                  </AnimatePresence>

                  {/* Drop zone indicator */}
                  {isDragOver && dragCard && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-16 rounded-xl border-2 border-dashed border-violet-500/40 bg-violet-500/5 flex items-center justify-center"
                    >
                      <span className="text-[10px] text-violet-400/60">Drop here</span>
                    </motion.div>
                  )}

                  {/* Add card form */}
                  {newCardStage === stage ? (
                    <div className="p-3 bg-[#0f0f1a] border border-violet-500/30 rounded-xl">
                      <input
                        autoFocus
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addCard(stage)
                          if (e.key === "Escape") setNewCardStage(null)
                        }}
                        placeholder="Campaign title..."
                        className="w-full bg-transparent text-xs text-white placeholder:text-white/25 outline-none mb-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => addCard(stage)}
                          className="text-[10px] px-2 py-1 bg-violet-600 text-white rounded-md hover:bg-violet-500 transition-colors font-medium"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setNewCardStage(null)}
                          className="text-[10px] px-2 py-1 text-white/30 hover:text-white/60 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewCardStage(stage)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-all text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add card
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Team status bar */}
      <div className="shrink-0 px-6 py-2.5 border-t border-white/[0.05] bg-[#0a0a12] flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Users className="w-3 h-3 text-white/30" />
          <span className="text-[10px] text-white/30 font-medium">Team</span>
        </div>
        {TEAM.map((m, i) => (
          <div key={m.initial} className="flex items-center gap-1.5">
            <div
              className={`w-4 h-4 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i]} flex items-center justify-center text-[7px] font-bold text-white`}
            />
            <span className="text-[10px] text-white/40">{m.name.split(" ")[0]}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${m.online ? "bg-emerald-400" : "bg-white/20"}`} />
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2 text-white/25">
          <Calendar className="w-3 h-3" />
          <span className="text-[10px]">Sprint ends Apr 30</span>
        </div>
      </div>
    </div>
  )
}
