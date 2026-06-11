/**
 * Custom hook for Mastical OS agency API calls
 * Handles loading, error states, and response streaming
 */

import { useState, useCallback } from "react"
import type { Campaign, Content, BrandProfile } from "@/lib/types/agency"

interface UseAPIState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface StreamingResponse {
  text: string
  done: boolean
}

/**
 * Hook for chatting with the strategy consultant
 */
export function useChatAPI() {
  const [state, setState] = useState<UseAPIState<string>>({
    data: null,
    loading: false,
    error: null,
  })

  const chat = useCallback(
    async (
      messages: Array<{ role: "user" | "assistant"; content: string }>,
      onChunk?: (chunk: string) => void
    ): Promise<string> => {
      setState({ data: null, loading: true, error: null })

      try {
        const res = await fetch("/api/agency/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `HTTP ${res.status}`)
        }

        let fullText = ""
        const reader = res.body?.getReader()
        if (!reader) throw new Error("No response body")

        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  fullText += content
                  onChunk?.(content)
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }

        setState({ data: fullText, loading: false, error: null })
        return fullText
      } catch (err) {
        const error = err instanceof Error ? err.message : "Unknown error"
        setState({ data: null, loading: false, error })
        throw err
      }
    },
    []
  )

  return { ...state, chat }
}

/**
 * Hook for generating content (social, ads, email, blog, video)
 */
export function useGenerateAPI() {
  const [state, setState] = useState<UseAPIState<string>>({
    data: null,
    loading: false,
    error: null,
  })

  const generate = useCallback(
    async (
      type: "social" | "ads" | "blog" | "email" | "video",
      options: {
        brand?: string
        audience?: string
        message?: string
        tone?: string
      },
      onChunk?: (chunk: string) => void
    ): Promise<string> => {
      setState({ data: null, loading: true, error: null })

      try {
        const res = await fetch("/api/agency/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, ...options }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `HTTP ${res.status}`)
        }

        let fullText = ""
        const reader = res.body?.getReader()
        if (!reader) throw new Error("No response body")

        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  fullText += content
                  onChunk?.(content)
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }

        setState({ data: fullText, loading: false, error: null })
        return fullText
      } catch (err) {
        const error = err instanceof Error ? err.message : "Unknown error"
        setState({ data: null, loading: false, error })
        throw err
      }
    },
    []
  )

  return { ...state, generate }
}

/**
 * Hook for scoring content (neural engagement analysis)
 */
export function useScoreAPI() {
  const [state, setState] = useState<UseAPIState<any>>({
    data: null,
    loading: false,
    error: null,
  })

  const score = useCallback(async (content: string): Promise<any> => {
    setState({ data: null, loading: true, error: null })

    try {
      const res = await fetch("/api/agency/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setState({ data, loading: false, error: null })
      return data
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error"
      setState({ data: null, loading: false, error })
      throw err
    }
  }, [])

  return { ...state, score }
}

/**
 * Hook for workspace/campaign management
 */
export function useWorkspaceAPI() {
  const [state, setState] = useState<UseAPIState<any>>({
    data: null,
    loading: false,
    error: null,
  })

  const getWorkspace = useCallback(async (workspaceId = "default") => {
    setState({ data: null, loading: true, error: null })
    try {
      const res = await fetch(`/api/agency/workspace?workspace_id=${workspaceId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setState({ data, loading: false, error: null })
      return data
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error"
      setState({ data: null, loading: false, error })
      throw err
    }
  }, [])

  const createCampaign = useCallback(
    async (
      workspace_id: string,
      campaign: {
        name: string
        status?: "draft" | "active"
        description?: string
        brief?: string
        objectives?: string[]
        target_audience?: string
        budget?: number
        channels?: string[]
      }
    ) => {
      try {
        const res = await fetch("/api/agency/workspace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspace_id, ...campaign }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `HTTP ${res.status}`)
        }
        return await res.json()
      } catch (err) {
        throw err
      }
    },
    []
  )

  const updateBrandProfile = useCallback(
    async (
      workspace_id: string,
      profile: {
        name: string
        tagline?: string
        description?: string
        tone_of_voice?: string
        target_demographics?: string
        unique_value_prop?: string
      }
    ) => {
      try {
        const res = await fetch("/api/agency/workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspace_id,
            type: "brand_profile",
            ...profile,
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || `HTTP ${res.status}`)
        }
        return await res.json()
      } catch (err) {
        throw err
      }
    },
    []
  )

  return {
    ...state,
    getWorkspace,
    createCampaign,
    updateBrandProfile,
  }
}
