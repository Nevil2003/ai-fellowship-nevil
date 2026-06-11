/**
 * Video Clipper Engine
 * Creates short clips from longer videos, applies effects, generates captions
 */

import { callAIStream } from "./ai-unified"

export interface ClipSegment {
  start_time: number // seconds
  end_time: number // seconds
  title?: string
  description?: string
}

export interface ClipTask {
  id: string
  video_url: string
  segments: ClipSegment[]
  status: "pending" | "processing" | "completed" | "failed"
  clips: ClipResult[]
  error?: string
  created_at: string
  updated_at: string
}

export interface ClipResult {
  id: string
  video_url: string
  segment: ClipSegment
  duration: number
  title: string
  description: string
  thumbnail_url?: string
  download_url?: string
  platform_urls?: Record<string, string>
}

export class Clipper {
  /**
   * Generate clip timestamps from video using AI
   * Identifies key moments, highlights, etc.
   */
  async generateClipSegments(
    videoTitle: string,
    videoDescription: string,
    duration: number,
    context?: string,
  ): Promise<ClipSegment[]> {
    const prompt = `
You are a video editor that identifies the best moments to clip from a video.

Video Details:
- Title: ${videoTitle}
- Description: ${videoDescription}
- Duration: ${Math.floor(duration / 60)} minutes ${duration % 60} seconds
${context ? `- Context: ${context}` : ""}

Generate 3-5 natural clip segments. Each clip should be 15-60 seconds and represent a complete thought/moment.

Format your response as JSON:
[
  { "start_time": 0, "end_time": 45, "title": "Hook", "description": "Opening that grabs attention" },
  { "start_time": 45, "end_time": 120, "title": "Main Point", "description": "Core message" }
]

Only return valid JSON, no other text.
    `

    try {
      let response = ""

      await callAIStream({
        prompt,
        onChunk: (chunk) => {
          response += chunk
        },
      })

      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        return this.getDefaultSegments(duration)
      }

      const segments = JSON.parse(jsonMatch[0]) as ClipSegment[]
      return segments.filter((s) => s.end_time <= duration && s.start_time < s.end_time)
    } catch (err) {
      console.error("Generate segments error:", err)
      return this.getDefaultSegments(duration)
    }
  }

  /**
   * Generate AI captions for a clip
   */
  async generateCaption(clipTitle: string, clipDuration: number): Promise<string> {
    const prompt = `
Create a catchy, engaging caption for a ${clipDuration}s social media clip titled "${clipTitle}".

Requirements:
- Keep it under 150 characters
- Include relevant hashtags (3-5)
- Make it shareable and engaging
- Suitable for Instagram, TikTok, X

Just return the caption text, nothing else.
    `

    try {
      let caption = ""

      await callAIStream({
        prompt,
        onChunk: (chunk) => {
          caption += chunk
        },
      })

      return caption.trim()
    } catch (err) {
      console.error("Generate caption error:", err)
      return `Check out this ${clipDuration}s clip! #viral #trending`
    }
  }

  /**
   * Create clip task (queues clip generation)
   */
  async createClipTask(videoUrl: string, segments: ClipSegment[]): Promise<ClipTask> {
    return {
      id: `clip-${Date.now()}`,
      video_url: videoUrl,
      segments,
      status: "pending",
      clips: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  /**
   * Process clips (simulated - in production would use ffmpeg/cloud service)
   */
  async processClips(task: ClipTask): Promise<ClipTask> {
    const updatedTask: ClipTask = {
      ...task,
      status: "processing",
      updated_at: new Date().toISOString(),
    }

    try {
      const clips: ClipResult[] = []

      for (const segment of task.segments) {
        const duration = segment.end_time - segment.start_time
        const caption = await this.generateCaption(segment.title || "Clip", duration)

        clips.push({
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          video_url: task.video_url,
          segment,
          duration,
          title: segment.title || "Untitled Clip",
          description: caption,
          thumbnail_url: `${task.video_url}?start=${segment.start_time}`,
          download_url: task.video_url, // Placeholder
        })
      }

      return {
        ...updatedTask,
        clips,
        status: "completed",
        updated_at: new Date().toISOString(),
      }
    } catch (err) {
      return {
        ...updatedTask,
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
        updated_at: new Date().toISOString(),
      }
    }
  }

  private getDefaultSegments(duration: number): ClipSegment[] {
    if (duration < 60) {
      return [{ start_time: 0, end_time: duration, title: "Full Video", description: "Watch the full video" }]
    }

    return [
      { start_time: 0, end_time: 30, title: "Hook", description: "Opening highlight" },
      { start_time: 30, end_time: Math.min(90, duration), title: "Main Content", description: "Key moment" },
      {
        start_time: Math.max(duration - 30, 90),
        end_time: duration,
        title: "Outro",
        description: "Closing moment",
      },
    ]
  }
}

export function createClipper(): Clipper {
  return new Clipper()
}
