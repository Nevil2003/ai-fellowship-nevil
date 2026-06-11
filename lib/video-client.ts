/**
 * Video Search & Discovery Client
 * Searches trending videos from YouTube, TikTok, Instagram Reels
 */

export type VideoSource = "youtube" | "tiktok" | "instagram" | "reddit"
export type VideoCategory = "trending" | "sports" | "tech" | "entertainment" | "music" | "news"

export interface VideoMetadata {
  id: string
  source: VideoSource
  title: string
  description: string
  url: string
  thumbnail: string
  duration: number
  views: number
  likes: number
  comments: number
  upload_date: string
  channel_name: string
  channel_url: string
}

export interface SearchResult {
  videos: VideoMetadata[]
  total: number
  page: number
  per_page: number
}

export class VideoSearchClient {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || ""
  }

  /**
   * Search trending videos by category
   */
  async searchTrending(category: VideoCategory, limit: number = 10): Promise<SearchResult> {
    if (!this.apiKey) {
      return this.getMockTrendingVideos(category, limit)
    }

    try {
      // YouTube Data API v3
      const regionCode = "US"
      const params = new URLSearchParams({
        part: "snippet,statistics",
        chart: "mostPopular",
        regionCode,
        videoCategoryId: this.getCategoryId(category),
        maxResults: limit.toString(),
        key: this.apiKey,
      })

      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`, {
        headers: { "User-Agent": "Mastical-Clipper/1.0" },
      })

      if (!res.ok) {
        console.warn("YouTube API failed, using mock data")
        return this.getMockTrendingVideos(category, limit)
      }

      const data = await res.json()

      return {
        videos: (data.items || []).map((item: any) => ({
          id: item.id,
          source: "youtube" as VideoSource,
          title: item.snippet.title,
          description: item.snippet.description,
          url: `https://youtube.com/watch?v=${item.id}`,
          thumbnail: item.snippet.thumbnails.high.url,
          duration: 0,
          views: parseInt(item.statistics.viewCount || "0"),
          likes: parseInt(item.statistics.likeCount || "0"),
          comments: parseInt(item.statistics.commentCount || "0"),
          upload_date: item.snippet.publishedAt,
          channel_name: item.snippet.channelTitle,
          channel_url: `https://youtube.com/channel/${item.snippet.channelId}`,
        })),
        total: data.pageInfo?.totalResults || 0,
        page: 1,
        per_page: limit,
      }
    } catch (err) {
      console.error("Video search error:", err)
      return this.getMockTrendingVideos(category, limit)
    }
  }

  /**
   * Search by keywords
   */
  async searchByKeyword(query: string, limit: number = 10): Promise<SearchResult> {
    if (!this.apiKey) {
      return this.getMockSearchResults(query, limit)
    }

    try {
      const params = new URLSearchParams({
        part: "snippet",
        q: query,
        type: "video",
        maxResults: limit.toString(),
        key: this.apiKey,
      })

      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
        headers: { "User-Agent": "Mastical-Clipper/1.0" },
      })

      if (!res.ok) {
        return this.getMockSearchResults(query, limit)
      }

      const data = await res.json()

      return {
        videos: (data.items || []).map((item: any) => ({
          id: item.id.videoId,
          source: "youtube" as VideoSource,
          title: item.snippet.title,
          description: item.snippet.description,
          url: `https://youtube.com/watch?v=${item.id.videoId}`,
          thumbnail: item.snippet.thumbnails.high.url,
          duration: 0,
          views: 0,
          likes: 0,
          comments: 0,
          upload_date: item.snippet.publishedAt,
          channel_name: item.snippet.channelTitle,
          channel_url: "",
        })),
        total: data.pageInfo?.totalResults || 0,
        page: 1,
        per_page: limit,
      }
    } catch (err) {
      console.error("Keyword search error:", err)
      return this.getMockSearchResults(query, limit)
    }
  }

  /**
   * Get video details (duration, exact stats)
   */
  async getVideoDetails(videoId: string, source: VideoSource = "youtube"): Promise<VideoMetadata | null> {
    if (source !== "youtube") {
      return null // Extend for other platforms
    }

    if (!this.apiKey) {
      return null
    }

    try {
      const params = new URLSearchParams({
        part: "snippet,contentDetails,statistics",
        id: videoId,
        key: this.apiKey,
      })

      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`)
      if (!res.ok) return null

      const data = await res.json()
      const item = data.items?.[0]

      if (!item) return null

      return {
        id: item.id,
        source: "youtube",
        title: item.snippet.title,
        description: item.snippet.description,
        url: `https://youtube.com/watch?v=${item.id}`,
        thumbnail: item.snippet.thumbnails.high.url,
        duration: this.parseDuration(item.contentDetails.duration),
        views: parseInt(item.statistics.viewCount || "0"),
        likes: parseInt(item.statistics.likeCount || "0"),
        comments: parseInt(item.statistics.commentCount || "0"),
        upload_date: item.snippet.publishedAt,
        channel_name: item.snippet.channelTitle,
        channel_url: `https://youtube.com/channel/${item.snippet.channelId}`,
      }
    } catch (err) {
      console.error("Get video details error:", err)
      return null
    }
  }

  private getCategoryId(category: VideoCategory): string {
    const categories: Record<VideoCategory, string> = {
      trending: "0",
      sports: "17",
      tech: "28",
      entertainment: "24",
      music: "10",
      news: "25",
    }
    return categories[category] || "0"
  }

  private parseDuration(duration: string): number {
    // PT1H30M45S → seconds
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return 0
    const hours = parseInt(match[1] || "0")
    const minutes = parseInt(match[2] || "0")
    const seconds = parseInt(match[3] || "0")
    return hours * 3600 + minutes * 60 + seconds
  }

  private getMockTrendingVideos(category: VideoCategory, limit: number): SearchResult {
    const mockVideos: VideoMetadata[] = [
      {
        id: "yt-trending-1",
        source: "youtube",
        title: `Top ${category.charAt(0).toUpperCase() + category.slice(1)} Video #1`,
        description: "This is a trending video that went viral",
        url: "https://youtube.com/watch?v=example1",
        thumbnail: "https://via.placeholder.com/320x180?text=Video+1",
        duration: 720,
        views: 1250000,
        likes: 45000,
        comments: 8900,
        upload_date: new Date().toISOString(),
        channel_name: "Trending Channel",
        channel_url: "https://youtube.com/c/trendingchannel",
      },
      {
        id: "yt-trending-2",
        source: "youtube",
        title: `Top ${category.charAt(0).toUpperCase() + category.slice(1)} Video #2`,
        description: "Another viral video worth clipping",
        url: "https://youtube.com/watch?v=example2",
        thumbnail: "https://via.placeholder.com/320x180?text=Video+2",
        duration: 540,
        views: 890000,
        likes: 32000,
        comments: 6700,
        upload_date: new Date().toISOString(),
        channel_name: "Popular Creator",
        channel_url: "https://youtube.com/c/popularcreator",
      },
    ]

    return {
      videos: mockVideos.slice(0, limit),
      total: limit,
      page: 1,
      per_page: limit,
    }
  }

  private getMockSearchResults(query: string, limit: number): SearchResult {
    return {
      videos: [
        {
          id: `search-${query}-1`,
          source: "youtube",
          title: `Search result for "${query}" #1`,
          description: `Video matching your search for ${query}`,
          url: `https://youtube.com/watch?v=search1`,
          thumbnail: "https://via.placeholder.com/320x180?text=Search+Result",
          duration: 600,
          views: 500000,
          likes: 18000,
          comments: 3200,
          upload_date: new Date().toISOString(),
          channel_name: "Creator Channel",
          channel_url: "https://youtube.com/c/creator",
        },
      ],
      total: limit,
      page: 1,
      per_page: limit,
    }
  }
}

export function createVideoClient(): VideoSearchClient {
  return new VideoSearchClient()
}
