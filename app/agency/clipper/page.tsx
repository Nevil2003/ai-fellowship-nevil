"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Play,
  Zap,
  TrendingUp,
  Film,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

interface VideoMetadata {
  id: string
  title: string
  description: string
  url: string
  thumbnail: string
  duration: number
  views: number
  likes: number
  comments: number
  channel_name: string
}

interface ClipResult {
  id: string
  title: string
  description: string
  duration: number
  segment: { start_time: number; end_time: number }
}

export default function ClipperPage() {
  const [searchType, setSearchType] = useState<"trending" | "keyword">("trending")
  const [category, setCategory] = useState("trending")
  const [searchQuery, setSearchQuery] = useState("")
  const [videos, setVideos] = useState<VideoMetadata[]>([])
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null)
  const [clips, setClips] = useState<ClipResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"search" | "analyze" | "clips">("search")

  const searchVideos = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        type: searchType,
        limit: "12",
      })

      if (searchType === "trending") {
        params.append("category", category)
      } else {
        params.append("q", searchQuery)
      }

      const res = await fetch(`/api/clipper/search?${params}`)
      const data = await res.json()

      if (data.ok) {
        setVideos(data.videos)
      }
    } catch (err) {
      console.error("Search error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeVideo = async (video: VideoMetadata) => {
    setSelectedVideo(video)
    setStep("analyze")
    setIsLoading(true)

    try {
      const res = await fetch("/api/clipper/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: video.url,
          video_title: video.title,
          video_description: video.description,
          video_duration: video.duration,
        }),
      })

      const data = await res.json()
      if (data.ok && data.segments) {
        await processClips(video.url, data.segments)
      }
    } catch (err) {
      console.error("Analyze error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const processClips = async (videoUrl: string, segments: any[]) => {
    try {
      const res = await fetch("/api/clipper/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: videoUrl,
          segments,
        }),
      })

      const data = await res.json()
      if (data.ok && data.clips) {
        setClips(data.clips)
        setStep("clips")
      }
    } catch (err) {
      console.error("Process error:", err)
    }
  }

  useEffect(() => {
    searchVideos()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-40"
        >
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition" />
                  <div className="relative bg-black rounded-xl p-3">
                    <Film className="w-6 h-6 text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Clipper Studio
                  </h1>
                  <p className="text-xs text-white/50 mt-1">Transform videos into viral clips</p>
                </div>
              </div>

              {/* Step indicator */}
              <div className="flex gap-4">
                {["search", "analyze", "clips"].map((s, i) => (
                  <motion.div
                    key={s}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      step === s
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-sm font-semibold">{i + 1}</span>
                    <span className="text-xs hidden sm:inline capitalize">{s}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <AnimatePresence mode="wait">
            {/* STEP 1: Search */}
            {step === "search" && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Search Type Selection */}
                <div className="flex gap-3">
                  {[
                    { type: "trending" as const, icon: TrendingUp, label: "Trending" },
                    { type: "keyword" as const, icon: Search, label: "Search" },
                  ].map(({ type, icon: Icon, label }) => (
                    <motion.button
                      key={type}
                      onClick={() => setSearchType(type)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                        searchType === type
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50"
                          : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </motion.button>
                  ))}
                </div>

                {/* Search Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchType === "trending" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      <label className="text-sm font-semibold text-white/70">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500/50 transition-all backdrop-blur-sm"
                      >
                        {["trending", "sports", "tech", "entertainment", "music", "news"].map((cat) => (
                          <option key={cat} value={cat} className="bg-slate-900">
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  {searchType === "keyword" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      <label className="text-sm font-semibold text-white/70">Search Term</label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && searchVideos()}
                        placeholder="e.g., product launch, tutorial..."
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-all backdrop-blur-sm"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Search Button */}
                <motion.button
                  onClick={searchVideos}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Search Videos
                    </>
                  )}
                </motion.button>

                {/* Video Grid */}
                {videos.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Found {videos.length} Videos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.map((video, i) => (
                        <motion.button
                          key={video.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => analyzeVideo(video)}
                          className="group text-left overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/20"
                        >
                          {/* Thumbnail */}
                          <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-purple-600/60 transition-all"
                              >
                                <Play className="w-8 h-8 text-white fill-white" />
                              </motion.div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                              {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-4 space-y-3">
                            <div>
                              <h3 className="font-bold text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                                {video.title}
                              </h3>
                              <p className="text-xs text-white/50 mt-1">{video.channel_name}</p>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-4 text-xs text-white/60">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {(video.views / 1000000).toFixed(1)}M
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {(video.likes / 1000).toFixed(0)}K
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                {(video.comments / 1000).toFixed(0)}K
                              </div>
                            </div>

                            {/* CTA */}
                            <motion.div
                              whileHover={{ x: 4 }}
                              className="flex items-center gap-2 text-purple-400 font-semibold text-sm pt-2 border-t border-white/10 mt-3 group-hover:text-blue-400 transition-colors"
                            >
                              Analyze & Clip <ArrowRight className="w-4 h-4" />
                            </motion.div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 2: Analyzing */}
            {step === "analyze" && selectedVideo && (
              <motion.div
                key="analyze"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Selected Video */}
                <div className="rounded-2xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 p-6 backdrop-blur-sm">
                  <div className="flex gap-6">
                    <img
                      src={selectedVideo.thumbnail}
                      alt={selectedVideo.title}
                      className="w-32 h-32 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{selectedVideo.title}</h3>
                      <p className="text-white/70 text-sm mb-4">{selectedVideo.channel_name}</p>
                      <div className="flex gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {Math.floor(selectedVideo.duration / 60)}:{String(selectedVideo.duration % 60).padStart(2, "0")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          {(selectedVideo.views / 1000000).toFixed(1)}M views
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Processing */}
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center"
                  >
                    <Sparkles className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white">Analyzing Video</h3>
                    <p className="text-white/60">AI is finding the best moments to clip...</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Clips Ready */}
            {step === "clips" && clips.length > 0 && (
              <motion.div
                key="clips"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Success */}
                <motion.div className="text-center space-y-4 py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="inline-block"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>
                  <div>
                    <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      {clips.length} Clips Generated!
                    </h2>
                    <p className="text-white/60 mt-2">Ready to post across all platforms</p>
                  </div>
                </motion.div>

                {/* Clips */}
                <div className="space-y-4">
                  {clips.map((clip, i) => (
                    <motion.div
                      key={clip.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 rounded-xl bg-gradient-to-r from-slate-800/50 to-purple-900/50 border border-purple-500/20 hover:border-purple-500/50 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                            {clip.title}
                          </h3>
                          <p className="text-white/70 text-sm mt-2">{clip.description}</p>
                          <div className="flex gap-4 mt-4 text-xs text-white/50">
                            <span>
                              {clip.segment.start_time}s - {clip.segment.end_time}s
                            </span>
                            <span>Duration: {clip.duration}s</span>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/50 whitespace-nowrap"
                        >
                          Post Now
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep("search")}
                    className="flex-1 px-6 py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
                  >
                    Clip Another Video
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/50"
                  >
                    Post All to Social
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
