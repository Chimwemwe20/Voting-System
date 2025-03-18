"use client"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useContractInteraction from "@/lib/useContractInteraction"
import { MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Election {
  id: string
  name: string
}

export default function LocationsPage() {
  const router = useRouter()
  const { account, isAdmin, isLoading, getElections, getElectionLocations } = useContractInteraction()
  const [elections, setElections] = useState<Election[]>([])
  const [selectedElection, setSelectedElection] = useState<string>("")
  const [locations, setLocations] = useState<string[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (isLoading) return
    
    if (!account || !isAdmin) {
      router.replace("/dashboard/user")
      return
    }

    const loadElections = async () => {
      try {
        const electionsList = await getElections(0, 100)
        setElections(electionsList)
        setIsLoadingData(false)
      } catch (error) {
        console.error("Error loading elections:", error)
        setIsLoadingData(false)
      }
    }

    loadElections()
  }, [account, isAdmin, isLoading, router, getElections])

  useEffect(() => {
    const loadLocations = async () => {
      if (!selectedElection) return

      try {
        setIsLoadingData(true)
        const locationsList = await getElectionLocations(selectedElection)
        setLocations(locationsList)
      } catch (error) {
        console.error("Error loading locations:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadLocations()
  }, [selectedElection, getElectionLocations])

  return (
    <div className="flex min-h-screen flex-col">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} showMenuButton={true} />

      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 bg-green-50 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-green-900">Locations</h1>
            <p className="text-gray-600">Manage voting locations for each election</p>
          </div>

          <div className="mb-6">
            <Select value={selectedElection} onValueChange={setSelectedElection}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select an election" />
              </SelectTrigger>
              <SelectContent>
                {elections.map((election) => (
                  <SelectItem key={election.id} value={election.id}>
                    {election.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedElection && (
            <div className="mb-4">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href={`/dashboard/admin/locations/add/${selectedElection}`}>
                  Add New Location
                </a>
              </Button>
            </div>
          )}

          {isLoadingData ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((location, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      {location}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}