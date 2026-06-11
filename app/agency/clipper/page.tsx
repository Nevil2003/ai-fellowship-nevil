"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Play,
  Plus,
  Zap,
  TrendingUp,
  Film,
  Clock,
  Eye,
  Heart,
  Share2,
  Calendar,
  Filter,
} from "lucide-react"
import type { VideoMetadata, ClipSegment } from "@/lib/video-client"

interface SearchResult {
  ok: boolean
  type: string
  videos: VideoMetadata[]
  total: number
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
  const [activeTab, setActiveTab] = useState<"search" | "analyze" | "queue">("search")

  const searchVideos = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        type: searchType,
        limit: "10",
      })

      if (searchType === "trending") {
        params.append("category", category)
      } else {
        params.append("q", searchQuery)
      }

      const res = await fetch(`/api/clipper/search?${params}`)
      const data: SearchResult = await res.json()

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
      if (data.ok) {
        setSelectedVideo(video)
        processClips(video.url, data.segments)
      }
    } catch (err) {
      console.error("Analyze error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const processClips = async (videoUrl: string, segments: ClipSegment[]) => {
    setIsLoading(true)
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
        setActiveTab("queue")
      }
    } catch (err) {
      console.error("Process error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    searchVideos()
  }, [])

  return (
    <div className="flex flex-col h-screen bg-[#09090f]">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/[0.06] bg-[#0a0a14]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <Film className="w-5 h-5" />
              Clipper Tool
            </h1>
            <p className="text-xs text-white/30 mt-0.5">Turn trending videos into shareable clips</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("search")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "search"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/[0.05] text-white/60 hover:bg-white/[0.08]"
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </button>
            <button
              onClick={() => setActiveTab("queue")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "queue"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/[0.05] text-white/60 hover:bg-white/[0.08]"
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Queue ({clips.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activeTab === "search" && (
          <div className="space-y-6 max-w-7xl">
            {/* Search Controls */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Search Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSearchType("trending")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        searchType === "trending"
                          ? "bg-blue-500 text-white"
                          : "bg-white/[0.05] text-white/60 hover:bg-white/[0.08]"
                      }`}
                    >
                      <TrendingUp className="w-4 h-4 inline mr-2" />
                      Trending
                    </button>
                    <button
                      onClick={() => setSearchType("keyword")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        searchType === "keyword"
                          ? "bg-blue-500 text-white"
                          : "bg-white/[0.05] text-white/60 hover:bg-white/[0.08]"
                      }`}
                    >
                      <Search className="w-4 h-4 inline mr-2" />
                      Keyword
                    </button>
                  </div>
                </div>

                {searchType === "trending" && (
                  <div className="flex-1">
                    <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-white/[0.2]"
                    >
                      <option>trending</option>
                      <option>sports</option>
                      <option>tech</option>
                      <option>entertainment</option>
                      <option>music</option>
                      <option>news</option>
                    </select>
                  </div>
                )}

                {searchType === "keyword" && (
                  <div className="flex-1">
                    <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Query</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchVideos()}
                      placeholder="Search for videos..."
                      className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/[0.2]"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={searchVideos}
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {isLoading ? "Searching..." : "Search Videos"}
              </button>
            </motion.div>

            {/* Video Results */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-sm font-bold text-white">
                {videos.length} Videos Found
                {selectedVideo && ` • Analyzing: ${selectedVideo.title}`}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.12] transition-all cursor-pointer"
                    onClick={() => analyzeVideo(video)}
                  >
                    <div className="aspect-video bg-black relative group">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <Play className="w-12 h-12 text-white/80" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                        {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-white line-clamp-2">{video.title}</h3>
                        <p className="text-xs text-white/40 mt-1">{video.channel_name}</p>
                      </div>

                      <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1 text-white/60">
                          <Eye className="w-3 h-3" />
                          {(video.views / 1000000).toFixed(1)}M
                        </div>
                        <div className="flex items-center gap-1 text-white/60">
                          <Heart className="w-3 h-3" />
                          {(video.likes / 1000).toFixed(0)}K
                        </div>
                        <div className="flex items-center gap-1 text-white/60">
                          <Share2 className="w-3 h-3" />
                          {(video.comments / 1000).toFixed(0)}K
                        </div>
                      </div>

                      <button className="w-full px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/30 transition-colors">
                        {isLoading && selectedVideo?.id === video.id ? "Analyzing..." : "Analyze & Clip"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === "queue" && (
          <div className="space-y-6 max-w-7xl">
            <h2 className="text-sm font-bold text-white">
              Generated Clips ({clips.length})
              {selectedVideo && ` from ${selectedVideo.title}`}
            </h2>

            {clips.length === 0 ? (
              <div className="text-center py-12">
                <Film className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">Select a video and analyze it to generate clips</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clips.map((clip) => (
                  <motion.div
                    key={clip.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#0f0f1a] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between hover:border-white/[0.12] transition-all"
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-white">{clip.title}</h3>
                      <p className="text-xs text-white/40 mt-1">{clip.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-white/30">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(clip.duration / 60)}:{String(clip.duration % 60).padStart(2, "0")}
                        </span>
                        <span>
                          {clip.segment.start_time}s - {clip.segment.end_time}s
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 transition-colors">
                        Post
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-white/60 text-xs font-semibold hover:bg-white/[0.08] transition-colors">
                        Edit
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
