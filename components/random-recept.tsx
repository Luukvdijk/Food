"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6">Probeer eens dit recept</h2>

      {loading ? (
        <Skeleton className="w-full max-w-md h-[350px] rounded-lg" />
      ) : recept ? (
        <div className="w-full max-w-md">
          <ReceptCard recept={recept} />
          <div className="mt-4 flex justify-center gap-4">
            <Button onClick={getRandomRecept} variant="outline">
              Ander recept
            </Button>
            <Button onClick={handleViewRecept}>Bekijk recept</Button>
          </div>
        </div>
      ) : (
        <p className="text-center text-muted-foreground">Geen recepten gevonden. Voeg eerst recepten toe.</p>
      )}
    </div>
  )
}
