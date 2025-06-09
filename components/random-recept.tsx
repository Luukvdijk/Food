"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getRandomRecept } from "@/app/actions"
import type { Recept } from "@/types"
import { ReceptCard } from "./recept-card"

export function RandomRecept() {
  const [recept, setRecept] = useState<Recept | null>(null)
  const [loading, setLoading] = useState(true)

  const loadRandomRecept = async () => {
    setLoading(true)
    const randomRecept = await getRandomRecept()
    setRecept(randomRecept)
    setLoading(false)
  }

  useEffect(() => {
    loadRandomRecept()
  }, [])

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6">Recept van de dag</h2>

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
        <p>Geen recepten gevonden.</p>
      )}

      <Button onClick={loadRandomRecept} className="mt-6" disabled={loading}>
        Volgend recept
      </Button>
    </div>
  )
}
