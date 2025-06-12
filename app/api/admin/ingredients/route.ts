import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("ingredienten")
      .select(`
        *,
        recept:recepten(naam)
      `)
      .order("naam")

    if (error) throw error

    // Format the data to match the expected structure
    const formattedData = data.map((item) => ({
      ...item,
      recept_naam: item.recept?.naam || "Onbekend recept",
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Error fetching ingredients:", error)
    return NextResponse.json({ error: "Server fout" }, { status: 500 })
  }
}
