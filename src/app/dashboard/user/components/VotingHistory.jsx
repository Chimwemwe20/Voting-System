import { CalendarDays, CheckCircle } from "lucide-react"
import { formatDate } from "../utils/formatDate"

export default function VotingHistory({ elections, router }) {
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Voting History</h2>
          <p className="text-sm text-gray-500">Your past votes</p>
        </div>
        <span className="flex items-center justify-center p-2 bg-purple-100 rounded-full">
          <CalendarDays className="h-5 w-5 text-purple-600" />
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
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>Voted on: {formatDate(election.endTime)}</span>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/user/elections/${election.id}/results`)}
                  className="mt-3 text-sm text-green-600 hover:text-green-800"
                >
                  View Results
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-3">
              <CalendarDays className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">You haven't voted in any elections yet.</p>
            <p className="text-sm text-gray-400 mt-1">Active elections will appear here after you vote.</p>
          </div>
        )}
      </div>
    </div>
  )
}