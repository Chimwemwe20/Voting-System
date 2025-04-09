import { Vote, Clock, CalendarDays } from "lucide-react"

export default function QuickActions({ router }) {
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <p className="text-sm text-gray-500">Common voter tasks</p>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button 
          onClick={() => router.push('/dashboard/user/elections')}
          className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150"
        >
          <Vote className="mr-2 h-5 w-5" />
          View Active Elections
        </button>
        <button 
          onClick={() => router.push('/dashboard/user/elections/upcoming')}
          className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-150"
        >
          <Clock className="mr-2 h-5 w-5" />
          View Upcoming Elections
        </button>
        <button 
          onClick={() => router.push('/dashboard/user/elections/results')}
          className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-150"
        >
          <CalendarDays className="mr-2 h-5 w-5" />
          View Election Results
        </button>
      </div>
    </div>
  )
}