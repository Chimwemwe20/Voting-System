import { Vote, Clock, CheckCircle, CalendarDays } from "lucide-react"

export default function StatCards({ activeCount, upcomingCount, completedCount, votedCount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Active Elections */}
      <div className="bg-white shadow-sm rounded-lg p-5 border border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-500">Active Elections</h2>
          <span className="flex items-center justify-center p-2 bg-green-100 rounded-lg">
            <Vote className="h-5 w-5 text-green-600" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold text-gray-900">{activeCount}</p>
          <p className="ml-2 text-sm text-gray-500">Currently running</p>
        </div>
      </div>

      {/* Upcoming Elections */}
      <div className="bg-white shadow-sm rounded-lg p-5 border border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-500">Upcoming Elections</h2>
          <span className="flex items-center justify-center p-2 bg-blue-100 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold text-gray-900">{upcomingCount}</p>
          <p className="ml-2 text-sm text-gray-500">Scheduled</p>
        </div>
      </div>

      {/* Completed Elections */}
      <div className="bg-white shadow-sm rounded-lg p-5 border border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-500">Completed Elections</h2>
          <span className="flex items-center justify-center p-2 bg-gray-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-gray-600" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold text-gray-900">{completedCount}</p>
          <p className="ml-2 text-sm text-gray-500">Finished</p>
        </div>
      </div>

      {/* Your Votes */}
      <div className="bg-white shadow-sm rounded-lg p-5 border border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-500">Your Votes</h2>
          <span className="flex items-center justify-center p-2 bg-purple-100 rounded-lg">
            <CalendarDays className="h-5 w-5 text-purple-600" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold text-gray-900">{votedCount}</p>
          <p className="ml-2 text-sm text-gray-500">Votes cast</p>
        </div>
      </div>
    </div>
  )
}