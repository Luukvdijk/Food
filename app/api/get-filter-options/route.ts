import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET() {
  try {
    console.log("=== Getting Filter Options ===")

    // Get all recipes to analyze the data
    const { data: recipes, error } = await supabase.from("recepten").select("type, seizoen, eigenaar")

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    console.log("Total recipes found:", recipes?.length)
    console.log("Sample recipes:", recipes?.slice(0, 3))

    // Extract unique values
    const types = new Set<string>()
    const seizoenen = new Set<string>()
    const eigenaars = new Set<string>()

    recipes?.forEach((recipe) => {
      if (recipe.type) {
        types.add(recipe.type)
      }

      if (recipe.seizoen) {
        // Handle both array and string formats
        if (Array.isArray(recipe.seizoen)) {
          recipe.seizoen.forEach((s) => seizoenen.add(s))
        } else if (typeof recipe.seizoen === "string") {
          seizoenen.add(recipe.seizoen)
        }
      }

      if (recipe.eigenaar) {
        eigenaars.add(recipe.eigenaar)
      }
    })

    const filterOptions = {
      types: Array.from(types).sort(),
      seizoenen: Array.from(seizoenen).sort(),
      eigenaars: Array.from(eigenaars).sort(),
    }

    console.log("Filter options found:", filterOptions)

    return NextResponse.json(filterOptions)
  } catch (error) {
    console.error("Error getting filter options:", error)
    return NextResponse.json({ error: "Failed to get filter options" }, { status: 500 })
  }
}
