import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import type { GerechtsType, Seizoen, Eigenaar } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as GerechtsType | null
    const seizoen = searchParams.get("seizoen") as Seizoen | null
    const eigenaar = searchParams.get("eigenaar") as Eigenaar | null

    console.log("Random recipe API called with filters:", { type, seizoen, eigenaar })

    // Start building the query
    let query = supabase.from("recepten").select("*")

    // Apply filters
    if (type) {
      console.log("Filtering by type:", type)
      query = query.eq("type", type)
    }

    if (eigenaar) {
      console.log("Filtering by eigenaar:", eigenaar)
      query = query.eq("eigenaar", eigenaar)
    }

    if (seizoen) {
      console.log("Filtering by seizoen:", seizoen)
      // Check if seizoen is stored as array or string
      query = query.contains("seizoen", [seizoen])
    }

    // Execute the query and get all matching recipes
    const { data: allRecipes, error: fetchError } = await query

    console.log("Query result:", { count: allRecipes?.length, error: fetchError })

    if (fetchError) {
      console.error("Database error:", fetchError)
      throw fetchError
    }

    if (!allRecipes || allRecipes.length === 0) {
      console.log("No recipes found with current filters")
      return NextResponse.json(null)
    }

    // Get a random recipe from the results
    const randomIndex = Math.floor(Math.random() * allRecipes.length)
    const randomRecipe = allRecipes[randomIndex]

    console.log("Selected random recipe:", randomRecipe.naam)
    return NextResponse.json(randomRecipe)
  } catch (error) {
    console.error("Random recipe API error:", error)
    return NextResponse.json({ error: "Failed to fetch random recipe" }, { status: 500 })
  }
}
