import { AgencySidebar } from "@/components/agency/sidebar"

export const metadata = {
  title: "Mastical Agency OS — AI-Powered Content Operations Platform",
  description:
    "Your agency in your pocket. AI-powered content operations, neuromarketing scoring, and strategic consulting — without the agency price tag.",
}

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#09090f]">
      <AgencySidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
    </div>
  )
}
