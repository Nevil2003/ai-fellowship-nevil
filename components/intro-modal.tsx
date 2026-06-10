"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Gauge, AlertTriangle, GitCompare, Package } from "lucide-react"

interface IntroModalProps {
  open: boolean
  onClose: () => void
}

export function IntroModal({ open, onClose }: IntroModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handle)
    return () => window.removeEventListener("keydown", handle)
  }, [open, onClose])

  // Prevent body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-sm shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-0.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary/60" />
                    <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary/30" />
                  </div>
                  <span className="font-mono text-sm font-black text-foreground tracking-tight">propstical</span>
                </div>
                <p className="text-xs text-muted-foreground/60 font-mono uppercase tracking-widest">
                  See it before you spend on it
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-sm text-muted-foreground/40 hover:text-foreground hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pb-6 space-y-5">
              <p className="text-sm text-foreground/80 leading-relaxed">
                Propstical Canvas is a thinking space for your home renovation. Drop in every decision you are juggling &mdash; materials, quotes, dimensions, inspiration, worries &mdash; and the AI quietly sorts them, flags conflicts, and surfaces the ₹2 Lakh mistake before you make it.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-sm bg-white/[0.03] border border-white/[0.06]">
                  <Package className="h-4 w-4 text-foreground/60 mb-2" />
                  <p className="font-semibold text-foreground/90 mb-0.5">Lay it out</p>
                  <p className="text-muted-foreground leading-relaxed">Type notes for materials, contractor quotes, room dimensions, budget.</p>
                </div>
                <div className="p-3 rounded-sm bg-white/[0.03] border border-white/[0.06]">
                  <GitCompare className="h-4 w-4 text-foreground/60 mb-2" />
                  <p className="font-semibold text-foreground/90 mb-0.5">AI finds conflicts</p>
                  <p className="text-muted-foreground leading-relaxed">Your marble choice vs your budget. Your layout vs your dimensions.</p>
                </div>
                <div className="p-3 rounded-sm bg-white/[0.03] border border-white/[0.06]">
                  <AlertTriangle className="h-4 w-4 text-foreground/60 mb-2" />
                  <p className="font-semibold text-foreground/90 mb-0.5">Flags risk early</p>
                  <p className="text-muted-foreground leading-relaxed">Hidden costs, sequencing mistakes, resale impact, compliance gaps.</p>
                </div>
                <div className="p-3 rounded-sm bg-white/[0.03] border border-white/[0.06]">
                  <Gauge className="h-4 w-4 text-foreground/60 mb-2" />
                  <p className="font-semibold text-foreground/90 mb-0.5">Decision Score</p>
                  <p className="text-muted-foreground leading-relaxed">A pointed insight emerges once you have enough on the canvas.</p>
                </div>
              </div>

              <div className="p-3 rounded-sm bg-white/[0.03] border border-white/[0.06] text-xs">
                <p className="font-semibold text-foreground/90 mb-1">Before you start</p>
                <p className="text-muted-foreground leading-relaxed">
                  Click the menu (top-left) &rarr; Settings &rarr; paste an OpenRouter or OpenAI API key. Your key stays in your browser &mdash; it never touches a Propstical server.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06]">
              <p className="text-xs text-muted-foreground/40">
                Replay anytime via the <span className="font-mono font-black text-muted-foreground/60">?</span> button
              </p>
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-mono font-medium rounded-sm bg-white/8 hover:bg-white/15 text-foreground/70 hover:text-foreground border border-white/10 hover:border-white/20 transition-all"
              >
                Start my canvas &rarr;
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
