"use client"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useContractInteraction from "@/lib/useContractInteraction"
import { BarChart, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Election {
  id: string
  name: string
}

interface Candidate {
  id: string
  name: string
  votes: number
}

export default function ResultsPage() {
  const router = useRouter()
  const { 
    account, 
    isAdmin, 
    isLoading, 
    getElections, 
    getCandidateDetails, 
    getCandidatesCount,
    getCandidateVotes 
  } = useContractInteraction()
  
  const [elections, setElections] = useState<Election[]>([])
  const [selectedElection, setSelectedElection] = useState<string>("")
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (isLoading) return
    
    if (!account || !isAdmin) {
      router.replace("/dashboard/user")
      return
    }

    const loadElections = async () => {
      try {
        const electionsList = await getElections(0, 100)
        setElections(electionsList)
        setIsLoadingData(false)
      } catch (error) {
        console.error("Error loading elections:", error)
        setIsLoadingData(false)
      }
    }

    loadElections()
  }, [account, isAdmin, isLoading, router, getElections])

  useEffect(() => {
    const loadResults = async () => {
      if (!selectedElection) return

      try {
        setIsLoadingData(true)
        const count = await getCandidatesCount(selectedElection)
        const candidatesData = []
        
        for (let i = 0; i < count; i++) {
          const candidate = await getCandidateDetails(selectedElection, i)
          if (candidate && candidate.exists) {
            const votesResult = await getCandidateVotes(selectedElection, i)
            candidatesData.push({
              ...candidate,
              votes: parseInt(votesResult.votes || "0")
            })
          }
        }
        
        setCandidates(candidatesData.sort((a, b) => b.votes - a.votes))
      } catch (error) {
        console.error("Error loading results:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadResults()
  }, [selectedElection, getCandidatesCount, getCandidateDetails, getCandidateVotes])

  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0)

  return (
    <div className="flex min-h-screen flex-col">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} showMenuButton={true} />

      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 bg-green-50 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-green-900">Election Results</h1>
            <p className="text-gray-600">View detailed results for each election</p>
          </div>

          <div className="mb-6">
            <Select value={selectedElection} onValueChange={setSelectedElection}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select an election" />
              </SelectTrigger>
              <SelectContent>
                {elections.map((election) => (
                  <SelectItem key={election.id} value={election.id}>
                    {election.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedElection && !isLoadingData && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-green-600" />
                  Total Votes: {totalVotes}
                </CardTitle>
              </CardHeader>
            </Card>
          )}

          {isLoadingData ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    <div className="mt-4 h-3 w-1/2 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {candidates.map((candidate) => (
                <Card key={candidate.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-green-600" />
                      {candidate.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-green-700">{candidate.votes} votes</p>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600" 
                          style={{ 
                            width: `${totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        {totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0}% of total votes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}