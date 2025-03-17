"use client"

import { Button } from "@/components/ui/button"
// Updated import: using the custom hook file instead of the contract interaction module
import useContractInteraction from "@/lib/useContractInteraction"
import { LogOut, Menu } from "lucide-react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface HeaderProps {
  toggleSidebar?: () => void
  showMenuButton?: boolean
}

export function Header({ toggleSidebar, showMenuButton = false }: HeaderProps) {
  const { account } = useContractInteraction()
  const router = useRouter()
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const formatAddress = (address: string | null) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    // In a real app, you might want to clear any local state
    // For MetaMask, we can't programmatically disconnect, but we can redirect
    setTimeout(() => {
      router.push("/")
      setIsDisconnecting(false)
    }, 500)
  }

  return (
    <header className="sticky top-0 z-10 border-b border-green-100 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}

          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-green-700">VoteChain</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {account && (
            <>
              <div className="hidden md:block">
                <span className="text-sm font-medium text-gray-600">{formatAddress(account)}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                {isDisconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
