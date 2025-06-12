import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import type { GerechtsType, Seizoen, Eigenaar } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as GerechtsType | null
    const seizoen = searchParams.get("seizoen") as Seizoen | null
    const eigenaar = searchParams.get("eigenaar") as Eigenaar | null

    // Start building the query
    let query = supabase.from("recepten").select("*")

    // Apply filters
    if (type) {
      query = query.eq("type", type)
    }

    if (eigenaar) {
      query = query.eq("eigenaar", eigenaar)
    }

    if (seizoen) {
      query = query.contains("seizoen", [seizoen])
    }

    // Execute the query and get all matching recipes
    const { data: allRecipes, error: fetchError } = await query

    if (fetchError) throw fetchError

    if (!allRecipes || allRecipes.length === 0) {
      return NextResponse.json(null)
    }

    // Get a random recipe from the results
    const randomIndex = Math.floor(Math.random() * allRecipes.length)
    const randomRecipe = allRecipes[randomIndex]

    return NextResponse.json(randomRecipe)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch random recipe" }, { status: 500 })
  }
}
