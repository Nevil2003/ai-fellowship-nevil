"use client"

import { useState, useCallback } from "react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { CONTENT_TYPE_CONFIG } from "@/lib/content-types"
import {
  Sparkles, Layers, Kanban, GitFork, FolderDown,
  FolderInput, Download, Brain, Zap, Globe, Search, Check, Mail
} from "lucide-react"
import { useModKey } from "@/lib/utils"

interface AboutPanelProps {
  open: boolean
  onClose: () => void
}

function CopyEmailButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("mskayyali@me.com").then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest border px-2 py-0.5 rounded-sm transition-all duration-300 cursor-pointer"
      style={{
        color:       copied ? "var(--color-emerald-400, #34d399)" : "color-mix(in oklch, var(--primary) 60%, transparent)",
        borderColor: copied ? "color-mix(in oklch, var(--color-emerald-400, #34d399) 35%, transparent)" : "color-mix(in oklch, var(--primary) 25%, transparent)",
      }}
    >
      <span className="relative flex items-center" style={{ width: "12px", height: "12px" }}>
        <Mail
          className="absolute inset-0 transition-all duration-300"
          style={{ width: "12px", height: "12px", opacity: copied ? 0 : 1, transform: copied ? "scale(0.6)" : "scale(1)" }}
        />
        <Check
          className="absolute inset-0 transition-all duration-300"
          style={{ width: "12px", height: "12px", opacity: copied ? 1 : 0, transform: copied ? "scale(1)" : "scale(0.6)" }}
        />
      </span>
      <span className="transition-all duration-300" style={{ opacity: copied ? 0.7 : 1 }}>
        {copied ? "Copied!" : "Copy email"}
      </span>
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 border border-primary/20 font-mono text-[10px] font-black text-primary">
        {n}
      </div>
      <div className="space-y-1 pt-0.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  )
}

function Shortcut({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <kbd key={i} className="px-1.5 py-0.5 rounded-sm bg-secondary border border-border font-mono text-[10px] text-foreground">
            {k}
          </kbd>
        ))}
      </div>
    </div>
  )
}

const CONTENT_TYPE_HIGHLIGHTS = [
  "claim", "question", "idea", "task", "thesis", "quote", "entity", "reference"
] as const

export function AboutPanel({ open, onClose }: AboutPanelProps) {
  const mod = useModKey()
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl flex flex-col gap-0 p-0 bg-card border-l border-border z-[200] overflow-hidden"
      >
        <SheetTitle className="sr-only">About Propstical Canvas</SheetTitle>

        {/* Header */}
        <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-0.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-primary" />
              <span className="inline-block h-3 w-3 rounded-sm bg-primary/60" />
              <span className="inline-block h-3 w-3 rounded-sm bg-primary/30" />
            </div>
            <h1 className="font-mono text-xl font-black text-foreground tracking-tight">propstical canvas</h1>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
            India&rsquo;s first AI home-decision canvas. Lay out every renovation variable &mdash; materials, quotes, dimensions, budget, inspiration &mdash; and let the AI quietly catch the conflicts, hidden costs, and rework risks before you commit.
          </p>
          <p className="mt-2 text-xs font-mono text-primary/60 uppercase tracking-widest">
            See it before you spend on it
          </p>
          <p className="mt-3 text-xs text-muted-foreground/50 flex items-center gap-3 flex-wrap">
            <span>
              Built on the open-source{" "}
              <a
                href="https://github.com/mskayyali/nodepad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/70 hover:text-foreground underline underline-offset-2 transition-colors"
              >
                Nodepad
              </a>
              {" "}spatial engine (MIT)
            </span>
            <CopyEmailButton />
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground/35">
            Your notes live in your browser&rsquo;s localStorage. Your API key never passes through a Propstical server &mdash; it goes directly to the AI provider you choose.
          </p>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

          {/* The idea */}
          <Section title="The idea">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The average Indian homeowner wastes &#8377;2.1 Lakh on renovation mistakes they could have caught before signing. Contractors upsell. Designers push preferred vendors. Every existing tool &mdash; Livspace, HomeLane, Pinterest &mdash; profits when you commit. Nobody profits from helping you think clearly first.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Propstical Canvas is the pre-decision tool. You drop in every variable you are juggling &mdash; materials, quotes, room dimensions, budget, inspiration, worries &mdash; and the AI quietly classifies them, maps the conflicts between them, and surfaces the one insight you haven&rsquo;t yet articulated. No chatbot. No salesperson. Just a neutral canvas for your biggest spend of the decade.
            </p>
          </Section>

          {/* Quick start */}
          <Section title="Quick start">
            <div className="space-y-4">
              <Step n={1} title="Add your API key">
                Open the sidebar (☰ top-left) → Settings. The default provider is OpenRouter — create a free account at openrouter.ai and paste your key. You can use <strong className="text-foreground/80">free models</strong> (Nemotron 30B or 120B) with no credits, or add credits to access GPT-4o, Claude Sonnet, Gemini 2.5 Pro, and DeepSeek. OpenAI and Z.ai are also supported as direct providers.
              </Step>
              <Step n={2} title="Drop in every variable">
                Type a material (<em>&ldquo;Italian marble, ₹350/sqft&rdquo;</em>), a room dimension, a contractor quote, a budget, an inspiration, a worry. Paste a URL for a vendor or product. Press Enter. The AI classifies it for you.
              </Step>
              <Step n={3} title="Watch it enrich">
                Each note is read in context with everything else already on your canvas. The AI adds a ₹ range, flags hidden costs, catches sequencing issues, and draws a connection line to every related note.
              </Step>
              <Step n={4} title="Force a type with #type">
                Start your note with <code className="px-1 rounded bg-secondary font-mono text-xs text-primary">#entity</code> (material), <code className="px-1 rounded bg-secondary font-mono text-xs text-primary">#claim</code> (contractor quote), <code className="px-1 rounded bg-secondary font-mono text-xs text-primary">#question</code>, <code className="px-1 rounded bg-secondary font-mono text-xs text-primary">#reflection</code> (risk), or <code className="px-1 rounded bg-secondary font-mono text-xs text-primary">#comparison</code> to override AI classification.
              </Step>
              <Step n={5} title="Wait for your Decision Score">
                After a few notes, Propstical surfaces an emergent insight &mdash; a sharp 18&ndash;28 word read on the biggest risk or gap on your canvas. Solidify it into your brief, or dismiss it and keep thinking.
              </Step>
            </div>
          </Section>

          {/* Content types */}
          <Section title="Note types">
            <p className="text-sm text-muted-foreground mb-3">
              Propstical recognises 14 kinds of renovation notes &mdash; materials, contractor quotes, specs, risks, open questions, preferences, inspirations and more. Each note is classified automatically and colour-coded so you can scan the canvas at a glance.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_TYPE_HIGHLIGHTS.map((type) => {
                const config = CONTENT_TYPE_CONFIG[type]
                const Icon = config.icon
                return (
                  <div key={type} className="flex items-center gap-2.5 px-3 py-2 rounded-sm bg-secondary/50 border border-border/50">
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: config.accentVar }} />
                    <div>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: config.accentVar }}>
                        {config.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-2">
              Also: definition, opinion, reflection, narrative, comparison, general.
            </p>
          </Section>

          {/* Views */}
          <Section title="Views">
            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-sm bg-secondary/30 border border-border/50">
                <Layers className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">Tiling <span className="font-mono text-[10px] text-muted-foreground/50 ml-1">{mod}1</span></p>
                  <p className="text-sm text-muted-foreground">Default. Your renovation notes are laid out in a spatial grid &mdash; each new note splits the available space. Best for seeing the whole project at once.</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-sm bg-secondary/30 border border-border/50">
                <Kanban className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">Kanban <span className="font-mono text-[10px] text-muted-foreground/50 ml-1">{mod}2</span></p>
                  <p className="text-sm text-muted-foreground">Notes grouped into columns by type &mdash; materials, quotes, open questions, risks, to-dos. To-dos float to the top so you always see what&rsquo;s pending before you commit.</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-sm bg-secondary/30 border border-border/50">
                <GitFork className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">Graph <span className="font-mono text-[10px] text-muted-foreground/50 ml-1">{mod}3</span></p>
                  <p className="text-sm text-muted-foreground">A force-directed graph of your renovation decisions. Load-bearing choices (the ones connected to many others) drift to the centre &mdash; isolated ones to the edges. Hover any note to dim everything unrelated and see exactly which decisions depend on it.</p>
                </div>
              </div>
            </div>
          </Section>

          {/* AI features */}
          <Section title="AI features">
            <div className="space-y-3">
              {[
                { icon: Brain, title: "Auto-classification", desc: "Every note is classified as a material, contractor quote, spec, question, risk, preference, or one of 8 other renovation types — based on meaning, not just keywords." },
                { icon: Zap, title: "Hidden-cost annotation", desc: "The AI reads your whole canvas and adds a 2–4 sentence annotation to each note: realistic ₹ ranges for Indian tier-1 cities, commonly excluded items (waterproofing, GST, labour), and climate/maintenance fit." },
                { icon: Search, title: "Conflict detection", desc: "Hover any note to see which other notes depend on it. In Graph view, connections become the layout — load-bearing decisions pull to the centre, isolated ones drift to the edge." },
                { icon: Globe, title: "Web grounding", desc: "Turn on web grounding in settings to let the AI cite real sources for contractor quotes, material specs, and vendor claims." },
                { icon: Sparkles, title: "Decision Score", desc: "Once you have a few notes, Propstical surfaces the single most important pre-commitment insight: a budget gap, a rework risk, a resale concern, or a quote exclusion you missed. Solidify it into your brief or dismiss." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <Icon className="h-4 w-4 flex-shrink-0 text-primary/70 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Export & data */}
          <Section title="Export & your data">
            <div className="space-y-3">
              <div className="flex gap-3">
                <FolderDown className="h-4 w-4 flex-shrink-0 text-primary/70 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">Export project file</p>
                  <p className="text-sm text-muted-foreground">Save your full renovation canvas as a <code className="px-1 rounded bg-secondary font-mono text-xs">.nodepad</code> file (shared format with the upstream open-source engine). Import on any device to pick up where you left off.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Download className="h-4 w-4 flex-shrink-0 text-primary/70 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">Contractor-ready Markdown brief</p>
                  <p className="text-sm text-muted-foreground">Export a formatted Markdown brief with every specified material, committed decision, budget range, and open question. Ready to hand to a contractor or designer for a quote &mdash; your canvas is your scope of work.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <FolderInput className="h-4 w-4 flex-shrink-0 text-primary/70 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">Your data, locally</p>
                  <p className="text-sm text-muted-foreground">Everything is stored in your browser&rsquo;s localStorage &mdash; no account, no cloud sync, no Propstical server. Notes are sent directly to the AI provider of your choice (OpenRouter, OpenAI, or Z.ai) using your own API key.</p>
                </div>
              </div>
            </div>
          </Section>

          {/* Keyboard shortcuts */}
          <Section title="Keyboard shortcuts">
            <div className="rounded-sm border border-border overflow-hidden">
              <div className="px-3 divide-y divide-border/40">
                <Shortcut keys={[mod, "K"]} label="Command menu" />
                <Shortcut keys={[mod, "Z"]} label="Undo last action" />
                <Shortcut keys={["Enter"]} label="Submit a new node" />
                <Shortcut keys={["Esc"]} label="Close command menu / deselect" />
              </div>
            </div>
          </Section>

          {/* Tips */}
          <Section title="Tips">
            <ul className="space-y-2">
              {[
                "Write in fragments. \"Italian marble ₹350/sqft master bath\" is enough — Propstical fills in the structure.",
                "Mix types freely. The canvas gets sharper as you add materials, worries, and questions side-by-side.",
                "Add your budget as an early note. Every material you add will be cross-checked against it.",
                "Switch to Graph view (⌘K → Graph) to see which decisions are load-bearing — change one, and you'll see how many others move with it.",
                "Use the #reflection type to log worries (\"what if the tile doesn't arrive before possession?\") — the AI will treat them as risks and factor them into the Decision Score.",
                "One canvas per room or project. A 2BHK renovation is not one canvas — it's a bathroom, a kitchen, and a living room canvas.",
                "When you're ready to talk to a contractor, export Markdown. Your canvas becomes a scope-of-work brief — vendors can't hide exclusions from a detailed brief.",
              ].map((tip, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                  <span className="flex-shrink-0 font-mono text-[10px] text-primary/50 mt-0.5 pt-px">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </Section>

          {/* Footer */}
          <div className="pt-2 pb-4 border-t border-border">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-sm bg-primary" />
              <span className="inline-block h-1.5 w-1.5 rounded-sm bg-primary/60" />
              <span className="inline-block h-1.5 w-1.5 rounded-sm bg-primary/30" />
              <span className="font-mono text-[10px] font-bold text-muted-foreground/40 ml-1">propstical canvas</span>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}
