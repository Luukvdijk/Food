import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'recepten' AND column_name = 'eigenaar'
    `

    const hasEigenaarSupport = columnCheck.length > 0

    return NextResponse.json({ hasEigenaarSupport })
  } catch (error) {
    console.error("Error checking eigenaar support:", error)
    return NextResponse.json({ hasEigenaarSupport: false })
  }
}
