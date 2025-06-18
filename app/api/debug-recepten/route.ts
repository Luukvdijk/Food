import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET() {
  try {
    // Get all recipes to analyze the data structure
    const { data: recipes, error } = await supabase.from("recepten").select("*").limit(10)

    if (error) {
      console.error("Debug error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Extract unique values for filters
    const uniqueTypes = [...new Set(recipes?.map((r) => r.type).filter(Boolean))]
    const uniqueSeasons = [...new Set(recipes?.flatMap((r) => r.seizoen || []).filter(Boolean))]
    const uniqueEigenaren = [...new Set(recipes?.map((r) => r.eigenaar).filter(Boolean))]

    return NextResponse.json({
      totalRecipes: recipes?.length || 0,
      uniqueTypes,
      uniqueSeasons,
      uniqueEigenaren,
      sampleRecipe: recipes?.[0] || null,
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json({ error: "Failed to debug recipes" }, { status: 500 })
  }
}
