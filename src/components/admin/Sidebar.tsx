"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, Home, LogOut, Settings, User, Vote, BarChart3 } from "lucide-react"

type SidebarProps = {
  isOpen: boolean
  toggleSidebar: () => void
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname()
  const [isElectionSubmenuOpen, setIsElectionSubmenuOpen] = useState(false)
  const [isReportsSubmenuOpen, setIsReportsSubmenuOpen] = useState(false)

  // Check if the current path is under the election section
  useEffect(() => {
    if (pathname.includes("/dashboard/admin/election")) {
      setIsElectionSubmenuOpen(true)
    }
    if (pathname.includes("/dashboard/admin/reports")) {
      setIsReportsSubmenuOpen(true)
    }
  }, [pathname])

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-30 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-center border-b px-6">
            <h2 className="text-xl font-bold text-gray-800">Election Admin</h2>
          </div>

          {/* Sidebar navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/dashboard/admin"
                  className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                    isActive("/dashboard/admin")
                      ? "bg-green-100 text-green-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Home className="mr-3 h-5 w-5" />
                  Dashboard
                </Link>
              </li>

              <li>
                <button
                  onClick={() => setIsElectionSubmenuOpen(!isElectionSubmenuOpen)}
                  className={`flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium ${
                    pathname.includes("/dashboard/admin/election")
                      ? "bg-green-100 text-green-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center">
                    <Vote className="mr-3 h-5 w-5" />
                    Elections
                  </div>
                  {isElectionSubmenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                {isElectionSubmenuOpen && (
                  <ul className="mt-1 space-y-1 pl-10">
                    <li>
                      <Link
                        href="/dashboard/admin/election"
                        className={`block rounded-md px-4 py-2 text-sm font-medium ${
                          isActive("/dashboard/admin/election")
                            ? "bg-green-50 text-green-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        All Elections
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/admin/election/create"
                        className={`block rounded-md px-4 py-2 text-sm font-medium ${
                          isActive("/dashboard/admin/election/create")
                            ? "bg-green-50 text-green-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        Create Election
                      </Link>
                    </li>
                    {/* <li>
                      <Link
                        href="/dashboard/admin/election/manage"
                        className={`block rounded-md px-4 py-2 text-sm font-medium ${
                          isActive("/dashboard/admin/election/manage")
                            ? "bg-green-50 text-green-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        Manage Candidates
                      </Link>
                    </li> */}
                    {/* <li>
                      <Link
                        href="/dashboard/admin/election/locations"
                        className={`block rounded-md px-4 py-2 text-sm font-medium ${
                          isActive("/dashboard/admin/election/locations")
                            ? "bg-green-50 text-green-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        Voting Locations
                      </Link>
                    </li> */}
                  </ul>
                )}
              </li>

              <li>
                <button
                  onClick={() => setIsReportsSubmenuOpen(!isReportsSubmenuOpen)}
                  className={`flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium ${
                    pathname.includes("/dashboard/admin/reports")
                      ? "bg-green-100 text-green-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center">
                    <BarChart3 className="mr-3 h-5 w-5" />
                    Reports
                  </div>
                  {isReportsSubmenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                {isReportsSubmenuOpen && (
                  <ul className="mt-1 space-y-1 pl-10">
                    <li>
                      <Link
                        href="/dashboard/admin/results"
                        className={`block rounded-md px-4 py-2 text-sm font-medium ${
                          isActive("/dashboard/admin/results")
                            ? "bg-green-50 text-green-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        Election Results
                      </Link>
                    </li>
                    {/* <li>
                      <Link
                        href="/dashboard/admin/reports/location"
                        className={`block rounded-md px-4 py-2 text-sm font-medium ${
                          isActive("/dashboard/admin/reports/location")
                            ? "bg-green-50 text-green-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        Location Stats
                      </Link>
                    </li> */}
                  </ul>
                )}
              </li>

              {/* <li>
                <Link
                  href="/dashboard/admin/users"
                  className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                    isActive("/dashboard/admin/users")
                      ? "bg-green-100 text-green-700" 
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <User className="mr-3 h-5 w-5" />
                  User Management
                </Link>
              </li>

              <li>
                <Link
                  href="/dashboard/admin/settings"
                  className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                    isActive("/dashboard/admin/settings")
                      ? "bg-green-100 text-green-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </Link>
              </li> */}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="border-t p-4">
            <button className="flex w-full items-center rounded-md px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  )
}