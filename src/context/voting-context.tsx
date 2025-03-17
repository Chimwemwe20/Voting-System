"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { type VotingContractService, useVotingContract } from "@/lib/contract-interaction"

interface VotingContextType {
  contractService: VotingContractService | null
  isInitialized: boolean
  account: string | null
  isUserAdmin: boolean
  isUserRegistered: boolean
  userLocation: string
  loading: boolean
  connectWallet: () => Promise<void>
  registerUser: (location: string) => Promise<boolean>
}

const VotingContext = createContext<VotingContextType>({
  contractService: null,
  isInitialized: false,
  account: null,
  isUserAdmin: false,
  isUserRegistered: false,
  userLocation: "",
  loading: true,
  connectWallet: async () => {},
  registerUser: async () => false,
})

export const useVoting = () => useContext(VotingContext)

export const VotingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { contractService, isInitialized, account, isUserAdmin } = useVotingContract()
  const [isUserRegistered, setIsUserRegistered] = useState(false)
  const [userLocation, setUserLocation] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUserStatus = async () => {
      if (contractService && account) {
        try {
          setLoading(true)
          const registered = await contractService.isUserRegistered()
          setIsUserRegistered(registered)

          if (registered) {
            const location = await contractService.getUserLocation()
            setUserLocation(location)
          }
        } catch (error) {
          console.error("Error checking user status:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    checkUserStatus()
  }, [contractService, account])

  // Redirect based on authentication status
  useEffect(() => {
    if (!loading && isInitialized) {
      if (!account) {
        router.push("/")
      } else if (isUserAdmin) {
        router.push("/admin")
      } else if (isUserRegistered) {
        router.push("/user")
      } else {
        router.push("/register")
      }
    }
  }, [isUserAdmin, isUserRegistered, account, isInitialized, loading, router])

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
      } catch (error) {
        console.error("User denied account access", error)
      }
    } else {
      alert("Please install MetaMask to use this application")
    }
  }

  const registerUser = async (location: string) => {
    if (!contractService) return false
    try {
      const success = await contractService.registerUser(location)
      if (success) {
        setIsUserRegistered(true)
        setUserLocation(location)
      }
      return success
    } catch (error) {
      console.error("Error registering user:", error)
      return false
    }
  }

  return (
    <VotingContext.Provider
      value={{
        contractService,
        isInitialized,
        account,
        isUserAdmin,
        isUserRegistered,
        userLocation,
        loading,
        connectWallet,
        registerUser,
      }}
    >
      {children}
    </VotingContext.Provider>
  )
}

