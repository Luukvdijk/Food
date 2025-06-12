import { supabase } from "@/lib/db"
import { ModernHeader } from "@/components/modern-header"
import { HeroSection } from "@/components/hero-section"

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
  const randomRecept = await getRandomReceptForInitialLoad()

  return (
    <div className="min-h-screen w-full">
      <ModernHeader />
      <HeroSection recept={randomRecept} />
    </div>
  )
}
