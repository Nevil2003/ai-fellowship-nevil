"use client"

import { useState } from "react"
import { Copy, ExternalLink, Film, Scissors, Youtube } from "lucide-react"
import { logActivity } from "@/lib/local-stats"

function parseYouTubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{6,})/)
  return match?.[1] || ""
}

function toSeconds(value: string) {
  const parts = value.split(":").map(Number)
  if (parts.some(Number.isNaN)) return 0
  return parts.reduce((total, part) => total * 60 + part, 0)
}

export default function ClipperPage() {
  const [url, setUrl] = useState("")
  const [start, setStart] = useState("00:00:15")
  const [end, setEnd] = useState("00:00:45")
  const [caption, setCaption] = useState("The strongest 30 seconds from this video.")
  const [copied, setCopied] = useState(false)

  const videoId = parseYouTubeId(url)
  const startSeconds = toSeconds(start)
  const output = videoId ? `${videoId}-${start.replaceAll(":", "")}-${end.replaceAll(":", "")}.mp4` : "clip.mp4"
  const command = `yt-dlp "${url || "YOUTUBE_URL"}" --download-sections "*${start}-${end}" --force-keyframes-at-cuts -o "${output}"`
  const timestamped = videoId ? `https://youtu.be/${videoId}?t=${startSeconds}` : ""

  const copyCommand = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    logActivity({ kind: "campaign", message: "Exported clipper cut command" })
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="min-h-full bg-[#09090f]">
      <div className="px-8 py-5 border-b border-white/[0.06] bg-[#0a0a14]">
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Film className="w-5 h-5 text-pink-400" />
          Clipper Tool
        </h1>
        <p className="text-xs text-white/30 mt-0.5">Create real timestamp links and ready-to-run cutting commands</p>
      </div>

      <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5 space-y-4">
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">YouTube URL</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="mt-2 w-full bg-[#0a0a14] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-pink-500/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Start</label>
              <input value={start} onChange={(e) => setStart(e.target.value)} className="mt-2 w-full bg-[#0a0a14] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-pink-500/40" />
            </div>
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">End</label>
              <input value={end} onChange={(e) => setEnd(e.target.value)} className="mt-2 w-full bg-[#0a0a14] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-pink-500/40" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Caption</label>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} className="mt-2 w-full bg-[#0a0a14] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white outline-none resize-none focus:border-pink-500/40" />
          </div>
        </div>

        <div className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Scissors className="w-4 h-4 text-pink-400" />
            Export deliverables
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-2">Timestamped link</p>
            {timestamped ? (
              <a href={timestamped} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-300 hover:text-violet-200 break-all inline-flex items-center gap-2">
                {timestamped}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : (
              <p className="text-sm text-white/25">Paste a YouTube URL to create a timestamped link.</p>
            )}
          </div>
          <div className="rounded-xl bg-black/30 border border-white/[0.06] p-4">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-2">Cut command</p>
            <code className="block text-xs text-emerald-300 whitespace-pre-wrap break-all">{command}</code>
          </div>
          <button onClick={copyCommand} className="w-full flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 text-sm font-bold text-white hover:bg-pink-500">
            <Copy className="w-4 h-4" />
            {copied ? "Copied" : "Copy command"}
          </button>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 flex gap-3">
            <Youtube className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-100/70">
              Search automation still needs a YouTube Data API key. This tool does not fake video cutting; it gives you exact links and a command you can run with yt-dlp.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
