/**
 * Auto-Clipper Engine
 * Fully automated: search → clip → post → track
 */

import { createVideoClient, type VideoCategory } from "./video-client"
import { createClipper } from "./clipper"
import { SocialMediaClient } from "./social-client"

export type AutoClipperStatus = "idle" | "running" | "paused" | "error"

export interface AutoClipperConfig {
  workspace_id: string
  enabled: boolean
  run_daily_at?: string // "09:00" (UTC)
  categories: VideoCategory[]
  keywords: string[]
  platforms: ("instagram" | "x" | "reddit" | "tiktok")[]
  clips_per_day: number
  auto_post: boolean
  max_video_duration: number // seconds
  min_views: number
}

export interface AutoClipperJob {
  id: string
  workspace_id: string
  status: "pending" | "running" | "completed" | "failed"
  started_at: string
  completed_at?: string
  videos_found: number
  clips_created: number
  clips_posted: number
  error?: string
}

export class AutoClipper {
  private videoClient: ReturnType<typeof createVideoClient>
  private clipper: ReturnType<typeof createClipper>
  private socialClient: SocialMediaClient

  constructor() {
    this.videoClient = createVideoClient()
    this.clipper = createClipper()
    this.socialClient = new SocialMediaClient()
  }

  /**
   * Run auto-clipper job
   */
  async runJob(config: AutoClipperConfig): Promise<AutoClipperJob> {
    const jobId = `job-${Date.now()}`
    const job: AutoClipperJob = {
      id: jobId,
      workspace_id: config.workspace_id,
      status: "running",
      started_at: new Date().toISOString(),
      videos_found: 0,
      clips_created: 0,
      clips_posted: 0,
    }

    try {
      // Step 1: Search for trending videos
      console.log(`[${jobId}] Searching for trending videos...`)
      const allVideos = []

      // Search trending categories
      for (const category of config.categories) {
        const result = await this.videoClient.searchTrending(category, 5)
        allVideos.push(
          ...result.videos.filter(
            (v) => v.duration <= config.max_video_duration && v.views >= config.min_views,
          ),
        )
      }

      // Search keywords
      for (const keyword of config.keywords) {
        const result = await this.videoClient.searchByKeyword(keyword, 3)
        allVideos.push(
          ...result.videos.filter(
            (v) => v.duration <= config.max_video_duration && v.views >= config.min_views,
          ),
        )
      }

      job.videos_found = allVideos.length
      console.log(`[${jobId}] Found ${job.videos_found} videos`)

      // Step 2: Generate clips
      const videosToClip = allVideos.slice(0, config.clips_per_day)

      for (const video of videosToClip) {
        try {
          console.log(`[${jobId}] Clipping: ${video.title}`)

          // Generate clip segments
          const segments = await this.clipper.generateClipSegments(
            video.title,
            video.description,
            video.duration,
          )

          // Create clips
          const task = await this.clipper.createClipTask(video.url, segments)
          const processedTask = await this.clipper.processClips(task)

          job.clips_created += processedTask.clips.length

          // Step 3: Auto-post if enabled
          if (config.auto_post && processedTask.clips.length > 0) {
            for (const clip of processedTask.clips) {
              try {
                console.log(`[${jobId}] Posting clip: ${clip.title}`)

                for (const platform of config.platforms) {
                  try {
                    await this.socialClient.postContent(platform, {
                      text: clip.description,
                      media_urls: clip.thumbnail_url ? [clip.thumbnail_url] : [],
                      metadata: {
                        clip_id: clip.id,
                        source_video: video.url,
                        segment: clip.segment,
                      },
                    })

                    job.clips_posted++
                    console.log(`[${jobId}] Posted to ${platform}`)
                  } catch (err) {
                    console.error(`[${jobId}] Post to ${platform} failed:`, err)
                  }
                }
              } catch (err) {
                console.error(`[${jobId}] Clip posting error:`, err)
              }
            }
          }
        } catch (err) {
          console.error(`[${jobId}] Video clipping error:`, err)
        }
      }

      job.status = "completed"
      job.completed_at = new Date().toISOString()

      console.log(`[${jobId}] Job completed: ${job.clips_created} clips, ${job.clips_posted} posted`)
      return job
    } catch (err) {
      job.status = "failed"
      job.error = err instanceof Error ? err.message : "Unknown error"
      job.completed_at = new Date().toISOString()

      console.error(`[${jobId}] Job failed:`, err)
      return job
    }
  }

  /**
   * Schedule daily runs (for cron job)
   */
  async scheduleDaily(config: AutoClipperConfig): Promise<void> {
    const now = new Date()
    const [hours, minutes] = (config.run_daily_at || "09:00").split(":").map(Number)

    const scheduledTime = new Date()
    scheduledTime.setHours(hours, minutes, 0, 0)

    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    const delay = scheduledTime.getTime() - now.getTime()
    console.log(`[Auto-Clipper] Scheduled for ${scheduledTime.toISOString()} (in ${Math.round(delay / 1000 / 60)} minutes)`)

    // Note: In production, use a proper job queue (Bull, Inngest, etc.)
    // This is a placeholder for demonstration
    setTimeout(() => {
      this.runJob(config)
    }, delay)
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<AutoClipperJob | null> {
    // In production, fetch from database
    return null
  }

  /**
   * List recent jobs
   */
  async listJobs(workspace_id: string, limit: number = 10): Promise<AutoClipperJob[]> {
    // In production, fetch from database
    return []
  }
}

export function createAutoClipper(): AutoClipper {
  return new AutoClipper()
}
