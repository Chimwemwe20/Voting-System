"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BarChart3, Calendar, CheckCircle, Clock, Users, Vote } from "lucide-react"
import useContractInteraction from "@/lib/useContractInteraction"

export default function AdminPage() {
  const { getElections, getElectionsCount, isAdmin, isLoading } = useContractInteraction()
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    upcomingElections: 0,
    completedElections: 0,
    totalVotes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
          let upcomingCount = 0
          let completedCount = 0
          let totalVotes = 0

          result.elections.forEach((election) => {
            const startTime = Number(election.startTime) * 1000
            const endTime = Number(election.endTime) * 1000

            if (now > endTime) {
              completedCount++
            } else if (now > startTime) {
              activeCount++
            } else {
              upcomingCount++
            }

            totalVotes += Number(election.totalVotes)
          })

          setStats({
            totalElections,
            activeElections: activeCount,
            upcomingElections: upcomingCount,
            completedElections: completedCount,
            totalVotes,
          })
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
    return <div className="flex h-full items-center justify-center">Loading dashboard...</div>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your election system</p>
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
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
                <Vote className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Elections</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalElections}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/admin/election" className="font-medium text-green-700 hover:text-green-900">
                View all
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-blue-100 p-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Elections</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.activeElections}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/admin/election" className="font-medium text-blue-700 hover:text-blue-900">
                View active
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-yellow-100 p-3">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Elections</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.upcomingElections}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/admin/election" className="font-medium text-yellow-700 hover:text-yellow-900">
                View upcoming
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-purple-100 p-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Elections</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.completedElections}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link href="/dashboard/admin/election" className="font-medium text-purple-700 hover:text-purple-900">
                View completed
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/admin/election/create"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Create New Election
            </Link>
            <Link
              href="/dashboard/admin/election"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Manage Elections
            </Link>
            <Link
              href="#"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              View Reports
            </Link>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <div className="mt-5 flow-root">
            <ul className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 ring-8 ring-white">
                        <Vote className="h-5 w-5 text-green-500" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500">
                          New election <span className="font-medium text-gray-900">Presidential Election 2024</span> was
                          created
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time dateTime="2023-09-20">1 hour ago</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 ring-8 ring-white">
                        <Users className="h-5 w-5 text-blue-500" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900">5 new voters</span> registered in the system
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time dateTime="2023-09-20">3 hours ago</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 ring-8 ring-white">
                        <BarChart3 className="h-5 w-5 text-purple-500" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900">Local Council Election</span> has ended with 245
                          total votes
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time dateTime="2023-09-19">Yesterday</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
