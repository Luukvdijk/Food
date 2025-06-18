"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ReceptCard } from "@/components/recept-card"
import { Skeleton } from "@/components/ui/skeleton"
import { RandomReceptFilters } from "./random-recept-filters"
import type { Recept, FilterOptions } from "@/types"

interface RandomReceptProps {
  initialRecept: Recept | null
}

export function RandomRecept({ initialRecept }: RandomReceptProps) {
  const [recept, setRecept] = useState<Recept | null>(initialRecept)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [noResults, setNoResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const getRandomRecept = async () => {
    console.log("Getting random recipe with filters:", filters)
    setLoading(true)
    setNoResults(false)
    setError(null)

    try {
      // Build query string from filters
      const queryParams = new URLSearchParams()
      if (filters.type) queryParams.set("type", filters.type)
      if (filters.seizoen) queryParams.set("seizoen", filters.seizoen)
      if (filters.eigenaar) queryParams.set("eigenaar", filters.eigenaar)

      const queryString = queryParams.toString()
      const url = `/api/random-recept${queryString ? `?${queryString}` : ""}`

      console.log("Fetching from URL:", url)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("API response:", data)

      if (data === null) {
        setNoResults(true)
        setRecept(null)
      } else if (data.error) {
        setError(data.error)
        setRecept(null)
      } else {
        setRecept(data)
        setNoResults(false)
      }
    } catch (error) {
      console.error("Error fetching random recipe:", error)
      setError("Er is een fout opgetreden bij het ophalen van een recept")
      setNoResults(false)
    } finally {
      setLoading(false)
    }
  }

  const handleViewRecept = () => {
    if (recept) {
      router.push(`/recept/${recept.id}`)
    }
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    console.log("Filters changed:", newFilters)
    setFilters(newFilters)
    setRecept(null)
    setNoResults(false)
    setError(null)
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md space-y-6">
      <h2 className="text-2xl font-bold">Recept van de dag</h2>

      <RandomReceptFilters onFiltersChange={handleFiltersChange} />

      {loading ? (
        <Card className="w-full">
          <div className="relative h-48">
            <Skeleton className="h-full w-full" />
          </div>
          <CardContent className="pt-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={getRandomRecept} size="lg">
              Probeer opnieuw
            </Button>
          </CardContent>
        </Card>
      ) : recept ? (
        <>
          <ReceptCard recept={recept} />
          <div className="mt-4 flex justify-center gap-4 w-full">
            <Button onClick={getRandomRecept} variant="outline" className="flex-1">
              Ander recept
            </Button>
            <Button onClick={handleViewRecept} className="flex-1">
              Bekijk recept
            </Button>
          </div>
        </>
      ) : (
        <Card className="w-full">
          <CardContent className="pt-6 text-center">
            {noResults ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">Geen recepten gevonden met deze filters.</p>
                <p className="text-sm text-muted-foreground">
                  Probeer andere filters of klik hieronder voor alle recepten.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => handleFiltersChange({})}>
                    Wis filters
                  </Button>
                  <Button onClick={getRandomRecept}>Probeer opnieuw</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {Object.keys(filters).length > 0
                    ? "Klik op de knop om een willekeurig recept te vinden met je filters."
                    : "Kies filters hierboven of klik direct op de knop voor een willekeurig recept."}
                </p>
                <Button onClick={getRandomRecept} size="lg">
                  Toon willekeurig recept
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
