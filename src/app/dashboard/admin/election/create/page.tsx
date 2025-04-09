"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useContractInteraction from "@/lib/useContractInteraction"

export default function CreateElectionPage() {
  const router = useRouter()
  const { createElection, isAdmin, isLoading } = useContractInteraction()

  const [formData, setFormData] = useState({
    name: "",
    electionType: "General",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  })

  // Separate state for locations and candidates for better management
  const [locations, setLocations] = useState([])
  const [newLocation, setNewLocation] = useState("")
  
  const [candidates, setCandidates] = useState([])
  const [newCandidate, setNewCandidate] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addLocation = () => {
    if (newLocation.trim() === "") return
    setLocations([...locations, newLocation.trim()])
    setNewLocation("")
  }

  const removeLocation = (index) => {
    const updatedLocations = [...locations]
    updatedLocations.splice(index, 1)
    setLocations(updatedLocations)
  }

  const addCandidate = () => {
    if (newCandidate.trim() === "") return
    setCandidates([...candidates, newCandidate.trim()])
    setNewCandidate("")
  }

  const removeCandidate = (index) => {
    const updatedCandidates = [...candidates]
    updatedCandidates.splice(index, 1)
    setCandidates(updatedCandidates)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create new election
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

      // Convert to Unix timestamp (seconds)
      const startTimestamp = Math.floor(startDateTime.getTime() / 1000)
      const endTimestamp = Math.floor(endDateTime.getTime() / 1000)

      if (locations.length === 0) {
        setError("At least one location is required")
        setLoading(false)
        return
      }

      const result = await createElection(
        formData.name,
        formData.electionType,
        startTimestamp,
        endTimestamp,
        locations,
        candidates,
      )

      if (result.success) {
        setSuccess("Election created successfully!")
        setTimeout(() => {
          router.push(`/dashboard/admin/election/${result.electionId}`)
        }, 2000)
      } else {
        setError(result.error || "Failed to create election")
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("An error occurred while processing your request")
    } finally {
      setLoading(false)
    }
  }

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
        <div>
          <Link
            href="/dashboard/admin/election"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Elections
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">Create New Election</h1>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Election Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="electionType" className="block text-sm font-medium text-gray-700">
                Election Type
              </label>
              <select
                id="electionType"
                name="electionType"
                value={formData.electionType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="General">General</option>
                <option value="Primary">Primary</option>
                <option value="Special">Special</option>
                <option value="Local">Local</option>
                <option value="Presidential">Presidential</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  id="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  id="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Updated Locations Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Locations
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Add a location"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={addLocation}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add
                </button>
              </div>
              {locations.length > 0 ? (
                <div className="mt-2 bg-gray-50 p-4 rounded-md max-h-40 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {locations.map((location, index) => (
                      <li key={index} className="py-2 flex justify-between items-center">
                        <span className="text-sm text-gray-700">{location}</span>
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No locations added yet. At least one location is required.</p>
              )}
            </div>

            {/* Updated Candidates Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Candidates 
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newCandidate}
                  onChange={(e) => setNewCandidate(e.target.value)}
                  placeholder="Add a candidate"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={addCandidate}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Add
                </button>
              </div>
              {candidates.length > 0 ? (
                <div className="mt-2 bg-gray-50 p-4 rounded-md max-h-40 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {candidates.map((candidate, index) => (
                      <li key={index} className="py-2 flex justify-between items-center">
                        <span className="text-sm text-gray-700">{candidate}</span>
                        <button
                          type="button"
                          onClick={() => removeCandidate(index)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No candidates added yet. Kindly add at least two candidates for the election.</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                href="/dashboard/admin/election"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Election"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}