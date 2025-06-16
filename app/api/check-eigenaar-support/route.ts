import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET() {
  try {
    console.log("Checking eigenaar support...")

    // Try to query the recepten table to see if eigenaar column exists
    const { data, error } = await supabase.from("recepten").select("eigenaar").limit(1)

    if (error) {
      console.log("Eigenaar column does not exist:", error.message)
      return NextResponse.json({ hasEigenaarSupport: false })
    }

    console.log("Eigenaar column exists")
    return NextResponse.json({ hasEigenaarSupport: true })
  } catch (error) {
    console.error("Error checking eigenaar support:", error)
    return NextResponse.json({ hasEigenaarSupport: false })
  }
}
