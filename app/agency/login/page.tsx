"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Mail, Loader2, CheckCircle2, ArrowLeft, Lock } from "lucide-react"
import { useAuth } from "@/lib/use-auth"

export default function LoginPage() {
  const { isEnabled, user, signInWithEmail, signOut } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!email.includes("@") || sending) return
    setSending(true)
    setError(null)
    const { error: err } = await signInWithEmail(email)
    setSending(false)
    if (err) setError(err)
    else setSent(true)
  }

  return (
    <div className="min-h-dvh bg-[#09090f] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link
          href="/agency"
          className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-6"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to dashboard
        </Link>

        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0f0f1a]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-black text-white mb-1">Sign in to Mastical OS</h1>
          <p className="text-xs text-white/35 leading-relaxed mb-5">
            Your campaigns, content, and scores — saved to your account, on every device.
          </p>

          {!isEnabled ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
              <p className="text-xs text-amber-200/80 leading-relaxed">
                <span className="font-bold text-amber-300">Accounts not configured yet.</span> The
                operator needs to connect Supabase (free) — see{" "}
                <span className="font-mono">SUPABASE_SETUP.md</span> in the repo. Until then the app
                runs in local mode: fully functional, data stays in this browser.
              </p>
            </div>
          ) : user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-300">
                  Signed in as <span className="font-bold">{user.email}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push("/agency")}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white text-xs font-bold hover:opacity-90 transition-all"
                >
                  Go to dashboard
                </button>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-white/50 hover:text-white/80 transition-all"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : sent ? (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              <Mail className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                <span className="font-bold">Check your inbox.</span> We sent a sign-in link to{" "}
                {email}. Click it and you&apos;re in — no password needed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="you@company.com"
                className="w-full px-3.5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/40 transition-colors"
              />
              {error && <p className="text-[11px] text-red-400">{error}</p>}
              <button
                onClick={submit}
                disabled={!email.includes("@") || sending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-40"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {sending ? "Sending link..." : "Send magic link"}
              </button>
              <p className="text-[10px] text-white/20 text-center">
                Passwordless sign-in. We email you a one-time link.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
