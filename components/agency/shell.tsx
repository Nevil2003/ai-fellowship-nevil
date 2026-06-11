"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { AgencySidebar } from "@/components/agency/sidebar"

export function AgencyShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close the mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <div className="flex h-dvh overflow-hidden bg-[#09090f]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full">
        <AgencySidebar />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <AgencySidebar />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="absolute top-4 -right-10 w-8 h-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center text-white/70"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#0a0a14]">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/60"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="text-[13px] font-black text-white tracking-[0.18em] uppercase">MASTICAL</div>
          <div className="text-[8px] text-white/30 tracking-[0.22em] uppercase mt-0.5">Agency OS</div>
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
