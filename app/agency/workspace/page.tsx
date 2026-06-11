"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, Kanban, Plus, Target } from "lucide-react"
import { logActivity } from "@/lib/local-stats"

const columns = ["Backlog", "Writing", "Review", "Ready"] as const

export default function WorkspacePage() {
  const [cards, setCards] = useState([
    { id: "1", title: "Launch post for Mastical Agency OS", column: "Backlog", owner: "Admin" },
    { id: "2", title: "Repurpose neural score demo into LinkedIn carousel", column: "Writing", owner: "Admin" },
    { id: "3", title: "Scan competitor mentions and draft replies", column: "Review", owner: "Admin" },
  ])
  const [title, setTitle] = useState("")

  const readyCount = useMemo(() => cards.filter((card) => card.column === "Ready").length, [cards])

  const addCard = () => {
    if (!title.trim()) return
    setCards((prev) => [...prev, { id: crypto.randomUUID(), title: title.trim(), column: "Backlog", owner: "Admin" }])
    logActivity({ kind: "campaign", message: `Added workspace task: ${title.trim()}` })
    setTitle("")
  }

  const moveCard = (id: string, column: string) => {
    setCards((prev) => prev.map((card) => card.id === id ? { ...card, column } : card))
  }

  return (
    <div className="min-h-full bg-[#09090f]">
      <div className="px-8 py-5 border-b border-white/[0.06] bg-[#0a0a14]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Kanban className="w-5 h-5 text-violet-400" />
              Workspace
            </h1>
            <p className="text-xs text-white/30 mt-0.5">Plan campaigns and move content from idea to ready</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-semibold">{readyCount} ready</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="flex gap-2 max-w-xl">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addCard() }}
            placeholder="Add a campaign task..."
            className="flex-1 bg-[#0f0f1a] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/40"
          />
          <button onClick={addCard} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-600 text-sm font-bold text-white hover:bg-violet-500">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <div key={column} className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4 min-h-[420px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-white/55 uppercase tracking-widest">{column}</h2>
                <span className="text-[10px] text-white/25">{cards.filter((card) => card.column === column).length}</span>
              </div>
              <div className="space-y-3">
                {cards.filter((card) => card.column === column).map((card) => (
                  <motion.div key={card.id} layout className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-4">
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-white leading-snug">{card.title}</p>
                        <p className="text-[10px] text-white/30 mt-1">Owner: {card.owner}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {columns.filter((next) => next !== column).map((next) => (
                        <button key={next} onClick={() => moveCard(card.id, next)} className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.04] text-white/35 hover:text-white/70 hover:bg-white/[0.08]">
                          Move to {next}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
