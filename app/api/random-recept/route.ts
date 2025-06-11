import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET() {
  try {
    // Get total count first
    const { count, error: countError } = await supabase.from("recepten").select("*", { count: "exact", head: true })

    if (countError) throw countError
    if (!count || count === 0) {
      return NextResponse.json(null)
    }

    // Get random offset
    const randomOffset = Math.floor(Math.random() * count)

    const { data, error } = await supabase.from("recepten").select("*").range(randomOffset, randomOffset).single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching random recept:", error)
    return NextResponse.json({ error: "Failed to fetch random recipe" }, { status: 500 })
  }
}
