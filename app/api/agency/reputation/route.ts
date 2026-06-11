import { NextRequest, NextResponse } from "next/server"

type Sentiment = "positive" | "neutral" | "negative"

interface Mention {
  id: string
  platform: string
  platformIcon: string
  platformColor: string
  author: string
  handle: string
  content: string
  time: string
  sentiment: Sentiment
  reach: number
  url: string
  replied: boolean
  priority: "high" | "medium" | "low"
  draftReply: string
}

const positive = ["love", "great", "good", "useful", "impressive", "recommend", "worth", "best", "solid", "helpful"]
const negative = ["bad", "broken", "crash", "expensive", "hate", "issue", "problem", "frustrating", "scam", "lazy"]

function classify(text: string): Sentiment {
  const lower = text.toLowerCase()
  const pos = positive.filter((word) => lower.includes(word)).length
  const neg = negative.filter((word) => lower.includes(word)).length
  if (neg > pos) return "negative"
  if (pos > neg) return "positive"
  return "neutral"
}

function draftReply(brand: string, sentiment: Sentiment) {
  if (sentiment === "positive") return `Thanks for the shoutout. Glad ${brand} is helping. If there is one workflow you want us to improve next, send it over.`
  if (sentiment === "negative") return `Thanks for calling this out. Sorry it has not felt smooth. Can you share what happened so the ${brand} team can dig in and fix it?`
  return `Good question. ${brand} is built for teams that want faster content workflows with stronger pre-publish checks. Happy to share specifics if useful.`
}

function timeAgo(isoOrEpoch: string | number) {
  const ts = typeof isoOrEpoch === "number" ? isoOrEpoch : new Date(isoOrEpoch).getTime()
  const diff = Date.now() - ts
  const minutes = Math.max(1, Math.floor(diff / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim() || "Mastical"
  const brand = req.nextUrl.searchParams.get("brand")?.trim() || query
  const normalizedQuery = query.toLowerCase()

  const mentions: Mention[] = []

  try {
    const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=8`
    const reddit = await fetch(redditUrl, {
      headers: { "User-Agent": "MasticalAgencyOS/1.0" },
      next: { revalidate: 120 },
    })
    if (reddit.ok) {
      const json = await reddit.json()
      for (const item of json?.data?.children ?? []) {
        const post = item.data
        const text = [post.title, post.selftext].filter(Boolean).join(" ")
        if (!text.toLowerCase().includes(normalizedQuery)) continue
        const sentiment = classify(text)
        const reach = Math.max(1, Number(post.ups ?? 0) + Number(post.num_comments ?? 0) * 3)
        mentions.push({
          id: `reddit-${post.id}`,
          platform: "Reddit",
          platformIcon: "R",
          platformColor: "#ff4500",
          author: post.author || "redditor",
          handle: `r/${post.subreddit || "all"}`,
          content: text.slice(0, 280),
          time: timeAgo((post.created_utc || Date.now() / 1000) * 1000),
          sentiment,
          reach,
          url: `https://www.reddit.com${post.permalink}`,
          replied: false,
          priority: sentiment === "negative" || reach > 100 ? "high" : reach > 30 ? "medium" : "low",
          draftReply: draftReply(brand, sentiment),
        })
      }
    }
  } catch {}

  try {
    const hnUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=8`
    const hn = await fetch(hnUrl, { next: { revalidate: 120 } })
    if (hn.ok) {
      const json = await hn.json()
      for (const hit of json?.hits ?? []) {
        const text = hit.title || hit.story_text || ""
        if (!text.toLowerCase().includes(normalizedQuery)) continue
        const sentiment = classify(text)
        const reach = Math.max(1, Number(hit.points ?? 0) + Number(hit.num_comments ?? 0) * 2)
        mentions.push({
          id: `hn-${hit.objectID}`,
          platform: "Hacker News",
          platformIcon: "HN",
          platformColor: "#ff6600",
          author: hit.author || "hn user",
          handle: "news.ycombinator.com",
          content: text.slice(0, 280),
          time: timeAgo(hit.created_at),
          sentiment,
          reach,
          url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          replied: false,
          priority: sentiment === "negative" || reach > 100 ? "high" : reach > 30 ? "medium" : "low",
          draftReply: draftReply(brand, sentiment),
        })
      }
    }
  } catch {}

  return NextResponse.json({
    query,
    sources: ["Reddit", "Hacker News"],
    mentions: mentions.sort((a, b) => b.reach - a.reach).slice(0, 12),
  })
}
