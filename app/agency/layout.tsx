import { AgencyShell } from "@/components/agency/shell"

export const metadata = {
  title: "Mastical Agency OS — AI-Powered Content Operations Platform",
  description:
    "Your agency in your pocket. AI-powered content operations, neuromarketing scoring, and strategic consulting — without the agency price tag.",
}

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return <AgencyShell>{children}</AgencyShell>
}
