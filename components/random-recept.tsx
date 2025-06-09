"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getRandomRecept } from "@/app/actions"
import type { Recept, Eigenaar } from "@/types"
import { ReceptCard } from "./recept-card"
import { EigenaarFilter } from "./eigenaar-filter"

export function RandomRecept() {
  const [recept, setRecept] = useState<Recept | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedEigenaar, setSelectedEigenaar] = useState<Eigenaar | null>(null)
  const [showFilter, setShowFilter] = useState(true)

  const loadRandomRecept = async () => {
    setLoading(true)
    setShowFilter(false)
    try {
      const randomRecept = await getRandomRecept(selectedEigenaar)
      setRecept(randomRecept)
    } catch (error) {
      console.error("Error loading random recept:", error)
      setRecept(null)
    } finally {
      setLoading(false)
    }
  }

  const resetFilter = () => {
    setRecept(null)
    setSelectedEigenaar(null)
    setShowFilter(true)
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-2xl font-bold">Recept van de dag</h2>

      {showFilter && !recept && (
        <EigenaarFilter selectedEigenaar={selectedEigenaar} onEigenaarChange={setSelectedEigenaar} />
      )}

      {!showFilter && (
        <>
          {loading ? (
            <Card className="w-full max-w-md">
              <div className="relative h-48">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ) : recept ? (
            <div className="w-full max-w-md">
              <ReceptCard recept={recept} />
            </div>
          ) : (
            <Card className="w-full max-w-md">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  Geen recepten gevonden voor{" "}
                  {selectedEigenaar ? (selectedEigenaar === "henk" ? "Henk" : "Pepie & Luulie") : "deze filter"}.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="flex gap-2">
        {showFilter ? (
          <Button onClick={loadRandomRecept} disabled={loading || !selectedEigenaar} size="lg">
            Toon Random Recept
          </Button>
        ) : (
          <>
            <Button onClick={loadRandomRecept} disabled={loading}>
              {recept ? "Volgend recept" : "Probeer opnieuw"}
            </Button>
            <Button onClick={resetFilter} variant="outline">
              Andere eigenaar kiezen
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
