"use client"

import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import useContractInteraction from "@/lib/useContractInteraction"
import { CalendarDays, Loader2, Vote } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function UserDashboard() {
  const router = useRouter()
  const { 
    account, 
    isAdmin, 
    isRegistered,
    isLoading,
    getElections,
    hasUserVoted,
    isElectionActive
  } = useContractInteraction()
  
  const [activeElections, setActiveElections] = useState<any[]>([])
  const [votingHistory, setVotingHistory] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (isLoading) return;

    if (!account || !isRegistered) {
      router.replace("/connect")
      return
    }

    if (isAdmin) {
      router.replace("/dashboard/admin")
      return
    }

    const loadUserData = async () => {
      try {
        setIsLoadingData(true)
        const elections = await getElections(0, 10)
        const active = []
        const history = []

        for (const election of elections) {
          const activeStatus = await isElectionActive(election.id)
          const votedStatus = await hasUserVoted(election.id)

          if (activeStatus) {
            active.push(election)
          }
          if (votedStatus) {
            history.push(election)
          }
        }

        setActiveElections(active)
        setVotingHistory(history)
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadUserData()
  }, [account, isAdmin, isRegistered, isLoading, router, getElections, hasUserVoted, isElectionActive])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-green-50 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-900">Voter Dashboard</h1>
          <p className="text-gray-600">View and participate in elections</p>
        </div>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Your voter information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Wallet Address</p>
                    <p className="text-sm font-mono">{account}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm text-green-600">Registered Voter</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Active Elections</CardTitle>
                  <CardDescription>Elections you can vote in</CardDescription>
                </div>
                <Vote className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                {activeElections.length > 0 ? (
                  <div className="space-y-4">
                    {activeElections.map((election) => (
                      <div key={election.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{election.name}</p>
                          <p className="text-sm text-gray-500">{election.electionType}</p>
                        </div>
                        <Button
                          onClick={() => router.push(`/elections/${election.id}`)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Vote Now
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No active elections available.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Voting History</CardTitle>
                  <CardDescription>Your past votes</CardDescription>
                </div>
                <CalendarDays className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                {votingHistory.length > 0 ? (
                  <div className="space-y-4">
                    {votingHistory.map((election) => (
                      <div key={election.id}>
                        <p className="font-medium">{election.name}</p>
                        <p className="text-sm text-gray-500">
                          Voted on {new Date(election.voteDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">You haven't voted in any elections yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}