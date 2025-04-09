"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import useContractInteraction from "@/lib/useContractInteraction"

export default function ElectionDetailsPage({ params }: { params: { id: string } }) {
  const electionId = params.id

  const { getElectionDetails, getAllCandidatesForElection, getElectionLocations, isAdmin, isLoading } =
    useContractInteraction()

  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    const fetchElectionData = async () => {
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

        // Fetch candidates
        const candidatesResult = await getAllCandidatesForElection(electionId)
        if (candidatesResult.success) {
          setCandidates(candidatesResult.candidates)
        }

        // Fetch locations
        const locationsResult = await getElectionLocations(electionId)
        if (locationsResult.success) {
          setLocations(locationsResult.locations)
        }
      } catch (err) {
        console.error("Error fetching election data:", err)
        setError("An error occurred while fetching election data")
      } finally {
        setLoading(false)
      }
    }

    if (!isLoading) {
      fetchElectionData()
    }
  }, [electionId, getElectionDetails, getAllCandidatesForElection, getElectionLocations, isLoading])

  if (isLoading || loading) {
    return <div className="text-center py-10">Loading...</div>
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

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!election) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Election not found. The election may have been deleted or you may have entered an invalid ID.
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              <Link href="/dashboard/admin/election" className="font-medium underline">
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
      return { text: "Ended", className: "bg-gray-100 text-gray-800" }
    } else if (now > Number.parseInt(election.startTime) * 1000) {
      return { text: "Active", className: "bg-green-100 text-green-800" }
    } else {
      return { text: "Upcoming", className: "bg-yellow-100 text-yellow-800" }
    }
  }

  const status = getElectionStatus()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/dashboard/admin/election"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Elections
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">{election.name}</h1>
        </div>
        <div className="flex space-x-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.className}`}>{status.text}</span>
          <Link
            href={`/dashboard/admin/election/${electionId}/results`}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            View Results
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("details")}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === "details"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("candidates")}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === "candidates"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Candidates
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === "locations"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Locations
            </button>
          </nav>
        </div>

        {activeTab === "details" && (
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Election ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{election.id}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{election.electionType}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Start Time</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(election.startTime)}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">End Time</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(election.endTime)}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Total Votes</dt>
                <dd className="mt-1 text-sm text-gray-900">{election.totalVotes}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Candidates Count</dt>
                <dd className="mt-1 text-sm text-gray-900">{election.candidatesCount}</dd>
              </div>
            </dl>
          </div>
        )}

        {activeTab === "candidates" && (
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Candidates</h3>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Add Candidate
              </button>
            </div>
            {candidates.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {candidates.map((candidate) => (
                  <li key={candidate.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                          <p className="text-sm text-gray-500">ID: {candidate.id}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No candidates found for this election.</p>
            )}
          </div>
        )}

        {activeTab === "locations" && (
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Locations</h3>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Add Location
              </button>
            </div>
            {locations.length > 0 ? (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {locations.map((location, index) => (
                  <li key={index} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900">{location}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No locations found for this election.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
