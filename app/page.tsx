import { supabase } from "@/lib/db"
import { ModernHeader } from "@/components/modern-header"
import { HeroSection } from "@/components/hero-section"
import { RandomRecept } from "@/components/random-recept"

async function getRandomReceptForInitialLoad() {
  try {
    // First get total count
    const { count, error: countError } = await supabase.from("recepten").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Count error:", countError)
      throw countError
    }

    if (!count || count === 0) {
      console.log("No recipes found in database")
      return null
    }

    console.log(`Found ${count} recipes in database`)

    // Get random offset
    const randomOffset = Math.floor(Math.random() * count)
    console.log(`Using random offset: ${randomOffset}`)

    // Use the same query pattern as search page
    const { data, error } = await supabase
      .from("recepten")
      .select(`
        *,
        ingredienten (*),
        bijgerechten (*)
      `)
      .range(randomOffset, randomOffset)
      .single()

    if (error) {
      console.error("Recipe fetch error:", error)
      throw error
    }

    console.log("Successfully fetched recipe:", data?.naam)
    return data
  } catch (error) {
    console.error("Error fetching random recept:", error)
    return null
  }
}

export default async function Home() {
  const randomRecept = await getRandomReceptForInitialLoad()

  return (
    <div className="min-h-screen w-full">
      <ModernHeader />
      <HeroSection recept={randomRecept} />

      {/* Curved transition section */}
      <div className="bg-[#eee1d1] relative w-full">
        <div className="h-24 bg-[#286058] curved-section"></div>

        <div className="w-full py-16 px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#286058] mb-2">Willekeurig Recept</h2>
            <div className="w-24 h-1 bg-[#e75129] mx-auto"></div>
          </div>

          {/* Random Recipe Component with Filters */}
          <div className="flex justify-center">
            <RandomRecept initialRecept={randomRecept} />
          </div>

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
