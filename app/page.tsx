import { RandomRecept } from "@/components/random-recept"
import { getAllRecepten } from "./actions"
import { ReceptCard } from "@/components/recept-card"
import { supabase } from "@/lib/db"

async function getRandomReceptForInitialLoad() {
  try {
    // Get total count first
    const { count, error: countError } = await supabase.from("recepten").select("*", { count: "exact", head: true })

    if (countError) throw countError
    if (!count || count === 0) return null

    // Get random offset
    const randomOffset = Math.floor(Math.random() * count)

    const { data, error } = await supabase.from("recepten").select("*").range(randomOffset, randomOffset).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching random recept:", error)
    return null
  }
}

export default async function Home() {
  const [alleRecepten, randomRecept] = await Promise.all([getAllRecepten(), getRandomReceptForInitialLoad()])

  return (
    <div className="space-y-12">
      <section className="flex justify-center">
        <RandomRecept initialRecept={randomRecept} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Alle recepten</h2>
        {alleRecepten.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {alleRecepten.map((recept) => (
              <ReceptCard key={recept.id} recept={recept} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Geen recepten gevonden</h3>
            <p className="text-muted-foreground mb-4">
              Er zijn nog geen recepten in de database. Ga naar de admin pagina om recepten toe te voegen.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
