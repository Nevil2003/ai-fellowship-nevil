"use client"

import { useState, useCallback, useEffect } from "react"
import {
  FUNDING_PROGRAMS,
  PROPSTICAL_CONTEXT,
  TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  TYPE_COLORS,
  type FundingProgram,
  type ProgramType,
  type ApplicationStatus,
} from "@/lib/funding-programs"
import { loadAIConfig, getBaseUrl, getProviderHeaders, useAISettings } from "@/lib/ai-settings"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApplicationState {
  status: ApplicationStatus
  answers: Record<string, string>
  generating: Record<string, boolean>
  notes: string
  lastUpdated?: string
}

type AllApplications = Record<string, ApplicationState>

const STORAGE_KEY = "propstical-funding-applications"

function loadApplications(): AllApplications {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveApplications(apps: AllApplications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps))
}

function defaultApp(): ApplicationState {
  return { status: "not_started", answers: {}, generating: {}, notes: "" }
}

// ─── Pill ────────────────────────────────────────────────────────────────────

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${className}`}>
      {label}
    </span>
  )
}

// ─── Program Card ─────────────────────────────────────────────────────────────

function ProgramCard({
  program,
  appState,
  selected,
  onClick,
}: {
  program: FundingProgram
  appState: ApplicationState
  selected: boolean
  onClick: () => void
}) {
  const answeredCount = Object.keys(appState.answers).filter(k => appState.answers[k]?.trim()).length
  const totalQ = program.questions.length
  const pct = totalQ > 0 ? Math.round((answeredCount / totalQ) * 100) : 0

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
        selected
          ? "border-white/30 bg-white/8"
          : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{program.emoji}</span>
          <div>
            <div className="font-semibold text-sm text-white leading-tight">{program.shortName}</div>
            <div className="text-[10px] text-zinc-500 leading-tight">{program.amount} · {program.equity}</div>
          </div>
        </div>
        <Pill label={STATUS_LABELS[appState.status]} className={STATUS_COLORS[appState.status]} />
      </div>
      <Pill label={TYPE_LABELS[program.type]} className={TYPE_COLORS[program.type]} />
      {pct > 0 && (
        <div className="mt-2">
          <div className="w-full bg-white/5 rounded-full h-1">
            <div
              className="bg-white/40 h-1 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-[9px] text-zinc-500 mt-1">{answeredCount}/{totalQ} questions answered</div>
        </div>
      )}
    </button>
  )
}

// ─── Answer Block ─────────────────────────────────────────────────────────────

function AnswerBlock({
  question,
  answer,
  isGenerating,
  onGenerate,
  onChange,
}: {
  question: { id: string; label: string; placeholder: string; maxWords?: number; type: string }
  answer: string
  isGenerating: boolean
  onGenerate: () => void
  onChange: (val: string) => void
}) {
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0
  const limit = question.maxWords

  return (
    <div className="border border-white/8 rounded-xl p-4 bg-white/2">
      <div className="flex items-start justify-between gap-3 mb-3">
        <label className="text-sm text-zinc-200 font-medium leading-snug flex-1">{question.label}</label>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200"
        >
          {isGenerating ? (
            <>
              <span className="w-3 h-3 border border-zinc-400 border-t-transparent rounded-full animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <span>✦</span>
              {answer ? "Regenerate" : "Generate"}
            </>
          )}
        </button>
      </div>

      <textarea
        value={answer}
        onChange={e => onChange(e.target.value)}
        placeholder={question.placeholder}
        rows={question.type === "short" ? 2 : 5}
        className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none focus:outline-none focus:border-white/25 transition-colors"
      />

      {limit && (
        <div className={`text-[10px] mt-1 text-right ${wordCount > limit ? "text-red-400" : "text-zinc-600"}`}>
          {wordCount} / {limit} words
        </div>
      )}
    </div>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ applications }: { applications: AllApplications }) {
  const counts = Object.values(applications).reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    },
    {} as Record<ApplicationStatus, number>
  )

  const stats = [
    { label: "Total", value: FUNDING_PROGRAMS.length, color: "text-zinc-300" },
    { label: "Drafting", value: counts.drafting || 0, color: "text-yellow-400" },
    { label: "Submitted", value: counts.submitted || 0, color: "text-blue-400" },
    { label: "Interviewing", value: counts.interviewing || 0, color: "text-purple-400" },
    { label: "Accepted", value: counts.accepted || 0, color: "text-green-400" },
  ]

  return (
    <div className="flex gap-6 items-center">
      {stats.map(s => (
        <div key={s.label} className="text-center">
          <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{s.label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FundingAgentPage() {
  const [applications, setApplications] = useState<AllApplications>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<ProgramType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">("all")
  const [exportMsg, setExportMsg] = useState("")
  const { settings } = useAISettings()

  useEffect(() => {
    setApplications(loadApplications())
    if (FUNDING_PROGRAMS[0]) setSelectedId(FUNDING_PROGRAMS[0].id)
  }, [])

  const getApp = useCallback(
    (id: string): ApplicationState => applications[id] ?? defaultApp(),
    [applications]
  )

  const patchApp = useCallback(
    (id: string, patch: Partial<ApplicationState>) => {
      setApplications(prev => {
        const next = { ...prev, [id]: { ...defaultApp(), ...prev[id], ...patch, lastUpdated: new Date().toISOString() } }
        saveApplications(next)
        return next
      })
    },
    []
  )

  const handleGenerate = useCallback(
    async (program: FundingProgram, questionId: string) => {
      const question = program.questions.find(q => q.id === questionId)
      if (!question) return

      const config = loadAIConfig()
      if (!config?.apiKey) {
        alert("Please set your API key in Propstical Canvas settings first.")
        return
      }

      patchApp(program.id, {
        generating: { ...getApp(program.id).generating, [questionId]: true },
        status: getApp(program.id).status === "not_started" ? "drafting" : getApp(program.id).status,
      })

      try {
        const res = await fetch("/api/funding-apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            programName: program.name,
            programType: TYPE_LABELS[program.type],
            question: question.label,
            questionId,
            apiKey: config.apiKey,
            modelId: config.modelId,
            provider: config.provider,
            customBaseUrl: config.customBaseUrl,
          }),
        })
        const data = await res.json()
        if (data.answer) {
          const cur = getApp(program.id)
          patchApp(program.id, {
            answers: { ...cur.answers, [questionId]: data.answer },
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        const cur = getApp(program.id)
        const nextGen = { ...cur.generating }
        delete nextGen[questionId]
        patchApp(program.id, { generating: nextGen })
      }
    },
    [getApp, patchApp]
  )

  const handleGenerateAll = useCallback(
    async (program: FundingProgram) => {
      for (const q of program.questions) {
        await handleGenerate(program, q.id)
      }
    },
    [handleGenerate]
  )

  const handleExport = useCallback(
    (program: FundingProgram) => {
      const app = getApp(program.id)
      const lines: string[] = [
        `# ${program.name} — Propstical Application`,
        `Status: ${STATUS_LABELS[app.status]}`,
        `Exported: ${new Date().toLocaleDateString()}`,
        "",
        "---",
        "",
      ]
      for (const q of program.questions) {
        lines.push(`## ${q.label}`)
        lines.push(app.answers[q.id] || "_Not answered yet_")
        lines.push("")
      }
      if (app.notes) {
        lines.push("## Notes")
        lines.push(app.notes)
      }

      const blob = new Blob([lines.join("\n")], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `propstical-${program.id}-application.md`
      a.click()
      URL.revokeObjectURL(url)
      setExportMsg(`Exported ${program.shortName} application!`)
      setTimeout(() => setExportMsg(""), 3000)
    },
    [getApp]
  )

  const filtered = FUNDING_PROGRAMS.filter(p => {
    if (filterType !== "all" && p.type !== filterType) return false
    if (filterStatus !== "all") {
      const app = getApp(p.id)
      if (app.status !== filterStatus) return false
    }
    return true
  })

  const selectedProgram = FUNDING_PROGRAMS.find(p => p.id === selectedId)
  const selectedApp = selectedId ? getApp(selectedId) : null
  const isAnyGenerating = selectedApp ? Object.values(selectedApp.generating).some(Boolean) : false

  const allAnswered =
    selectedProgram && selectedApp
      ? selectedProgram.questions.every(q => selectedApp.answers[q.id]?.trim())
      : false

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">← Canvas</a>
            <span className="text-zinc-700">/</span>
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">Funding Agent</h1>
              <p className="text-xs text-zinc-500">AI-powered applications for {FUNDING_PROGRAMS.length} programs</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatsBar applications={applications} />
            {exportMsg && (
              <span className="text-xs text-green-400 bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-800">
                {exportMsg}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* Left sidebar — program list */}
        <aside className="w-72 shrink-0 border-r border-white/8 p-4 flex flex-col gap-3 overflow-y-auto">
          {/* Filters */}
          <div className="space-y-2">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Type</div>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "fellowship", "accelerator", "vc", "corporate"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${
                    filterType === t
                      ? "bg-white/15 border-white/25 text-white"
                      : "bg-white/3 border-white/8 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  {t === "all" ? "All" : TYPE_LABELS[t as ProgramType]}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Status</div>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "not_started", "drafting", "submitted", "interviewing", "accepted"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${
                    filterStatus === s
                      ? "bg-white/15 border-white/25 text-white"
                      : "bg-white/3 border-white/8 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  {s === "all" ? "All" : STATUS_LABELS[s as ApplicationStatus]}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/8 pt-3 space-y-2">
            {filtered.length === 0 && (
              <div className="text-xs text-zinc-600 text-center py-4">No programs match filters</div>
            )}
            {filtered.map(p => (
              <ProgramCard
                key={p.id}
                program={p}
                appState={getApp(p.id)}
                selected={selectedId === p.id}
                onClick={() => setSelectedId(p.id)}
              />
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {!selectedProgram ? (
            <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
              Select a program to start
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Program header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-3xl">{selectedProgram.emoji}</span>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedProgram.name}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Pill label={TYPE_LABELS[selectedProgram.type]} className={TYPE_COLORS[selectedProgram.type]} />
                        <span className="text-xs text-zinc-500">{selectedProgram.amount} · {selectedProgram.equity} equity · {selectedProgram.location}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 max-w-2xl">{selectedProgram.description}</p>
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  {/* Status selector */}
                  <select
                    value={selectedApp?.status ?? "not_started"}
                    onChange={e => patchApp(selectedProgram.id, { status: e.target.value as ApplicationStatus })}
                    className="bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-white/30"
                  >
                    {Object.entries(STATUS_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerateAll(selectedProgram)}
                      disabled={isAnyGenerating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {isAnyGenerating ? (
                        <>
                          <span className="w-3 h-3 border border-black/30 border-t-black/80 rounded-full animate-spin" />
                          Generating…
                        </>
                      ) : (
                        <>✦ Generate All</>
                      )}
                    </button>
                    <button
                      onClick={() => handleExport(selectedProgram)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/15 text-zinc-300 hover:border-white/30 hover:text-white transition-colors"
                    >
                      Export .md
                    </button>
                    <a
                      href={selectedProgram.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/15 text-zinc-300 hover:border-white/30 hover:text-white transition-colors"
                    >
                      Apply ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* Program details */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/3 border border-white/8 rounded-xl p-3">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Deadline</div>
                  <div className="text-sm text-zinc-200 font-medium">{selectedProgram.deadline}</div>
                </div>
                <div className="bg-white/3 border border-white/8 rounded-xl p-3">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Stage</div>
                  <div className="text-sm text-zinc-200 font-medium">{selectedProgram.stage}</div>
                </div>
                <div className="bg-white/3 border border-white/8 rounded-xl p-3">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Focus Areas</div>
                  <div className="text-xs text-zinc-300">{selectedProgram.focusAreas.slice(0, 3).join(", ")}</div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-4">
                <div className="text-xs font-semibold text-amber-400 mb-2">Application Tips for {selectedProgram.shortName}</div>
                <ul className="space-y-1">
                  {selectedProgram.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-amber-200/70 flex gap-2">
                      <span className="text-amber-600 shrink-0">·</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-zinc-200">Application Questions</h3>
                  {allAnswered && (
                    <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded-lg border border-green-800">
                      All {selectedProgram.questions.length} questions answered
                    </span>
                  )}
                </div>
                {selectedProgram.questions.map(q => (
                  <AnswerBlock
                    key={q.id}
                    question={q}
                    answer={selectedApp?.answers[q.id] ?? ""}
                    isGenerating={selectedApp?.generating[q.id] ?? false}
                    onGenerate={() => handleGenerate(selectedProgram, q.id)}
                    onChange={val => {
                      const cur = getApp(selectedProgram.id)
                      patchApp(selectedProgram.id, {
                        answers: { ...cur.answers, [q.id]: val },
                        status: cur.status === "not_started" ? "drafting" : cur.status,
                      })
                    }}
                  />
                ))}
              </div>

              {/* Notes */}
              <div className="border border-white/8 rounded-xl p-4 bg-white/2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                  Private Notes (not exported)
                </label>
                <textarea
                  value={selectedApp?.notes ?? ""}
                  onChange={e => patchApp(selectedProgram.id, { notes: e.target.value })}
                  placeholder="Contacts, deadlines, follow-up actions, interview notes…"
                  rows={3}
                  className="w-full bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-700 resize-none focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              {/* Propstical context panel */}
              <div className="border border-white/8 rounded-xl p-4 bg-white/2">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Propstical Context (used by AI)
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400">
                  <div><span className="text-zinc-600">Problem:</span> {PROPSTICAL_CONTEXT.problem.slice(0, 100)}…</div>
                  <div><span className="text-zinc-600">Market:</span> {PROPSTICAL_CONTEXT.market.slice(0, 100)}…</div>
                  <div><span className="text-zinc-600">Traction:</span> {PROPSTICAL_CONTEXT.traction.slice(0, 100)}…</div>
                  <div><span className="text-zinc-600">Raise:</span> {PROPSTICAL_CONTEXT.raise}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
