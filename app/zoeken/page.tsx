import { Filters } from "@/components/filters"
import { ReceptCard } from "@/components/recept-card"
import { zoekRecepten } from "../actions"
import type { FilterOptions, GerechtsType, Seizoen } from "@/types"

interface SearchPageProps {
  searchParams: {
    q?: string
    type?: GerechtsType
    seizoen?: Seizoen
  }
}

export default async function ZoekenPage({ searchParams }: SearchPageProps) {
  const { q, type, seizoen } = searchParams

  const filterOptions: FilterOptions = {
    zoekterm: q,
    type,
    seizoen,
  }

  const recepten = await zoekRecepten(filterOptions)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{q ? `Zoekresultaten voor "${q}"` : "Alle recepten"}</h1>

      <Filters />

      {recepten.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recepten.map((recept) => (
            <ReceptCard key={recept.id} recept={recept} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl">Geen recepten gevonden die aan je zoekcriteria voldoen.</p>
          <p className="text-muted-foreground mt-2">Probeer andere zoektermen of filters.</p>
        </div>
      )}
    </div>
  )
}
