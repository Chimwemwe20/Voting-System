"use client"

import { useState } from "react"
import { Home, Vote, User, CalendarDays, Settings, LogOut } from "lucide-react"

export default function Layout({ account, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-gray-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-green-600">SecureVote</h1>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              <a href="/dashboard/user" className="bg-green-50 text-green-700 group flex items-center px-2 py-3 text-sm font-medium rounded-md">
                <Home className="mr-3 h-5 w-5 text-green-500" />
                Dashboard
              </a>
              <a href="/dashboard/user/elections" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-3 text-sm font-medium rounded-md">
                <Vote className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Elections
              </a>
              {/* <a href="/dashboard/user/candidates" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-3 text-sm font-medium rounded-md">
                <User className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Candidates
              </a> */}
              <a href="/dashboard/user/results" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-3 text-sm font-medium rounded-md">
                <CalendarDays className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Results
              </a>
              {/* <a href="/dashboard/user/settings" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-3 text-sm font-medium rounded-md">
                <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Settings
              </a> */}
            </nav>
          </div>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <User className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Voter Account</p>
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 truncate">
                  {account && account.substring(0, 6) + '...' + account.substring(account.length - 4)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold text-green-600">SecureVote</h1>
        <button 
          onClick={toggleMenu}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
        >
          <span className="sr-only">Open menu</span>
          <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden fixed inset-0 z-20 bg-black bg-opacity-25`} onClick={toggleMenu}></div>
      <div className={`${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-64 transition duration-300 ease-in-out transform bg-white overflow-y-auto`}>
        <div className="pt-5 pb-4">
          <div className="flex items-center justify-between px-4">
            <h1 className="text-xl font-bold text-green-600">SecureVote</h1>
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              <span className="sr-only">Close menu</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-5">
            <nav className="px-2 space-y-1">
              <a href="/dashboard/user" className="bg-green-50 text-green-700 group flex items-center px-2 py-3 text-base font-medium rounded-md">
                <Home className="mr-3 h-5 w-5 text-green-500" />
                Dashboard
              </a>
              <a href="/dashboard/user/elections" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-3 text-base font-medium rounded-md">
                <Vote className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Elections
              </a>
              <a href="/dashboard/user/candidates" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-3 text-base font-medium rounded-md">
                <User className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Candidates
              </a>
              <a href="/dashboard/user/results" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-3 text-base font-medium rounded-md">
                <CalendarDays className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Results
              </a>
              <a href="/dashboard/user/settings" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-3 text-base font-medium rounded-md">
                <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Settings
              </a>
            </nav>
          </div>
        </div>
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <User className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Voter Account</p>
              <p className="text-xs font-medium text-gray-500 truncate">
                {account && account.substring(0, 6) + '...' + account.substring(account.length - 4)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:pl-0">
        <div className="md:hidden h-16"></div> {/* Spacer for mobile header */}
        <main className="flex-1 bg-gray-50 p-4 md:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center text-gray-500 text-sm">
              © {new Date().getFullYear()} SecureVote. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}