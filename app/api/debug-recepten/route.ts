import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Get a sample of recipes to examine their structure
    const { data: recipes, error } = await supabase.from("recepten").select("*").limit(5)

    if (error) throw error

    // Get the unique types and seizoenen from all recipes
    const { data: allRecipes, error: allError } = await supabase.from("recepten").select("type, seizoen")

    if (allError) throw allError

    const uniqueTypes = [...new Set(allRecipes.map((r) => r.type))]

    // For seizoen, we need to flatten the arrays first
    const allSeasons = allRecipes.flatMap((r) => r.seizoen || [])
    const uniqueSeasons = [...new Set(allSeasons)]

    return NextResponse.json({
      sampleRecipes: recipes,
      uniqueTypes,
      uniqueSeasons,
      typeExamples: allRecipes.slice(0, 5).map((r) => r.type),
      seizoenExamples: allRecipes.slice(0, 5).map((r) => r.seizoen),
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "Debug error" }, { status: 500 })
  }
}
