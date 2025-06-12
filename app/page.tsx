import { supabase } from "@/lib/db"
import { ModernHeader } from "@/components/modern-header"
import { HeroSection } from "@/components/hero-section"
import { BijgerechtCard } from "@/components/bijgerecht-card"

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

async function getBijgerechtenForRecept(receptId: number) {
  try {
    // Get bijgerechten linked to this recipe
    const { data: receptBijgerechten, error: linkError } = await supabase
      .from("recept_bijgerechten")
      .select("bijgerecht_id")
      .eq("recept_id", receptId)

    if (linkError) throw linkError
    if (!receptBijgerechten || receptBijgerechten.length === 0) return []

    const bijgerechtIds = receptBijgerechten.map((rb) => rb.bijgerecht_id)

    // Get the actual bijgerechten data
    const { data: bijgerechten, error: bijgerechtError } = await supabase
      .from("bijgerechten")
      .select("*")
      .in("id", bijgerechtIds)

    if (bijgerechtError) throw bijgerechtError

    // Get ingredient counts for each bijgerecht
    const bijgerechtenWithCounts = await Promise.all(
      (bijgerechten || []).map(async (bijgerecht) => {
        const { count } = await supabase
          .from("bijgerecht_ingredienten")
          .select("*", { count: "exact", head: true })
          .eq("bijgerecht_id", bijgerecht.id)

        return {
          ...bijgerecht,
          ingredienten_count: count || 0,
        }
      }),
    )

    return bijgerechtenWithCounts
  } catch (error) {
    console.error("Error fetching bijgerechten:", error)
    return []
  }
}

export default async function Home() {
  const randomRecept = await getRandomReceptForInitialLoad()
  const bijgerechten = randomRecept ? await getBijgerechtenForRecept(randomRecept.id) : []

  return (
    <div className="min-h-screen w-full">
      <ModernHeader />
      <HeroSection recept={randomRecept} />

      {/* Curved transition section */}
      <div className="bg-[#eee1d1] relative w-full">
        <div className="h-24 bg-[#286058] curved-section"></div>

        <div className="w-full py-16 px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#286058] mb-2">Samen met</h2>
            <div className="w-24 h-1 bg-[#e75129] mx-auto"></div>
          </div>

          {bijgerechten.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {bijgerechten.map((bijgerecht) => (
                <BijgerechtCard key={bijgerecht.id} bijgerecht={bijgerecht} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2 text-[#286058]">Geen bijgerechten gevonden</h3>
              <p className="text-gray-600 mb-4">
                Dit recept heeft geen gekoppelde bijgerechten. Gebruik de zoekfunctie om alle recepten te bekijken.
              </p>
            </div>
          )}

          {/* Search prompt */}
          <div className="text-center mt-16 py-12 bg-white/50 rounded-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-[#286058] mb-4">Op zoek naar meer recepten?</h3>
            <p className="text-gray-700 text-lg mb-6">
              Gebruik de zoekbalk bovenaan om alle beschikbare recepten te ontdekken!
            </p>
            <div className="text-[#e75129] font-medium">💡 Tip: Zoek op ingrediënten, gerechtstype of seizoen</div>
          </div>
        </div>
      </div>
    </div>
  )
}
