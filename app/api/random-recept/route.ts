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

    if (seizoen) {
      // For array fields, we need to check if the array contains the value
      query = query.contains("seizoen", [seizoen])
    }

    if (eigenaar) {
      query = query.eq("eigenaar", eigenaar)
    }

    // First get the count to see if we have any results
    const { count, error: countError } = await query.select("id", { count: "exact", head: true })

    if (countError) throw countError
    if (!count || count === 0) {
      return NextResponse.json(null)
    }

    // Get random offset
    const randomOffset = Math.floor(Math.random() * count)

    // Execute the same query but with the random offset
    let finalQuery = supabase.from("recepten").select("*")

    // Apply the same filters again
    if (type) {
      finalQuery = finalQuery.eq("type", type)
    }

    if (seizoen) {
      finalQuery = finalQuery.contains("seizoen", [seizoen])
    }

    if (eigenaar) {
      finalQuery = finalQuery.eq("eigenaar", eigenaar)
    }

    // Apply the offset and limit to get a random record
    const { data, error } = await finalQuery.range(randomOffset, randomOffset).single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching random recept:", error)
    return NextResponse.json({ error: "Failed to fetch random recipe" }, { status: 500 })
  }
}
