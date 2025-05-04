import { Clock } from "lucide-react"
import { formatDate } from "../utils/formatDate"

export default function UpcomingElections({ elections, router }) {
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Upcoming Elections</h2>
          <p className="text-sm text-gray-500">Elections starting soon</p>
        </div>
        <span className="flex items-center justify-center p-2 bg-blue-100 rounded-full">
          <Clock className="h-5 w-5 text-blue-600" />
        </span>
      </div>
      <div className="p-6">
        {elections.length > 0 ? (
          <div className="space-y-4">
            {elections.map((election) => (
              <div key={election.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-900">{election.name}</h3>
                <p className="text-sm text-gray-500">{election.electionType}</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Starts: {formatDate(election.startTime)}</span>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/user/elections`)}
                  className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 transition duration-150"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-3">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No upcoming elections scheduled.</p>
          </div>
        )}
      </div>
    </div>
  )
}