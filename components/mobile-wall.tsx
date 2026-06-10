"use client"

import { usePathname } from "next/navigation"

export function MobileWall() {
  const pathname = usePathname()
  if (pathname?.startsWith("/funding-agent")) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-8 text-center md:hidden" style={{ paddingBottom: "15vh" }}>
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex items-center gap-1">
          <span className="h-3.5 w-3.5 rounded-sm bg-[#3ecf6e]" />
          <span className="h-3.5 w-3.5 rounded-sm bg-[#3ecf6e] opacity-60" />
          <span className="h-3.5 w-3.5 rounded-sm bg-[#3ecf6e] opacity-30" />
        </div>
        <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
          propstical
        </span>
      </div>

      {/* Message */}
      <p className="mb-3 max-w-xs text-base font-medium text-foreground">
        Your renovation needs room to think.
      </p>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
        Propstical Canvas is built for large screens. Open it on a desktop or laptop browser to lay out your home project properly. Mobile capture coming soon via WhatsApp.
      </p>
    </div>
  )
}
