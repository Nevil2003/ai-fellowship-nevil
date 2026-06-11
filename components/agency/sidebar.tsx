"use client"
// v2
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  MessageSquareText,
  Kanban,
  Sparkles,
  Brain,
  Zap,
  ChevronRight,
  Settings,
  ExternalLink,
  Share2,
  ShieldCheck,
  Film,
} from "lucide-react"

const navGroups = [
  {
    label: "Platform",
    items: [
      { href: "/agency", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/agency/chat", label: "AI Consultant", icon: MessageSquareText, exact: false },
      { href: "/agency/workspace", label: "Workspace", icon: Kanban, exact: false },
      { href: "/agency/studio", label: "Content Studio", icon: Sparkles, exact: false },
      { href: "/agency/neural", label: "Neural Score", icon: Brain, exact: false },
    ],
  },
  {
    label: "Content Tools",
    items: [
      { href: "/agency/clipper", label: "Clipper Tool", icon: Film, exact: false },
    ],
  },
  {
    label: "Distribution",
    items: [
      { href: "/agency/social", label: "Social Hub", icon: Share2, exact: false },
      { href: "/agency/orm", label: "Reputation", icon: ShieldCheck, exact: false },
    ],
  },
]

export function AgencySidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 h-full bg-[#0a0a14] border-r border-white/[0.06] flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          {/* Mastical logo mark — two interlocked S-curves (brand icon) */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 9C7 6.8 8.8 5 11 5C13.2 5 15 6.8 15 9C15 11.2 13.2 13 11 13C8.8 13 7 14.8 7 17C7 19.2 8.8 21 11 21" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M21 19C21 21.2 19.2 23 17 23C14.8 23 13 21.2 13 19C13 16.8 14.8 15 17 15C19.2 15 21 13.2 21 11C21 8.8 19.2 7 17 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.7"/>
          </svg>
          <div>
            <div className="text-[13px] font-black text-white tracking-[0.18em] uppercase leading-none">MASTICAL</div>
            <div className="text-[8px] text-white/30 tracking-[0.22em] uppercase mt-0.5">Agency OS</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="text-[9px] font-semibold text-white/20 uppercase tracking-[0.18em] px-3 mb-2">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.12 }}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-violet-600/15 text-violet-300 border border-violet-500/25"
                          : "text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activePill"
                          className="absolute inset-0 rounded-lg bg-violet-600/10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                      <Icon className={`w-4 h-4 shrink-0 relative z-10 ${isActive ? "text-violet-400" : ""}`} />
                      <span className="relative z-10">{item.label}</span>
                      {isActive && (
                        <ChevronRight className="w-3 h-3 ml-auto text-violet-500 relative z-10" />
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        <div>
          <div className="text-[9px] font-semibold text-white/20 uppercase tracking-[0.18em] px-3 mb-2">
            Account
          </div>
          <Link href="/agency">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all cursor-pointer">
              <Settings className="w-4 h-4" />
              Settings
            </div>
          </Link>
        </div>
      </nav>

      {/* Growth Partner CTA */}
      <div className="px-3 pb-3">
        <div className="relative overflow-hidden rounded-xl p-4 border border-violet-500/20 bg-gradient-to-br from-violet-950/80 to-indigo-950/60">
          <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-pink-500/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-[9px] font-bold text-yellow-400/80 uppercase tracking-widest">Growth Partner</span>
            </div>
            <p className="text-xs font-semibold text-white mb-1 leading-snug">Ready to scale beyond content?</p>
            <p className="text-[10px] text-white/40 mb-3 leading-relaxed">
              Launch MVPs & automate complex workflows with our studio.
            </p>
            <a
              href="https://mastical.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full text-[11px] font-bold py-2 px-3 rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 text-white hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
            >
              Contact Mastical.com
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* User profile */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white/80 truncate">Admin</div>
            <div className="text-[9px] text-white/30">Pro Plan · 2 seats</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
