/**
 * Mastical OS Agency Types & Validation
 * Multi-tenant SaaS for agency operations
 */

import { z } from "zod"

// ── Workspace (Team) ──────────────────────────────────────────────

export interface Workspace {
  id: string
  name: string
  slug: string
  user_id: string
  created_at: string
  updated_at: string
}

export const WorkspaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
})

// ── Campaign ──────────────────────────────────────────────────────

export interface Campaign {
  id: string
  workspace_id: string
  name: string
  status: "draft" | "active" | "paused" | "completed"
  description?: string
  brief?: string
  objectives?: string[]
  target_audience?: string
  budget?: number
  start_date?: string
  end_date?: string
  channels?: string[] // instagram, twitter, reddit, substack, etc.
  content_count?: number
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export const CampaignSchema = z.object({
  id: z.string(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  status: z.enum(["draft", "active", "paused", "completed"]),
  description: z.string().optional(),
  brief: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  target_audience: z.string().optional(),
  budget: z.number().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  channels: z.array(z.string()).optional(),
  content_count: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(255),
  status: z.enum(["draft", "active"]).default("draft"),
  description: z.string().optional(),
  brief: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  target_audience: z.string().optional(),
  budget: z.number().optional(),
  channels: z.array(z.string()).optional(),
})

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>

// ── Content ───────────────────────────────────────────────────────

export interface Content {
  id: string
  campaign_id: string
  workspace_id: string
  type: "social_post" | "ad" | "email" | "blog" | "video_script"
  platform: string // instagram, twitter, reddit, substack, etc.
  title?: string
  body: string
  status: "draft" | "scheduled" | "published" | "archived"
  metadata?: {
    engagement_score?: number
    recommendations?: string[]
    visuals?: string[]
    hashtags?: string[]
  }
  created_at: string
  updated_at: string
  published_at?: string
}

export const ContentSchema = z.object({
  id: z.string(),
  campaign_id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  type: z.enum(["social_post", "ad", "email", "blog", "video_script"]),
  platform: z.string(),
  title: z.string().optional(),
  body: z.string().min(1),
  status: z.enum(["draft", "scheduled", "published", "archived"]),
  metadata: z
    .object({
      engagement_score: z.number().min(0).max(100).optional(),
      recommendations: z.array(z.string()).optional(),
      visuals: z.array(z.string()).optional(),
      hashtags: z.array(z.string()).optional(),
    })
    .optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  published_at: z.string().datetime().optional(),
})

export const CreateContentSchema = z.object({
  campaign_id: z.string().uuid(),
  type: z.enum(["social_post", "ad", "email", "blog", "video_script"]),
  platform: z.string(),
  title: z.string().optional(),
  body: z.string().min(1),
  status: z.enum(["draft", "scheduled"]).default("draft"),
})

export type CreateContentInput = z.infer<typeof CreateContentSchema>

// ── Analytics ─────────────────────────────────────────────────────

export interface Analytics {
  id: string
  content_id: string
  campaign_id: string
  workspace_id: string
  platform: string
  metric_type: "engagement" | "reach" | "impressions" | "clicks" | "conversions"
  value: number
  date: string
  metadata?: Record<string, any>
  created_at: string
}

export const AnalyticsSchema = z.object({
  id: z.string(),
  content_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  platform: z.string(),
  metric_type: z.enum(["engagement", "reach", "impressions", "clicks", "conversions"]),
  value: z.number().min(0),
  date: z.string().date(),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().datetime(),
})

export const CreateAnalyticsSchema = z.object({
  content_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  platform: z.string(),
  metric_type: z.enum(["engagement", "reach", "impressions", "clicks", "conversions"]),
  value: z.number().min(0),
  date: z.string().date(),
})

export type CreateAnalyticsInput = z.infer<typeof CreateAnalyticsSchema>

// ── Brand Profile ─────────────────────────────────────────────────

export interface BrandProfile {
  id: string
  workspace_id: string
  name: string
  tagline?: string
  description?: string
  tone_of_voice?: string
  target_demographics?: string
  unique_value_prop?: string
  competitor_notes?: string
  logo_url?: string
  brand_colors?: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export const BrandProfileSchema = z.object({
  id: z.string(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  tagline: z.string().optional(),
  description: z.string().optional(),
  tone_of_voice: z.string().optional(),
  target_demographics: z.string().optional(),
  unique_value_prop: z.string().optional(),
  competitor_notes: z.string().optional(),
  logo_url: z.string().url().optional(),
  brand_colors: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const CreateBrandProfileSchema = z.object({
  name: z.string().min(1).max(255),
  tagline: z.string().optional(),
  description: z.string().optional(),
  tone_of_voice: z.string().optional(),
  target_demographics: z.string().optional(),
  unique_value_prop: z.string().optional(),
  competitor_notes: z.string().optional(),
  logo_url: z.string().url().optional(),
  brand_colors: z.array(z.string()).optional(),
})

export type CreateBrandProfileInput = z.infer<typeof CreateBrandProfileSchema>

// ── User & Auth ───────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role: "admin" | "user"
  created_at: string
  updated_at: string
}

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  role: z.enum(["admin", "user"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// ── API Response Types ────────────────────────────────────────────

export interface APIResponse<T> {
  ok: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
