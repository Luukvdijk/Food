import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
    }

    const { data, error } = await supabase.from("recepten").select("id, naam").order("naam")

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching recepten:", error)
    return NextResponse.json({ error: "Server fout" }, { status: 500 })
  }
}
