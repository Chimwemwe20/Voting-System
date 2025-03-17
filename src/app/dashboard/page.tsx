"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import useContractInteraction from "@/lib/useContractInteraction"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { account, isRegistered, isAdmin, isLoading } = useContractInteraction()

  useEffect(() => {
    if (isLoading) return;

    const redirect = () => {
      if (!account) {
        router.replace("/connect")
      } else if (account && isRegistered) {
        if (isAdmin) {
          router.replace("/dashboard/admin")
        } else {
          router.replace("/dashboard/user")
        }
      } else if (account && !isRegistered) {
        router.replace("/connect")
      }
    }

    redirect()
  }, [account, isRegistered, isAdmin, isLoading, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-600" />
        <h2 className="mt-4 text-xl font-semibold text-green-800">Checking your account...</h2>
        <p className="mt-2 text-sm text-gray-500">Please wait while we verify your wallet</p>
      </div>
    </div>
  )
}