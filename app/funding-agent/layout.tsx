import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Propstical Funding Agent — Apply to YC, EF, Thiel & more",
  description: "AI-powered funding application assistant for Propstical. Draft tailored answers for YC, Entrepreneur First, Thiel Fellowship, Surge, Blume, and 10+ other programs.",
}

export default function FundingAgentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
