import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Decentralized Voting System",
  description: "Manage and participate in secure blockchain-based elections",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-green-50">{children}</div>
}

