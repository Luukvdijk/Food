import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
    }

    const result = await sql`
      SELECT i.*, r.naam as recept_naam
      FROM ingredienten i
      JOIN recepten r ON i.recept_id = r.id
      ORDER BY r.naam, i.naam
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching ingredients:", error)
    return NextResponse.json({ error: "Server fout" }, { status: 500 })
  }
}
