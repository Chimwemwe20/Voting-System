"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Filter, Search, Calendar, Clock, CheckCircle2, CalendarX } from "lucide-react"
import useContractInteraction from "@/lib/useContractInteraction"
import Layout from "../components/Layout"
import { formatDate } from "../utils/formatDate"

export default function ElectionsPage() {
  const router = useRouter()
  const { 
    account, 
    isAdmin, 
    isRegistered,
    isLoading,
    getElections,
    hasUserVoted,
    getElectionDetails,
    isElectionActive
  } = useContractInteraction()
  
  const [elections, setElections] = useState([])
  const [filteredElections, setFilteredElections] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all") // all, active, upcoming, completed, voted
  
  useEffect(() => {
    if (isLoading) return;

    if (!account || !isRegistered) {
      router.replace("/connect")
      return
    }

    const loadElections = async () => {
      try {
        setIsLoadingData(true)
        const electionsResult = await getElections(0, 100)
        
        if (!electionsResult.success) {
          console.error("Failed to fetch elections:", electionsResult.error)
          return
        }

        const allElections = []
        const now = Math.floor(Date.now() / 1000)

        for (const election of electionsResult.elections) {
          // Get full election details
          const detailsResult = await getElectionDetails(election.id)
          if (!detailsResult.success || !detailsResult.election) continue
          
          const fullElection = detailsResult.election
          const startTime = parseInt(fullElection.startTime)
          const endTime = parseInt(fullElection.endTime)
          
          // Check if user has voted in this election
          const votedResult = await hasUserVoted(election.id)
          const hasVoted = votedResult.success && votedResult.hasVoted
          
          // Determine election status
          let status
          if (now < startTime) {
            status = "upcoming"
          } else if (now >= startTime && now <= endTime) {
            status = "active"
          } else {
            status = "completed"
          }
          
          allElections.push({
            ...election,
            startTime,
            endTime,
            hasVoted,
            status
          })
        }

        setElections(allElections)
        setFilteredElections(allElections)
      } catch (error) {
        console.error("Error loading elections:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadElections()
  }, [account, isAdmin, isRegistered, isLoading, router, getElections, hasUserVoted, getElectionDetails])
  
  // Filter elections based on search query and filter type
  useEffect(() => {
    let result = [...elections]
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(election => 
        election.name.toLowerCase().includes(query) || 
        election.electionType.toLowerCase().includes(query)
      )
    }
    
    // Apply status filter
    if (filter !== "all") {
      if (filter === "voted") {
        result = result.filter(election => election.hasVoted)
      } else {
        result = result.filter(election => election.status === filter)
      }
    }
    
    setFilteredElections(result)
  }, [elections, searchQuery, filter])

  const getStatusBadge = (status, hasVoted) => {
    switch(status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Clock className="w-3 h-3 mr-1" />
            Active
          </span>
        )
      case "upcoming":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Calendar className="w-3 h-3 mr-1" />
            Upcoming
          </span>
        )
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <CalendarX className="w-3 h-3 mr-1" />
            Completed
          </span>
        )
      default:
        return null
    }
  }

  return (
    <Layout account={account}>
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">All Elections</h1>
          <p className="text-sm text-gray-500 mt-1">Browse and participate in elections</p>
        </div>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            {/* Filters and search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search elections..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="relative sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Elections</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="voted">Voted</option>
                </select>
              </div>
            </div>

            {/* Elections list */}
            {filteredElections.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredElections.map((election) => (
                    <li key={election.id}>
                      <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" 
                           onClick={() => router.push(`/dashboard/user/elections/${election.id}`)}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 truncate">{election.name}</h3>
                            <p className="mt-1 flex items-center text-sm text-gray-500">
                              {election.electionType}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                            {getStatusBadge(election.status, election.hasVoted)}
                            {election.hasVoted && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Voted
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {formatDate(election.startTime)} - {formatDate(election.endTime)}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            {election.status === "active" && !election.hasVoted ? (
                              <button
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/user/elections/${election.id}/vote`);
                                }}
                              >
                                Vote Now
                              </button>
                            ) : election.status === "completed" ? (
                              <button
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/user/elections/${election.id}/results`);
                                }}
                              >
                                View Results
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12 bg-white shadow rounded-lg">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                  <CalendarX className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No elections found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || filter !== "all" 
                    ? "Try adjusting your search or filter criteria" 
                    : "Elections will appear here once they are created"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}