"use client"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import useContractInteraction from "@/lib/useContractInteraction"
import { BarChart3, CalendarDays, Plus, Users, Vote } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const router = useRouter()
  const { account, isAdmin, isLoading, getElections, getCandidatesCount, isElectionActive, getElectionDetails } = useContractInteraction()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [page, setPage] = useState(0) // Pagination state
  const [hasMore, setHasMore] = useState(true) // Flag for more data
  const [elections, setElections] = useState([]) // Store elections

  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    totalCandidates: 0,
    totalVotes: 0,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    if (isLoading) return;
    
    if (!account || !isAdmin) {
      router.replace("/dashboard/user")
      return
    }

    loadMoreElections() // Initial load
  }, [account, isAdmin, isLoading, router])

  const loadMoreElections = async () => {
    try {
      setIsLoadingStats(true)

      const newElections = await getElections(page * 5, 5) // Fetch 5 elections at a time

      if (newElections.length === 0) {
        setHasMore(false) // Stop if no more elections
        setIsLoadingStats(false)
        return
      }

      setElections((prev) => [...prev, ...newElections])
      setPage((prev) => prev + 1)

      const electionIds = newElections.map(e => e.id)

      if (electionIds.length === 0) {
        setStats({ totalElections: 0, activeElections: 0, totalCandidates: 0, totalVotes: 0 })
        return
      }

      // Fetch all data in parallel
      const [activeStatuses, candidatesCounts, electionDetails] = await Promise.all([
        Promise.all(electionIds.map(id => isElectionActive(id))),
        Promise.all(electionIds.map(id => getCandidatesCount(id))),
        Promise.all(electionIds.map(id => getElectionDetails(id))),
      ])

      const activeCount = activeStatuses.filter(Boolean).length
      const totalCandidates = candidatesCounts.reduce((sum, count) => sum + parseInt(count), 0)
      const totalVotes = electionDetails.reduce((sum, details) => sum + parseInt(details.totalVotes), 0)

      setStats((prev) => ({
        totalElections: prev.totalElections + newElections.length,
        activeElections: prev.activeElections + activeCount,
        totalCandidates: prev.totalCandidates + totalCandidates,
        totalVotes: prev.totalVotes + totalVotes,
      }))
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} showMenuButton={true} />

      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 bg-green-50 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-green-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage elections, candidates, and view results</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Elections" value={stats.totalElections} description="Elections created" icon={CalendarDays} isLoading={isLoadingStats} />
            <StatsCard title="Active Elections" value={stats.activeElections} description="Currently running" icon={Vote} isLoading={isLoadingStats} />
            <StatsCard title="Total Candidates" value={stats.totalCandidates} description="Across all elections" icon={Users} isLoading={isLoadingStats} />
            <StatsCard title="Total Votes" value={stats.totalVotes} description="Votes cast" icon={BarChart3} isLoading={isLoadingStats} />
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/dashboard/admin/elections/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Election
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/admin/elections">
                    <Vote className="mr-2 h-4 w-4" />
                    Manage Elections
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/admin/results">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Results
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {hasMore && (
            <button
              onClick={loadMoreElections}
              disabled={isLoadingStats}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {isLoadingStats ? "Loading..." : "Load More Elections"}
            </button>
          )}
        </main>
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: number
  description: string
  icon: React.ElementType
  isLoading: boolean
}

function StatsCard({ title, value, description, icon: Icon, isLoading }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {isLoading ? (
              <div className="mt-2 h-7 w-16 animate-pulse rounded bg-gray-200" />
            ) : (
              <p className="mt-2 text-3xl font-bold text-green-700">{value}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          </div>
          <div className="rounded-full bg-green-100 p-3">
            <Icon className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
