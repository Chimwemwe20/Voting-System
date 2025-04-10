"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import useContractInteraction from "@/lib/useContractInteraction"

export default function ElectionAdminPage() {
  const { getElections, isAdmin, isLoading } = useContractInteraction()
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const result = await getElections(0, 100)
        if (result.success) {
          setElections(result.elections)
        } else {
          setError("Failed to fetch elections")
        }
      } catch (err) {
        setError("An error occurred while fetching elections")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (!isLoading) {
      fetchElections()
    }
  }, [getElections, isLoading])

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Elections Management</h1>
        <Link
          href="/dashboard/admin/election/ElectionForm"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Create New Election
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading elections...</div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {elections.length > 0 ? (
              elections.map((election) => (
                <li key={election.id}>
                  <Link href={`/dashboard/admin/election/${election.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-green-600 truncate">{election.name}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              Date.now() > election.endTime * 1000
                                ? "bg-gray-100 text-gray-800"
                                : Date.now() > election.startTime * 1000
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {Date.now() > election.endTime * 1000
                              ? "Ended"
                              : Date.now() > election.startTime * 1000
                                ? "Active"
                                : "Upcoming"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">Type: {election.electionType}</p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Candidates: {election.candidatesCount}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>Votes: {election.totalVotes}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-5 sm:px-6">
                <div className="text-center text-gray-500">No elections found. Create your first election.</div>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
