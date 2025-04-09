"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Menu, Search, User } from "lucide-react"
import useContractInteraction from "@/lib/useContractInteraction"

type NavbarProps = {
  toggleSidebar: () => void
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const { account } = useContractInteraction()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center bg-white shadow">
      <div className="flex w-full items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="mr-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search bar */}
          <div className="relative hidden md:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-600">
            <Bell className="h-6 w-6" />
            <span className="absolute right-0 top-0 flex h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center rounded-full text-sm focus:outline-none"
              aria-expanded={isProfileDropdownOpen}
              aria-haspopup="true"
            >
              <span className="sr-only">Open user menu</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                <User className="h-5 w-5" />
              </div>
            </button>

            {/* Dropdown menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="border-b px-4 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}
                  </p>
                </div>
                <Link
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  Your Profile
                </Link>
                <Link
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  Sign out
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
