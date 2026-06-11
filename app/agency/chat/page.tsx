"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { logActivity } from "@/lib/local-stats"
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  RefreshCw,
  Zap,
  MessageSquareText,
  LayoutTemplate,
  Target,
  TrendingUp,
  Lightbulb,
  ChevronDown,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const QUICK_PROMPTS = [
  { label: "Brand Strategy", icon: Target, prompt: "Help me develop a brand strategy for my new startup. We're in the wellness space targeting millennials." },
  { label: "Campaign Brief", icon: LayoutTemplate, prompt: "I need a full campaign brief for a product launch. The product is a sustainable protein powder brand called Verde." },
  { label: "Content Plan", icon: MessageSquareText, prompt: "Create a 30-day content calendar for a B2B SaaS company that sells project management software." },
  { label: "Growth Levers", icon: TrendingUp, prompt: "What are the top 5 growth levers for a DTC fashion brand that's stuck at $500k ARR?" },
  { label: "Ad Strategy", icon: Zap, prompt: "Build a Meta ad strategy for a luxury skincare brand launching into the US market with a $20k/month budget." },
  { label: "Positioning", icon: Lightbulb, prompt: "Help me articulate our unique positioning. We're a fintech app that makes expense tracking effortless for freelancers." },
]

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "**Hey — I'm your Mastical Strategic AI.**\n\nThink of me as your agency's secret weapon. Dump your raw vision, half-baked ideas, or business challenges here. I'll help you:\n\n→ Build brand and campaign strategies\n→ Develop content and go-to-market plans\n→ Identify growth levers and positioning gaps\n→ Generate creative briefs your team can execute on\n\n**No fluff. No generic advice. Just sharp strategy.**\n\nWhat are you working on?",
  timestamp: new Date(),
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-violet-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isUser = msg.role === "user"

  const copy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 group ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
          isUser
            ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white"
            : "bg-gradient-to-br from-indigo-600 to-violet-600 border border-violet-500/30"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-violet-200" />}
      </div>

      <div className={`flex-1 max-w-[75%] ${isUser ? "flex flex-col items-end" : ""}`}>
        <div
          className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-violet-600/30 border border-violet-500/30 text-white"
              : "bg-[#13131e] border border-white/[0.07] text-white/80"
          } ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-p:text-white/75 prose-strong:text-white prose-headings:text-white prose-headings:mt-3 prose-headings:mb-1.5 prose-li:my-0.5 prose-li:text-white/70 prose-table:text-xs prose-th:text-violet-300 prose-td:text-white/70 prose-code:text-violet-300 prose-a:text-violet-400">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <div className={`flex items-center gap-2 mt-1.5 px-1 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] text-white/20" suppressHydrationWarning>
            {mounted ? msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
          </span>
          {!isUser && (
            <button
              onClick={copy}
              className="opacity-0 group-hover:opacity-100 text-[10px] text-white/30 hover:text-white/60 flex items-center gap-1 transition-all"
            >
              <Copy className="w-2.5 h-2.5" />
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [showQuickPrompts, setShowQuickPrompts] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isStreaming])

  const sessionLogged = useRef(false)

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return
    setShowQuickPrompts(false)
    if (!sessionLogged.current) {
      sessionLogged.current = true
      logActivity({ kind: "chat", message: `AI consultation started: "${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"` })
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"

    const aiMsgId = (Date.now() + 1).toString()
    const aiMsg: Message = { id: aiMsgId, role: "assistant", content: "", timestamp: new Date() }
    setMessages([...history, aiMsg])
    setIsStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch("/api/agency/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok || !res.body) {
        let detail = ""
        try {
          const err = await res.json()
          if (err?.error) detail = String(err.error)
        } catch { /* ignore */ }
        throw new Error(detail || `API error ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6).trim()
          if (data === "[DONE]") break

          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              accumulated += delta
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, content: accumulated } : m))
              )
            }
          } catch {
            // partial JSON chunk, skip
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, content: `Sorry, I hit an error reaching the AI${(err as Error).message ? ` — ${(err as Error).message}` : ""}. Please try again or check Settings → System status.` }
              : m
          )
        )
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"
  }

  const resetChat = () => {
    sessionLogged.current = false
    abortRef.current?.abort()
    setMessages([{ ...WELCOME, timestamp: new Date() }])
    setShowQuickPrompts(true)
    setIsStreaming(false)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#09090f]">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/[0.06] bg-[#0a0a14]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center border border-violet-500/30 shadow-lg shadow-violet-500/20">
              <Bot className="w-5 h-5 text-violet-200" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0a14]" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Mastical Strategic AI</div>
              <div className="text-[10px] text-emerald-400/80 flex items-center gap-1">
                <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                Online · Agency Consultant Mode
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/20 border border-white/[0.07] px-2.5 py-1 rounded-full">
              Claude Sonnet · Live AI
            </span>
            <button
              onClick={resetChat}
              className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {isStreaming && messages[messages.length - 1]?.content === "" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full shrink-0 bg-gradient-to-br from-indigo-600 to-violet-600 border border-violet-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-violet-200" />
            </div>
            <div className="bg-[#13131e] border border-white/[0.07] rounded-2xl rounded-tl-sm">
              <TypingDots />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <AnimatePresence>
        {showQuickPrompts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 px-6 pb-3 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/25 uppercase tracking-widest font-semibold">Quick start</span>
              <button onClick={() => setShowQuickPrompts(false)} className="text-white/20 hover:text-white/40">
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((qp) => {
                const Icon = qp.icon
                return (
                  <button
                    key={qp.label}
                    onClick={() => sendMessage(qp.prompt)}
                    disabled={isStreaming}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.07] hover:border-violet-500/30 transition-all disabled:opacity-40"
                  >
                    <Icon className="w-3 h-3" />
                    {qp.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="shrink-0 px-6 pb-6">
        <div className="flex gap-3 items-end p-3 rounded-2xl border border-white/[0.08] bg-[#0f0f1a] focus-within:border-violet-500/40 transition-colors">
          <Sparkles className="w-4 h-4 text-violet-400/60 shrink-0 mb-2.5" />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Dump your vision, challenge, or question here... (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 resize-none outline-none leading-relaxed min-h-[36px]"
            style={{ height: "auto" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-all mb-0.5"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <p className="text-center text-[10px] text-white/15 mt-2">
          Mastical AI · Claude Sonnet · Responses are AI-generated for strategic planning purposes
        </p>
      </div>
    </div>
  )
}
