"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { BarChart3, CalendarDays, ChevronLeft, Home, ListChecks, Settings, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  // Handle closing sidebar when clicking outside on mobile
  useEffect(() => {
    setIsMounted(true)

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // If screen is md or larger, ensure sidebar is open
        // This is handled by CSS, but we want to update the state
        if (!isOpen) onClose()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isOpen, onClose])

  if (!isMounted) return null

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={onClose} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform border-r border-green-100 bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-green-100 px-4">
          <span className="text-lg font-bold text-green-700">Admin Panel</span>
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <nav className="space-y-1 p-2">
          <NavItem href="/dashboard/admin" icon={Home} label="Dashboard" isActive={pathname === "/dashboard/admin"} />
          <NavItem
            href="/dashboard/admin/elections"
            icon={CalendarDays}
            label="Elections"
            isActive={pathname.startsWith("/dashboard/admin/elections")}
          />
          <NavItem
            href="/dashboard/admin/candidates"
            icon={Users}
            label="Candidates"
            isActive={pathname.startsWith("/dashboard/admin/candidates")}
          />
          <NavItem
            href="/dashboard/admin/locations"
            icon={ListChecks}
            label="Locations"
            isActive={pathname.startsWith("/dashboard/admin/locations")}
          />
          <NavItem
            href="/dashboard/admin/results"
            icon={BarChart3}
            label="Results"
            isActive={pathname.startsWith("/dashboard/admin/results")}
          />
          <NavItem
            href="/dashboard/admin/settings"
            icon={Settings}
            label="Settings"
            isActive={pathname.startsWith("/dashboard/admin/settings")}
          />
        </nav>
      </aside>
    </>
  )
}

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  isActive: boolean
}

function NavItem({ href, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive ? "bg-green-100 text-green-900" : "text-gray-600 hover:bg-green-50 hover:text-green-700",
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  )
}

