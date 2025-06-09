"use client"

import { useState, useEffect } from "react"
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
  const [hasEigenaarSupport, setHasEigenaarSupport] = useState(true)

  const loadRandomRecept = async () => {
    setLoading(true)
    setShowFilter(false)
    try {
      const randomRecept = await getRandomRecept(selectedEigenaar)
      setRecept(randomRecept)

      // Check if the returned recipe has eigenaar support
      if (randomRecept && !randomRecept.eigenaar) {
        setHasEigenaarSupport(false)
      }
    } catch (error) {
      console.error("Error loading random recept:", error)
      setRecept(null)
      // If there's an error related to eigenaar column, disable the feature
      if (error instanceof Error && error.message.includes("eigenaar")) {
        setHasEigenaarSupport(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const resetFilter = () => {
    setRecept(null)
    setSelectedEigenaar(null)
    setShowFilter(true)
  }

  // Load a random recipe on first load without eigenaar filter if not supported
  useEffect(() => {
    if (!hasEigenaarSupport) {
      loadRandomRecept()
    }
  }, [hasEigenaarSupport])

  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-2xl font-bold">Recept van de dag</h2>

      {/* Show eigenaar filter only if supported and not showing recipe yet */}
      {hasEigenaarSupport && showFilter && !recept && (
        <EigenaarFilter selectedEigenaar={selectedEigenaar} onEigenaarChange={setSelectedEigenaar} />
      )}

      {/* Show recipe or loading state */}
      {(!showFilter || !hasEigenaarSupport) && (
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
                  {hasEigenaarSupport && selectedEigenaar
                    ? `Geen recepten gevonden voor ${selectedEigenaar === "henk" ? "Henk" : "Pepie & Luulie"}.`
                    : "Nog geen recepten beschikbaar."}
                </p>
                {!hasEigenaarSupport && (
                  <p className="text-sm text-muted-foreground mt-2">Zet eerst de database op via de knop hieronder.</p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="flex gap-2">
        {showFilter && hasEigenaarSupport ? (
          <Button onClick={loadRandomRecept} disabled={loading || !selectedEigenaar} size="lg">
            Toon Random Recept
          </Button>
        ) : (
          <>
            <Button onClick={loadRandomRecept} disabled={loading}>
              {recept ? "Volgend recept" : "Probeer opnieuw"}
            </Button>
            {hasEigenaarSupport && (
              <Button onClick={resetFilter} variant="outline">
                Andere eigenaar kiezen
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
