import { RandomRecept } from "@/components/random-recept"
import { zoekRecepten } from "./actions"
import { ReceptCard } from "@/components/recept-card"

export default async function Home() {
  const populaireRecepten = await zoekRecepten({})

  return (
    <div className="space-y-12">
      <section className="flex justify-center">
        <RandomRecept />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Populaire recepten</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {populaireRecepten.slice(0, 8).map((recept) => (
            <ReceptCard key={recept.id} recept={recept} />
          ))}
        </div>
      </section>
    </div>
  )
}
