import { Suspense } from "react"
import { supabase } from "@/lib/db"
import { ReceptCard } from "@/components/recept-card"
import { Filters } from "@/components/filters"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchPageProps {
  searchParams: {
    q?: string
    type?: string
    seizoen?: string
    eigenaar?: string
  }
}

export default async function ZoekenPage({ searchParams }: SearchPageProps) {
  const { q, type, seizoen, eigenaar } = searchParams

  // Build query
  let query = supabase.from("recepten").select("*")

  // Apply filters
  if (q) {
    query = query.or(`naam.ilike.%${q}%,beschrijving.ilike.%${q}%`)
  }

  if (type) {
    query = query.eq("type", type)
  }

  if (seizoen) {
    query = query.contains("seizoen", [seizoen])
  }

  if (eigenaar) {
    query = query.eq("eigenaar", eigenaar)
  }

  // Execute query
  const { data: recepten, error } = await query.order("naam")

  if (error) {
    console.error("Error searching recipes:", error)
  }

  // Get unique eigenaar values for filter
  const { data: eigenaarData } = await supabase.from("recepten").select("eigenaar").not("eigenaar", "is", null)

  const eigenaars = [...new Set(eigenaarData?.map((r) => r.eigenaar).filter(Boolean))]

  return (
    <div className="min-h-screen bg-primary text-white">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Recepten Zoeken</h1>

        <div className="mb-8">
          <Filters
            currentType={type}
            currentSeizoen={seizoen}
            currentEigenaar={eigenaar}
            eigenaars={eigenaars as string[]}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">
            {q ? `Zoekresultaten voor "${q}"` : "Alle recepten"}
            {type ? ` • Type: ${type}` : ""}
            {seizoen ? ` • Seizoen: ${seizoen}` : ""}
            {eigenaar ? ` • Eigenaar: ${eigenaar}` : ""}
          </h2>

          <Suspense
            fallback={
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[350px]" />
                ))}
              </div>
            }
          >
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recepten && recepten.length > 0 ? (
                recepten.map((recept) => <ReceptCard key={recept.id} recept={recept} />)
              ) : (
                <p className="col-span-full text-center text-white/70 py-8">
                  Geen recepten gevonden. Probeer andere zoektermen of filters.
                </p>
              )}
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
