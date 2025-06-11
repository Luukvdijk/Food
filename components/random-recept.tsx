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
  const router = useRouter()

  const getRandomRecept = async () => {
    setLoading(true)
    setNoResults(false)

    try {
      // Build query string from filters
      const queryParams = new URLSearchParams()
      if (filters.type) queryParams.set("type", filters.type)
      if (filters.seizoen) queryParams.set("seizoen", filters.seizoen)
      if (filters.eigenaar) queryParams.set("eigenaar", filters.eigenaar)

      const queryString = queryParams.toString()
      const url = `/api/random-recept${queryString ? `?${queryString}` : ""}`

      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch random recipe")

      const data = await response.json()

      if (data === null) {
        setNoResults(true)
        setRecept(null)
      } else {
        setRecept(data)
      }
    } catch (error) {
      console.error("Error fetching random recipe:", error)
      setNoResults(true)
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
    setFilters(newFilters)
    // Reset the current recipe when filters change
    setRecept(null)
    setNoResults(false)
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
              <p className="text-muted-foreground">Geen recepten gevonden met deze filters. Probeer andere filters.</p>
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
