import { Vote, Clock, CheckCircle } from "lucide-react"
import { formatDate } from "../utils/formatDate"

export default function ActiveElections({ elections, router }) {
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Active Elections</h2>
          <p className="text-sm text-gray-500">Elections you can vote in now</p>
        </div>
        <span className="flex items-center justify-center p-2 bg-green-100 rounded-full">
          <Vote className="h-5 w-5 text-green-600" />
        </span>
      </div>
      <div className="p-6">
        {elections.length > 0 ? (
          <div className="space-y-4">
            {elections.map((election) => (
              <div key={election.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="mb-3 sm:mb-0">
                    <h3 className="font-medium text-lg text-gray-900">{election.name}</h3>
                    <p className="text-sm text-gray-500">{election.electionType}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Ends: {formatDate(election.endTime)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {election.hasVoted ? (
                      <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        <CheckCircle className="h-4 w-4 mr-1" /> Voted
                      </span>
                    ) : (
                      <button
                        onClick={() => router.push(`/dashboard/user/elections`)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm transition duration-150"
                      >
                        Vote Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-3">
              <Vote className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No active elections available right now.</p>
          </div>
        )}
      </div>
    </div>
  )
}