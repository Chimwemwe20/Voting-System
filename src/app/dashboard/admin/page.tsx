"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BarChart3, Calendar, CheckCircle, Clock, Users, Vote, Plus, BarChart, FileText, Loader } from "lucide-react"
import useContractInteraction from "@/lib/useContractInteraction"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

export default function AdminPage() {
  const { getElections, getElectionsCount, isAdmin, isLoading } = useContractInteraction()
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    completedElections: 0,
    totalVotesInCompletedElections: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Data for charts
  const [completedElectionsData, setCompletedElectionsData] = useState([])
  const [totalElectionsData, setTotalElectionsData] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Get total elections count
        const countResult = await getElectionsCount()
        const totalElections = countResult.success ? Number(countResult.count) : 0

        // Get elections data
        const result = await getElections(0, 100)

        if (result.success) {
          const now = Date.now()
          let activeCount = 0
          let completedCount = 0
          let votesInCompletedElections = 0
          
          // Process completed elections data
          const completedElectionData = []
          
          // Create data structure for total elections by date
          const electionsMap = new Map()

          result.elections.forEach((election) => {
            const startTime = Number(election.startTime) * 1000
            const endTime = Number(election.endTime) * 1000
            const isCompleted = now > endTime
            
            // Track active and completed
            if (now > startTime && now < endTime) {
              activeCount++
            }
            
            if (isCompleted) {
              completedCount++
              votesInCompletedElections += Number(election.totalVotes)
              
              // Add completed elections to chart data
              completedElectionData.push({
                name: election.name || `Election ${election.id}`,
                votes: Number(election.totalVotes)
              })
            }
            
            // Format date for the x-axis of total elections chart
            const creationDate = new Date(startTime).toLocaleDateString('en-US', {
              month: 'short', 
              day: 'numeric'
            })
            
            // Count elections by creation date
            if (electionsMap.has(creationDate)) {
              electionsMap.set(creationDate, electionsMap.get(creationDate) + 1)
            } else {
              electionsMap.set(creationDate, 1)
            }
          })

          // Convert map to chart data array and sort by date
          const electionsByDate = Array.from(electionsMap.entries()).map(([date, count]) => ({
            date,
            elections: count
          }))
          
          // Sort by date
          electionsByDate.sort((a, b) => {
            return new Date(a.date) - new Date(b.date)
          })
          
          // Add cumulative total
          let runningTotal = 0
          const totalElectionsChart = electionsByDate.map(item => {
            runningTotal += item.elections
            return {
              date: item.date,
              total: runningTotal,
              new: item.elections
            }
          })

          setStats({
            totalElections,
            activeElections: activeCount,
            completedElections: completedCount,
            totalVotesInCompletedElections: votesInCompletedElections
          })
          
          setCompletedElectionsData(completedElectionData)
          setTotalElectionsData(totalElectionsChart)
        }
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError("Failed to load dashboard statistics")
      } finally {
        setLoading(false)
      }
    }

    if (!isLoading) {
      fetchStats()
    }
  }, [getElections, getElectionsCount, isLoading])

  if (isLoading || loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <div className="animate-spin mb-4">
          <Loader className="h-10 w-10 text-green-600" />
        </div>
        <p className="text-lg font-medium text-gray-700">Loading dashboard data...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we fetch election statistics</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">You do not have admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage elections, candidates, and view results</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total Elections</h2>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalElections}</div>
              <div className="text-xs text-gray-500">Elections created</div>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Active Elections</h2>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.activeElections}</div>
              <div className="text-xs text-gray-500">Currently running</div>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Completed Elections</h2>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.completedElections}</div>
              <div className="text-xs text-gray-500">Elections ended</div>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <CheckCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total Votes</h2>
              <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalVotesInCompletedElections}</div>
              <div className="text-xs text-gray-500">In completed elections</div>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <BarChart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-500">Common administrative tasks</p>
          
          <div className="mt-5 space-y-3">
            <Link
              href="/dashboard/admin/election/create"
              className="flex items-center justify-center rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-full"
            >
              <Plus className="h-5 w-5 mr-2" /> Create New Election
            </Link>
            
            <Link
              href="/dashboard/admin/election"
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-full"
            >
              <Calendar className="h-5 w-5 mr-2" /> Manage Elections
            </Link>
            
            <Link
              href="/dashboard/admin/results"
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-full"
            >
              <FileText className="h-5 w-5 mr-2" /> View Results
            </Link>
          </div>
        </div>
      </div>

      {/* NEW: Total Elections Created Chart */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Total Elections Created</h2>
          <p className="text-sm text-gray-500">Growth of elections over time</p>
          
          {totalElectionsData.length > 0 ? (
            <div className="mt-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={totalElectionsData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#2563eb" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Total Elections"
                  />
                  <Bar dataKey="new" fill="#93c5fd" name="New Elections" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-5 flex items-center justify-center h-60 bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="mt-2 text-sm text-gray-500">No election data available to display</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Original: Completed Elections Chart with different color scheme */}
      {completedElectionsData.length > 0 ? (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Completed Election Results</h2>
            <p className="text-sm text-gray-500">Vote count for completed elections only</p>
            
            <div className="mt-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={completedElectionsData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="votes" fill="#059669" name="Total Votes" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Completed Election Results</h2>
            <p className="text-sm text-gray-500">No completed elections to display</p>
            <div className="mt-5 flex items-center justify-center h-60 bg-gray-50 rounded-lg">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="mt-2 text-sm text-gray-500">Results will appear here once elections are completed</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}