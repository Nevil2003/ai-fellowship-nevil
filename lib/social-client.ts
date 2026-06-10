/**
 * Unified social media client
 * Abstracts Instagram, X, Reddit, Substack behind a single interface
 */

import type {
  PlatformType,
  PlatformCredentials,
  CreatePostInput,
  SocialPost,
  PlatformInsights,
  InstagramPost,
  XTweet,
  RedditPost,
} from "./types/social-platforms"

interface PostOptions {
  text: string
  media_urls?: string[]
  scheduled_at?: string
}

export class SocialMediaClient {
  private credentials: Map<PlatformType, PlatformCredentials> = new Map()

  setCredentials(creds: PlatformCredentials) {
    this.credentials.set(creds.platform, creds)
  }

  async postContent(
    platform: PlatformType,
    options: PostOptions
  ): Promise<{ success: boolean; post_id?: string; error?: string }> {
    const creds = this.credentials.get(platform)
    if (!creds) {
      return { success: false, error: `No credentials for ${platform}` }
    }

    try {
      switch (platform) {
        case "instagram":
          return await this.postToInstagram(creds, options)
        case "x":
          return await this.postToX(creds, options)
        case "reddit":
          return await this.postToReddit(creds, options)
        case "substack":
          return await this.postToSubstack(creds, options)
        default:
          return { success: false, error: `Unsupported platform: ${platform}` }
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error"
      return { success: false, error }
    }
  }

  private async postToInstagram(
    creds: PlatformCredentials,
    options: PostOptions
  ): Promise<{ success: boolean; post_id?: string; error?: string }> {
    // Instagram Container API (requires Business account + app review)
    const url = `https://graph.instagram.com/v18.0/${creds.account_id}/media`

    const payload: any = {
      caption: options.text,
      access_token: creds.access_token,
    }

    if (options.media_urls?.length) {
      payload.media_type = options.media_urls.length > 1 ? "CAROUSEL" : "IMAGE"
      payload.image_url = options.media_urls[0]
      // For carousel: build items array
      if (options.media_urls.length > 1) {
        payload.children = options.media_urls.map((url) => ({
          image_url: url,
          media_type: "IMAGE",
        }))
      }
    }

    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json()
      return {
        success: false,
        error: err.error?.message || "Instagram API error",
      }
    }

    const data = await res.json()
    return { success: true, post_id: data.id }
  }

  private async postToX(
    creds: PlatformCredentials,
    options: PostOptions
  ): Promise<{ success: boolean; post_id?: string; error?: string }> {
    // X/Twitter v2 API (requires paid tier)
    const url = "https://api.twitter.com/2/tweets"

    const payload: any = {
      text: options.text,
    }

    if (options.media_urls?.length) {
      // Upload media first, get media_ids
      const media_ids = []
      for (const url of options.media_urls) {
        try {
          const mediaId = await this.uploadXMedia(creds, url)
          if (mediaId) media_ids.push(mediaId)
        } catch (e) {
          console.warn("Failed to upload media to X:", e)
        }
      }
      if (media_ids.length > 0) {
        payload.media = { media_ids }
      }
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json()
      return {
        success: false,
        error: err.detail || "X API error",
      }
    }

    const data = await res.json()
    return { success: true, post_id: data.data?.id }
  }

  private async uploadXMedia(
    creds: PlatformCredentials,
    media_url: string
  ): Promise<string | null> {
    // Download media and upload to X
    try {
      const mediaRes = await fetch(media_url)
      const buffer = await mediaRes.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")

      const formData = new FormData()
      formData.append("media_data", base64)

      const uploadRes = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${creds.access_token}`,
        },
        body: formData,
      })

      if (!uploadRes.ok) return null
      const data = await uploadRes.json()
      return data.media_id_string
    } catch {
      return null
    }
  }

  private async postToReddit(
    creds: PlatformCredentials,
    options: PostOptions
  ): Promise<{ success: boolean; post_id?: string; error?: string }> {
    // Reddit API (free, easiest to implement)
    // Requires subreddit parameter in metadata
    const subreddit = (options as any).subreddit || "test"

    const url = `https://oauth.reddit.com/r/${subreddit}/submit`

    const payload = {
      title: options.text.split("\n")[0].slice(0, 300), // Use first line as title
      selftext: options.text,
      kind: "self",
      api_type: "json",
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.access_token}`,
        "User-Agent": "Mastical/1.0",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(payload as any).toString(),
    })

    if (!res.ok) {
      return { success: false, error: `Reddit API error: ${res.status}` }
    }

    const data = await res.json()
    if (data.json?.errors?.length) {
      return { success: false, error: data.json.errors[0][1] }
    }

    return { success: true, post_id: data.json?.data?.id }
  }

  private async postToSubstack(
    creds: PlatformCredentials,
    options: PostOptions
  ): Promise<{ success: boolean; post_id?: string; error?: string }> {
    // Substack doesn't have a public API for posting yet
    // This is a placeholder for when they open their API
    return {
      success: false,
      error: "Substack API not yet publicly available. Manual posting required.",
    }
  }

  async getInsights(platform: PlatformType): Promise<PlatformInsights | null> {
    const creds = this.credentials.get(platform)
    if (!creds) return null

    try {
      switch (platform) {
        case "instagram":
          return await this.getInstagramInsights(creds)
        case "x":
          return await this.getXInsights(creds)
        case "reddit":
          return await this.getRedditInsights(creds)
        default:
          return null
      }
    } catch (err) {
      console.error(`Failed to fetch ${platform} insights:`, err)
      return null
    }
  }

  private async getInstagramInsights(creds: PlatformCredentials): Promise<PlatformInsights | null> {
    const url = `https://graph.instagram.com/v18.0/${creds.account_id}?fields=followers_count,media_count,biography&access_token=${creds.access_token}`

    const res = await fetch(url)
    if (!res.ok) return null

    const data = await res.json()
    return {
      platform: "instagram",
      account_id: creds.account_id || "",
      account_username: creds.account_username || "",
      followers: data.followers_count,
      engagement_rate: 0, // TODO: Calculate from recent posts
      recent_posts: data.media_count,
      updated_at: new Date().toISOString(),
    }
  }

  private async getXInsights(creds: PlatformCredentials): Promise<PlatformInsights | null> {
    const url = `https://api.twitter.com/2/users/me?user.fields=public_metrics`

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${creds.access_token}`,
      },
    })

    if (!res.ok) return null

    const data = await res.json()
    const metrics = data.data?.public_metrics
    return {
      platform: "x",
      account_id: data.data?.id || "",
      account_username: data.data?.username || "",
      followers: metrics?.followers_count,
      engagement_rate: 0, // TODO: Calculate from recent tweets
      recent_posts: metrics?.tweet_count,
      updated_at: new Date().toISOString(),
    }
  }

  private async getRedditInsights(creds: PlatformCredentials): Promise<PlatformInsights | null> {
    const url = "https://oauth.reddit.com/user/me/overview"

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${creds.access_token}`,
        "User-Agent": "Mastical/1.0",
      },
    })

    if (!res.ok) return null

    const data = await res.json()
    // Reddit doesn't expose follower count directly, use karma instead
    return {
      platform: "reddit",
      account_id: data.data?.author || "",
      account_username: data.data?.author || "",
      engagement_rate: 0,
      updated_at: new Date().toISOString(),
    }
  }
}

// Singleton instance
export const socialClient = new SocialMediaClient()
