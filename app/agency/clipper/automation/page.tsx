"use client"

import { AlertTriangle, KeyRound, Zap } from "lucide-react"

export default function AutoClipperPage() {
  return (
    <div className="min-h-full bg-[#09090f]">
      <div className="px-8 py-5 border-b border-white/[0.06] bg-[#0a0a14]">
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Auto-Clipper
        </h1>
        <p className="text-xs text-white/30 mt-0.5">Credential-gated automation setup</p>
      </div>
      <div className="px-8 py-6">
        <div className="max-w-2xl bg-[#0f0f1a] border border-amber-500/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white mb-2">YouTube search needs your API key</h2>
              <p className="text-sm text-white/45 leading-relaxed">
                Auto discovery cannot be made real without a YouTube Data API v3 key from your Google Cloud project. Add `YOUTUBE_API_KEY` in Vercel, then this page can search channels and generate clip candidates without mock videos.
              </p>
              <div className="mt-5 flex gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-100/70">
                  The manual Clipper page already creates timestamped links and yt-dlp commands. This automation page is intentionally honest until credentials exist.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
