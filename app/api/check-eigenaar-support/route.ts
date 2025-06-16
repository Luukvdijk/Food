import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET() {
  try {
    // Try to query the recepten table to check if eigenaar column exists
    const { data, error } = await supabase.from("recepten").select("eigenaar").limit(1).single()

    // If no error, the column exists
    if (!error || error.code !== "PGRST116") {
      return NextResponse.json({ hasEigenaarSupport: true })
    }

    // If we get a column not found error, eigenaar doesn't exist
    return NextResponse.json({ hasEigenaarSupport: false })
  } catch (error) {
    console.error("Error checking eigenaar support:", error)
    // Default to true to be safe
    return NextResponse.json({ hasEigenaarSupport: true })
  }
}
