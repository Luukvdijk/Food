import { RandomRecept } from "@/components/random-recept"
import { getAllRecepten } from "./actions"
import { ReceptCard } from "@/components/recept-card"

export default async function Home() {
  const alleRecepten = await getAllRecepten()

  return (
    <div className="space-y-12">
      <section className="flex justify-center">
        <RandomRecept />
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
