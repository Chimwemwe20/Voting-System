"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Info, Award, BarChart3 } from "lucide-react"
import useContractInteraction from "@/lib/useContractInteraction"
import Layout from "../components/Layout"

export default function ResultsPage() {
  const router = useRouter()
  const { 
    account, 
    isRegistered,
    isLoading,
    getElections,
    getElectionDetails,
    getAllCandidatesForElection,
    getAllCandidateVotesForElection,
    getElectionResults,
    getCandidateVotes  
  } = useContractInteraction()
  
  const [completedElections, setCompletedElections] = useState([])
  const [electionResults, setElectionResults] = useState({})
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [expandedElection, setExpandedElection] = useState(null)

  useEffect(() => {
    if (isLoading) return;

    if (!account || !isRegistered) {
      router.replace("/connect")
      return
    }

    const loadResultsData = async () => {
      try {
        setIsLoadingData(true)
        const electionsResult = await getElections(0, 50)
        
        if (!electionsResult.success) {
          console.error("Failed to fetch elections:", electionsResult.error)
          return
        }

        const elections = electionsResult.elections
        const completed = []
        const resultsData = {}
        const now = Math.floor(Date.now() / 1000)

        for (const election of elections) {
          // Get full election details to access start and end times
          const detailsResult = await getElectionDetails(election.id)
          if (!detailsResult.success || !detailsResult.election) continue
          
          const fullElection = detailsResult.election
          const startTime = parseInt(fullElection.startTime)
          const endTime = parseInt(fullElection.endTime)
          
          // Only process completed elections
          if (now > endTime) {
            const electionWithDetails = {
              ...election,
              startTime,
              endTime
            }
            
            completed.push(electionWithDetails)
            
            // Fetch results data for each completed election
            const resultsResult = await getElectionResults(election.id)
            const totalVotes = resultsResult.success ? resultsResult.totalVotes : 0
            
            const candidatesResult = await getAllCandidatesForElection(election.id)
            const candidates = candidatesResult.success ? candidatesResult.candidates : []
            
            // Use direct candidate vote fetching for each candidate
            const candidateResults = []
            for (const candidate of candidates) {
              const voteResult = await getCandidateVotes(election.id, candidate.id)
              const votes = voteResult.success ? voteResult.votes : 0
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
              
              candidateResults.push({
                id: candidate.id,
                name: candidate.name,
                votes,
                percentage
              })
            }
            
            // Sort by vote count in descending order
            candidateResults.sort((a, b) => b.votes - a.votes)
            
            // Determine the winner
            let winnerName = "No votes cast"
            let winnerVotes = 0
            let winnerPercentage = 0
            
            if (totalVotes > 0 && candidateResults.length > 0 && candidateResults[0].votes > 0) {
              winnerName = candidateResults[0].name
              winnerVotes = candidateResults[0].votes
              winnerPercentage = candidateResults[0].percentage
            }
            
            resultsData[election.id] = {
              totalVotes,
              winner: {
                name: winnerName,
                votes: winnerVotes,
                percentage: winnerPercentage
              },
              candidates: candidateResults
            }
          }
        }

        setCompletedElections(completed.sort((a, b) => b.endTime - a.endTime))
        setElectionResults(resultsData)
      } catch (error) {
        console.error("Error loading results data:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadResultsData()
  }, [account, isRegistered, isLoading, router, getElections, getElectionDetails, getAllCandidatesForElection, getCandidateVotes, getElectionResults])

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const toggleElection = (electionId) => {
    setExpandedElection(expandedElection === electionId ? null : electionId)
  }

  return (
    <Layout account={account}>
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">Election Results</h1>
          <p className="text-sm text-gray-500 mt-1">View results from past elections</p>
        </div>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : completedElections.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <Info className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Completed Elections</h3>
            <p className="text-gray-500">Results will appear here once elections have ended.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {completedElections.map(election => (
              <div key={election.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div 
                  className="p-6 cursor-pointer" 
                  onClick={() => toggleElection(election.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{election.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Ended on {formatDate(election.endTime)}
                      </p>
                    </div>
                    {electionResults[election.id] && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                          {electionResults[election.id].totalVotes} votes cast
                        </span>
                        {expandedElection === election.id ? (
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {electionResults[election.id] && (
                    <div className="mt-4">
                      <div className="flex items-center text-green-600">
                        <Award className="h-5 w-5 mr-2" />
                        <span className="font-medium">
                          Winner: {electionResults[election.id].winner.name}
                          {electionResults[election.id].winner.votes > 0 && (
                            <span className="ml-2 text-sm text-gray-500">
                              ({electionResults[election.id].winner.votes} votes · {electionResults[election.id].winner.percentage.toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {expandedElection === election.id && electionResults[election.id] && (
                  <div className="border-t border-gray-200 p-6">
                    <h4 className="flex items-center text-sm font-medium text-gray-500 mb-4">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Detailed Results
                    </h4>
                    
                    <div className="space-y-4">
                      {electionResults[election.id].candidates.map(candidate => (
                        <div key={candidate.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">{candidate.name}</span>
                            <span className="text-sm text-gray-500">
                              {candidate.votes} votes ({candidate.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${candidate.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}