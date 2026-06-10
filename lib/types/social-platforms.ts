/**
 * Social platform types for Instagram, X, Reddit, Substack
 */

import { z } from "zod"

// ── Platform Credentials ──────────────────────────────────────────

export type PlatformType = "instagram" | "x" | "reddit" | "substack"

export interface PlatformCredentials {
  platform: PlatformType
  workspace_id: string
  access_token: string
  refresh_token?: string
  expires_at?: number
  account_id?: string
  account_username?: string
  scopes?: string[]
}

export const CredentialsSchema = z.object({
  platform: z.enum(["instagram", "x", "reddit", "substack"]),
  workspace_id: z.string().uuid(),
  access_token: z.string().min(1),
  refresh_token: z.string().optional(),
  expires_at: z.number().optional(),
  account_id: z.string().optional(),
  account_username: z.string().optional(),
  scopes: z.array(z.string()).optional(),
})

// ── Post/Content Models ───────────────────────────────────────────

export interface SocialPost {
  id: string
  platform: PlatformType
  content_id?: string // Link to internal content record
  workspace_id: string
  text: string
  media_urls?: string[]
  scheduled_at?: string
  posted_at?: string
  url?: string // Platform post URL
  status: "draft" | "scheduled" | "posted" | "failed"
  metadata?: {
    engagement?: number
    reach?: number
    impressions?: number
    clicks?: number
    shares?: number
    comments?: number
  }
  created_at: string
  updated_at: string
}

export const CreatePostSchema = z.object({
  platform: z.enum(["instagram", "x", "reddit", "substack"]),
  text: z.string().min(1).max(5000),
  media_urls: z.array(z.string().url()).optional(),
  scheduled_at: z.string().datetime().optional(),
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>

// ── Analytics/Insights ────────────────────────────────────────────

export interface PlatformInsights {
  platform: PlatformType
  account_id: string
  account_username: string
  followers?: number
  engagement_rate?: number
  recent_posts?: number
  avg_reach?: number
  top_post?: {
    text: string
    engagement: number
    url: string
  }
  updated_at: string
}

// ── Platform-Specific Models ──────────────────────────────────────

// Instagram (Meta Graph API)
export interface InstagramAccount {
  id: string
  username: string
  name?: string
  biography?: string
  profile_picture_url?: string
  followers_count?: number
  follows_count?: number
  media_count?: number
}

export interface InstagramPost {
  id: string
  caption?: string
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL"
  media_url?: string
  permalink?: string
  timestamp?: string
  like_count?: number
  comments_count?: number
}

// X/Twitter (v2 API)
export interface XTweet {
  id: string
  text: string
  created_at?: string
  public_metrics?: {
    retweet_count: number
    reply_count: number
    like_count: number
    quote_count: number
  }
  author_id?: string
}

export interface XUser {
  id: string
  username: string
  name: string
  description?: string
  followers_count?: number
  following_count?: number
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
}

// Reddit
export interface RedditPost {
  id: string
  subreddit: string
  title: string
  selftext?: string
  url?: string
  created_utc: number
  score: number
  num_comments: number
  upvote_ratio: number
  permalink: string
}

export interface RedditSubreddit {
  display_name: string
  subscribers: number
  description: string
  public_description: string
  icon_img?: string
}

// Substack
export interface SubstackPost {
  id: string
  title: string
  subtitle?: string
  body_html: string
  publish_date: string
  canonical_url?: string
  section?: string
}

export interface SubstackPublication {
  name: string
  subdomain: string
  description?: string
  publication_url: string
  rss_feed_url: string
}

// ── Platform-Specific OAuth Config ──────────────────────────────

export const OAUTH_CONFIG: Record<
  PlatformType,
  {
    clientId: string
    clientSecret: string
    authUrl: string
    tokenUrl: string
    scope: string[]
  }
> = {
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || "",
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
    authUrl: "https://api.instagram.com/oauth/authorize",
    tokenUrl: "https://graph.instagram.com/v18.0/oauth/access_token",
    scope: ["user_profile", "user_media"],
  },
  x: {
    clientId: process.env.X_CLIENT_ID || "",
    clientSecret: process.env.X_CLIENT_SECRET || "",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scope: ["tweet.read", "tweet.write", "users.read"],
  },
  reddit: {
    clientId: process.env.REDDIT_CLIENT_ID || "",
    clientSecret: process.env.REDDIT_CLIENT_SECRET || "",
    authUrl: "https://www.reddit.com/api/v1/authorize",
    tokenUrl: "https://www.reddit.com/api/v1/access_token",
    scope: ["submit", "read"],
  },
  substack: {
    clientId: process.env.SUBSTACK_CLIENT_ID || "",
    clientSecret: process.env.SUBSTACK_CLIENT_SECRET || "",
    authUrl: "https://substack.com/oauth/authorize",
    tokenUrl: "https://substack.com/oauth/token",
    scope: ["read", "write"],
  },
}
