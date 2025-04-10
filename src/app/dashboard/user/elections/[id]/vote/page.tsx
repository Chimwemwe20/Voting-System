"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2, AlertCircle, Check, ArrowLeft, MapPin } from "lucide-react"
import useContractInteraction from "@/lib/useContractInteraction"
import Layout from "../../../components/Layout"
import { formatDate } from "../../../utils/formatDate"

export default function VotePage() {
  const router = useRouter()
  const params = useParams()
  const electionId = params.id
  
  const { 
    account, 
    isRegistered,
    isLoading,
    getElectionDetails,
    getAllCandidatesForElection,
    hasUserVoted,
    castVote,
    getElectionLocations,
    isElectionActive,
  } = useContractInteraction()
  
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState("")
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [userHasVoted, setUserHasVoted] = useState(false)
  const [isActive, setIsActive] = useState(false)
  
  useEffect(() => {
    if (isLoading) return

    if (!account || !isRegistered) {
      router.replace("/connect")
      return
    }
    
    const loadElectionData = async () => {
      setIsLoadingData(true)
      setError("")
      
      try {
        // Check if election is active
        const activeResult = await isElectionActive(electionId)
        if (!activeResult.success) {
          setError("Failed to check if election is active")
          setIsLoadingData(false)
          return
        }
        
        setIsActive(activeResult.isActive)
        
        if (!activeResult.isActive) {
          setError("This election is not currently active")
          setIsLoadingData(false)
          return
        }
        
        // Check if user has already voted
        const votedResult = await hasUserVoted(electionId)
        if (!votedResult.success) {
          setError("Failed to check if you've already voted")
          setIsLoadingData(false)
          return
        }
        
        setUserHasVoted(votedResult.hasVoted)
        
        if (votedResult.hasVoted) {
          setError("You have already voted in this election")
          setIsLoadingData(false)
          return
        }
        
        // Get election details
        const detailsResult = await getElectionDetails(electionId)
        if (!detailsResult.success || !detailsResult.election) {
          setError("Failed to load election details")
          setIsLoadingData(false)
          return
        }
        
        setElection(detailsResult.election)
        
        // Get candidates
        const candidatesResult = await getAllCandidatesForElection(electionId)
        if (!candidatesResult.success) {
          setError("Failed to load candidates")
          setIsLoadingData(false)
          return
        }
        
        setCandidates(candidatesResult.candidates)
        
        // Get locations
        const locationsResult = await getElectionLocations(electionId)
        if (!locationsResult.success) {
          setError("Failed to load voting locations")
          setIsLoadingData(false)
          return
        }
        
        setLocations(locationsResult.locations)
        if (locationsResult.locations.length > 0) {
          setSelectedLocation(locationsResult.locations[0])
        }
      } catch (error) {
        console.error("Error loading election data:", error)
        setError("An unexpected error occurred while loading election data")
      } finally {
        setIsLoadingData(false)
      }
    }
    
    loadElectionData()
  }, [account, isRegistered, isLoading, electionId, router, getElectionDetails, getAllCandidatesForElection, hasUserVoted, getElectionLocations, isElectionActive])
  
  const handleVote = async () => {
    if (!selectedCandidate) {
      setError("Please select a candidate")
      return
    }
    
    if (!selectedLocation && locations.length > 0) {
      setError("Please select a voting location")
      return
    }
    
    setIsVoting(true)
    setError("")
    
    try {
      const result = await castVote(electionId, selectedCandidate.id, selectedLocation)
      
      if (result) {
        setSuccess(true)
        // Wait 2 seconds then redirect to the election details page
        setTimeout(() => {
          router.push(`/dashboard/user/elections/${electionId}`)
        }, 2000)
      } else {
        setError("Failed to cast your vote. Please try again.")
      }
    } catch (error) {
      console.error("Error casting vote:", error)
      setError("An unexpected error occurred while casting your vote")
    } finally {
      setIsVoting(false)
    }
  }
  
  return (
    <Layout account={account}>
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push(`/dashboard/user/elections/${electionId}`)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Election Details
        </button>
        
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">Cast Your Vote</h1>
          <p className="text-sm text-gray-500 mt-1">
            {election ? election.name : "Loading election..."}
          </p>
        </div>
        
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : error && (userHasVoted || !isActive) ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">{error}</h3>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => router.push(`/dashboard/user/elections/${electionId}`)}
                >
                  Return to Election Details
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {success ? (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mt-3 text-lg font-medium text-gray-900">Vote Cast Successfully!</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Thank you for participating in this election.
                  </p>
                  <p className="text-sm text-gray-500">
                    Redirecting you back to election details...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Election Info */}
                <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Election Information</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about the election you're voting in.</p>
                </div>
                <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Election Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{election?.name}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{election?.electionType}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Voting Period</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {election ? `${formatDate(election.startTime)} - ${formatDate(election.endTime)}` : "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                {/* Location Selection */}
                {locations.length > 0 && (
                  <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Voting Location</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Select your voting location.</p>
                    
                    <div className="mt-4">
                      <select
                        id="location"
                        name="location"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                      >
                        {locations.map((location, index) => (
                          <option key={index} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                
                {/* Candidate Selection */}
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Select a Candidate</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Choose one candidate to cast your vote.
                  </p>
                  
                  {error && !userHasVoted && isActive && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 space-y-4">
                    {candidates.length > 0 ? (
                      candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className={`border rounded-lg p-4 cursor-pointer ${
                            selectedCandidate && selectedCandidate.id === candidate.id
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{candidate.name}</h4>
                              <p className="text-sm text-gray-500">Candidate ID: {candidate.id}</p>
                            </div>
                            
                            {selectedCandidate && selectedCandidate.id === candidate.id && (
                              <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-green-600" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No candidates available for this election.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleVote}
                    disabled={isVoting || !selectedCandidate || candidates.length === 0}
                  >
                    {isVoting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Casting Vote...
                      </>
                    ) : (
                      "Cast Vote"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}