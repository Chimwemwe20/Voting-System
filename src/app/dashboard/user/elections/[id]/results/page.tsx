"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2, BarChart2, Users, MapPin, ArrowLeft, Calendar, AlertCircle, Award, Users2 } from "lucide-react"
import useContractInteraction from "@/lib/useContractInteraction"
import Layout from "@/app/dashboard/user/components/Layout"

export default function UserElectionResultsPage({ params }: { params: { id: string } }) {
  const electionId = params.id
  const { 
    account,
    getElectionDetails, 
    getAllCandidateVotesForElection, 
    getAllLocationVotesForElection, 
    isLoading,
    hasUserVoted
  } = useContractInteraction()

  const [election, setElection] = useState(null)
  const [candidateVotes, setCandidateVotes] = useState([])
  const [locationVotes, setLocationVotes] = useState([])
  const [winners, setWinners] = useState([])
  const [userHasVoted, setUserHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchElectionResults = async () => {
      if (!electionId) {
        setError("Election ID is required")
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Fetch election details
        const electionResult = await getElectionDetails(electionId)
        if (!electionResult.success || !electionResult.election) {
          setError("Failed to fetch election details")
          setLoading(false)
          return
        }
        setElection(electionResult.election)

        // Check if user has voted in this election
        const votedResult = await hasUserVoted(electionId)
        if (votedResult.success) {
          setUserHasVoted(votedResult.hasVoted)
        }

        // Only fetch detailed results if the election has ended
        const now = Date.now()
        const isEnded = now > Number.parseInt(electionResult.election.endTime) * 1000
        
        if (isEnded) {
          // Fetch candidate votes
          const candidateVotesResult = await getAllCandidateVotesForElection(electionId)
          if (candidateVotesResult.success) {
            // Sort candidates by votes (descending)
            const sortedCandidates = [...candidateVotesResult.candidateVotes].sort(
              (a, b) => Number.parseInt(b.votes) - Number.parseInt(a.votes)
            )
            setCandidateVotes(sortedCandidates)
            
            // Determine winner(s) - handling ties
            if (sortedCandidates.length > 0) {
              const highestVotes = Number.parseInt(sortedCandidates[0].votes)
              const winningCandidates = sortedCandidates.filter(candidate => 
                Number.parseInt(candidate.votes) === highestVotes
              )
              setWinners(winningCandidates)
            }
          }

          // Fetch location votes
          const locationVotesResult = await getAllLocationVotesForElection(electionId)
          if (locationVotesResult.success) {
            // Sort locations by votes (descending)
            const sortedLocations = [...locationVotesResult.locationVotes].sort(
              (a, b) => Number.parseInt(b.votes) - Number.parseInt(a.votes)
            )
            setLocationVotes(sortedLocations)
          }
        }
      } catch (err) {
        console.error("Error fetching election results:", err)
        setError("An error occurred while fetching election results")
      } finally {
        setLoading(false)
      }
    }

    if (!isLoading) {
      fetchElectionResults()
    }
  }, [electionId, getElectionDetails, getAllCandidateVotesForElection, getAllLocationVotesForElection, hasUserVoted, isLoading])

  // Content to be rendered inside the Layout component
  const renderContent = () => {
    if (isLoading || loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading election results...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-sm text-red-700 mt-2">
                <Link href="/dashboard/user/elections" className="font-medium underline">
                  Return to elections list
                </Link>
              </p>
            </div>
          </div>
        </div>
      )
    }

    if (!election) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Election not found. The election may have been deleted or you may have entered an invalid ID.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                <Link href="/dashboard/user/elections" className="font-medium underline">
                  Return to elections list
                </Link>
              </p>
            </div>
          </div>
        </div>
      )
    }

    const formatDate = (timestamp) => {
      return new Date(Number.parseInt(timestamp) * 1000).toLocaleString()
    }

    const getElectionStatus = () => {
      const now = Date.now()
      if (now > Number.parseInt(election.endTime) * 1000) {
        return { text: "Ended", className: "bg-gray-100 text-gray-800", isCompleted: true }
      } else if (now > Number.parseInt(election.startTime) * 1000) {
        return { text: "Active", className: "bg-green-100 text-green-800", isCompleted: false }
      } else {
        return { text: "Upcoming", className: "bg-yellow-100 text-yellow-800", isCompleted: false }
      }
    }

    const status = getElectionStatus()
    const totalVotes = Number.parseInt(election.totalVotes)
    const isElectionCompleted = status.isCompleted
    const hasTie = winners.length > 1

    // Determine winner display message
    const getWinnerDisplay = () => {
      if (winners.length === 0 || totalVotes === 0) {
        return null;
      }
      if (winners.length === 1) {
        return (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 my-4">
            <div className="flex">
              <Award className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-lg font-medium text-green-800">
                  Winner: {winners[0].name} with {winners[0].votes} votes
                </p>
              </div>
            </div>
          </div>
        );
      } else {
        // Handle tie case
        return (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
            <div className="flex">
              <Users2 className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-lg font-medium text-yellow-800">
                  There was a tie amongst {winners.length} candidates with {winners[0].votes} votes each:
                </p>
                <ul className="list-disc ml-5 mt-2">
                  {winners.map(winner => (
                    <li key={winner.id} className="text-sm text-yellow-700">{winner.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Link
              href={`/dashboard/user/elections`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Elections
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 mt-2">Results: {election.name}</h1>
          </div>
          <div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.className}`}>{status.text}</span>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">Election Summary</h2>
              <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{election.electionType}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Duration</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(election.startTime)} - {formatDate(election.endTime)}
                  </dd>
                </div>
                {isElectionCompleted && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Total Votes</dt>
                    <dd className="mt-1 text-sm text-gray-900">{election.totalVotes}</dd>
                  </div>
                )}
                {userHasVoted && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Your Vote</dt>
                    <dd className="mt-1 text-sm text-green-600">You have voted in this election</dd>
                  </div>
                )}
              </dl>
            </div>

            {!isElectionCompleted ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Results are only available after the election has ended.
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      This election will end on {formatDate(election.endTime)}.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Display winner section */}
                {totalVotes > 0 && getWinnerDisplay()}
                
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center mb-4">
                    <BarChart2 className="h-5 w-5 text-gray-500 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">Candidate Results</h2>
                  </div>

                  {candidateVotes.length > 0 ? (
                    <div className="space-y-4">
                      {candidateVotes.map((candidate, index) => {
                        const percentage = totalVotes > 0 ? (Number.parseInt(candidate.votes) / totalVotes) * 100 : 0
                        const isWinner = winners.some(winner => winner.id === candidate.id);

                        return (
                          <div 
                            key={candidate.id} 
                            className={`${isWinner ? "bg-green-50" : "bg-gray-50"} p-4 rounded-lg`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <span
                                  className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${
                                    isWinner ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {index + 1}
                                </span>
                                <span className="ml-3 text-sm font-medium text-gray-900">
                                  {candidate.name}
                                  {isWinner && hasTie && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Tied for 1st
                                    </span>
                                  )}
                                  {isWinner && !hasTie && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      Winner
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {candidate.votes} votes ({percentage.toFixed(2)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`${isWinner ? "bg-green-600" : "bg-blue-600"} h-2.5 rounded-full`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No votes have been cast in this election.</p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex items-center mb-4">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">Location Results</h2>
                  </div>

                  {locationVotes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {locationVotes.map((location) => {
                        const percentage = totalVotes > 0 ? (Number.parseInt(location.votes) / totalVotes) * 100 : 0

                        return (
                          <div key={location.location} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-900">{location.location}</span>
                              <span className="text-sm text-gray-500">{location.votes} votes</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <div className="mt-1 text-xs text-right text-gray-500">{percentage.toFixed(2)}%</div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No location data available.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Wrapping the content in the Layout component
  return <Layout account={account}>{renderContent()}</Layout>
}