"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ReceptCard } from "@/components/recept-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Recept } from "@/types"

interface RandomReceptProps {
  initialRecept: Recept | null
}

export function RandomRecept({ initialRecept }: RandomReceptProps) {
  const [recept, setRecept] = useState<Recept | null>(initialRecept)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const getRandomRecept = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/random-recept")
      if (!response.ok) throw new Error("Failed to fetch random recipe")

      const data = await response.json()
      setRecept(data)
    } catch (error) {
      console.error("Error fetching random recipe:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewRecept = () => {
    if (recept) {
      router.push(`/recept/${recept.id}`)
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6">Recept van de dag</h2>

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
            <p className="text-muted-foreground">Geen recepten gevonden. Voeg eerst recepten toe.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
