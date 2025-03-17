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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function AdminDashboard() {
  const router = useRouter()
  const { account, isAdmin, isLoading, getElections, getCandidatesCount, isElectionActive, getElectionDetails } = useContractInteraction()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    totalCandidates: 0,
    totalVotes: 0,
  })
  const [electionData, setElectionData] = useState<any[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))']

  useEffect(() => {
    if (isLoading) return;
    
    if (!account || !isAdmin) {
      router.replace("/dashboard/user")
      return
    }

    const loadDashboardData = async () => {
      try {
        setIsLoadingStats(true)
        const elections = await getElections(0, 10)
        let activeCount = 0
        let candidatesCount = 0
        let votesCount = 0
        const electionStats = []

        for (const election of elections) {
          const isActive = await isElectionActive(election.id)
          if (isActive) activeCount++

          const candidates = await getCandidatesCount(election.id)
          candidatesCount += parseInt(candidates)

          const electionData = await getElectionDetails(election.id)
          if (electionData) {
            votesCount += parseInt(electionData.totalVotes)
            electionStats.push({
              name: election.name,
              votes: parseInt(electionData.totalVotes),
              candidates: parseInt(candidates)
            })
          }
        }

        setStats({
          totalElections: elections.length,
          activeElections: activeCount,
          totalCandidates: candidatesCount,
          totalVotes: votesCount,
        })

        setElectionData(electionStats)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    loadDashboardData()
  }, [account, isAdmin, isLoading, router, getElections, getCandidatesCount, isElectionActive, getElectionDetails])

  const pieData = [
    { name: 'Active Elections', value: stats.activeElections },
    { name: 'Inactive Elections', value: stats.totalElections - stats.activeElections },
  ]

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
                <CardTitle>Election Statistics</CardTitle>
                <CardDescription>Votes and candidates per election</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoadingStats ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={electionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="votes" fill="hsl(var(--chart-1))" name="Votes" />
                      <Bar dataKey="candidates" fill="hsl(var(--chart-2))" name="Candidates" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Election Status</CardTitle>
                <CardDescription>Active vs Inactive Elections</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoadingStats ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
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