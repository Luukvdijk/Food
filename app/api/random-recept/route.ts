import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import type { GerechtsType, Seizoen, Eigenaar } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as GerechtsType | null
    const seizoen = searchParams.get("seizoen") as Seizoen | null
    const eigenaar = searchParams.get("eigenaar") as Eigenaar | null

    console.log("=== Random Recipe API Called ===")
    console.log("Filters received:", { type, seizoen, eigenaar })

    // Start building the query with full recipe data
    let query = supabase.from("recepten").select(`
        *,
        ingredienten (*),
        bijgerechten (*)
      `)

    // Apply filters
    if (type && type !== "Alle types") {
      console.log("Applying type filter:", type)
      query = query.eq("type", type)
    }

    if (eigenaar && eigenaar !== "Alle eigenaars") {
      console.log("Applying eigenaar filter:", eigenaar)
      query = query.eq("eigenaar", eigenaar)
    }

    if (seizoen && seizoen !== "Alle seizoenen") {
      console.log("Applying seizoen filter:", seizoen)
      // Try both array contains and direct match
      query = query.or(`seizoen.cs.{${seizoen}},seizoen.eq.${seizoen}`)
    }

    // Execute the query and get all matching recipes
    console.log("Executing query...")
    const { data: allRecipes, error: fetchError } = await query

    console.log("Query result:", {
      count: allRecipes?.length,
      error: fetchError,
      firstRecipe: allRecipes?.[0]?.naam,
    })

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
    console.log("Recipe details:", {
      id: randomRecipe.id,
      type: randomRecipe.type,
      seizoen: randomRecipe.seizoen,
      eigenaar: randomRecipe.eigenaar,
    })

    return NextResponse.json(randomRecipe)
  } catch (error) {
    console.error("Random recipe API error:", error)
    return NextResponse.json({ error: "Failed to fetch random recipe" }, { status: 500 })
  }
}
