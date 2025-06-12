import { getAllRecepten } from "./actions"
import { supabase } from "@/lib/db"
import { ModernHeader } from "@/components/modern-header"
import { HeroSection } from "@/components/hero-section"
import { ModernRecipeCard } from "@/components/modern-recipe-card"

async function getRandomReceptForInitialLoad() {
  try {
    const { count, error: countError } = await supabase.from("recepten").select("*", { count: "exact", head: true })

    if (countError) throw countError
    if (!count || count === 0) return null

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
    <div className="min-h-screen">
      <ModernHeader />
      <HeroSection recept={randomRecept} />

      {/* Curved transition section */}
      <div className="bg-[#eee1d1] relative">
        <div className="h-24 bg-[#286058] curved-section"></div>

        <div className="container mx-auto py-16 px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#286058] mb-2">Samen met</h2>
            <div className="w-24 h-1 bg-[#e75129] mx-auto"></div>
          </div>

          {alleRecepten.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {alleRecepten.slice(0, 6).map((recept) => (
                <ModernRecipeCard key={recept.id} recept={recept} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2 text-[#286058]">Geen recepten gevonden</h3>
              <p className="text-gray-600 mb-4">
                Er zijn nog geen recepten in de database. Ga naar de admin pagina om recepten toe te voegen.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
