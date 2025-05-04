"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import useContractInteraction from "@/lib/useContractInteraction"
import Layout from "./components/Layout"
import StatCards from "./components/StatCards"
import QuickActions from "./components/QuickActions"
import ActiveElections from "./components/ActiveElections"
import UpcomingElections from "./components/UpcomingElections"
import VotingHistory from "./components/VotingHistory"

export default function UserDashboard() {
  const router = useRouter()
  const { 
    account, 
    isAdmin, 
    isRegistered,
    isLoading,
    getElections,
    hasUserVoted,
    getElectionDetails
  } = useContractInteraction()
  
  const [activeElections, setActiveElections] = useState([])
  const [upcomingElections, setUpcomingElections] = useState([])
  const [completedElections, setCompletedElections] = useState([])
  const [votingHistory, setVotingHistory] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (isLoading) return;

    if (!account || !isRegistered) {
      router.replace("/")
      return
    }

    if (isAdmin) {
      router.replace("/dashboard/admin")
      return
    }

    const loadUserData = async () => {
      try {
        setIsLoadingData(true)
        const electionsResult = await getElections(0, 50)
        
        if (!electionsResult.success) {
          console.error("Failed to fetch elections:", electionsResult.error)
          return
        }

        const elections = electionsResult.elections
        const active = []
        const upcoming = []
        const completed = []
        const history = []
        const now = Math.floor(Date.now() / 1000)

        for (const election of elections) {
          // Get full election details to access start and end times
          const detailsResult = await getElectionDetails(election.id)
          if (!detailsResult.success || !detailsResult.election) continue
          
          const fullElection = detailsResult.election
          const startTime = parseInt(fullElection.startTime)
          const endTime = parseInt(fullElection.endTime)
          
          // Check if user has voted in this election
          const votedResult = await hasUserVoted(election.id)
          const hasVoted = votedResult.success && votedResult.hasVoted
          
          const electionWithDetails = {
            ...election,
            startTime,
            endTime,
            hasVoted
          }
          
          // Categorize election
          if (now < startTime) {
            upcoming.push(electionWithDetails)
          } else if (now >= startTime && now <= endTime) {
            active.push(electionWithDetails)
          } else {
            completed.push(electionWithDetails)
          }
          
          if (hasVoted) {
            history.push(electionWithDetails)
          }
        }

        setActiveElections(active)
        setUpcomingElections(upcoming)
        setCompletedElections(completed)
        setVotingHistory(history)
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadUserData()
  }, [account, isAdmin, isRegistered, isLoading, router, getElections, hasUserVoted, getElectionDetails])

  return (
    <Layout account={account}>
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">Voter Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">View and participate in elections</p>
        </div>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            <StatCards 
              activeCount={activeElections.length} 
              upcomingCount={upcomingElections.length} 
              completedCount={completedElections.length} 
              votedCount={votingHistory.length} 
            />
            
            <QuickActions router={router} />
            
            <ActiveElections elections={activeElections} router={router} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <UpcomingElections elections={upcomingElections} router={router} />
              <VotingHistory elections={votingHistory} router={router} />
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}