import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getUser } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    const { naam, hoeveelheid, eenheid, notitie } = await request.json()

    const { error } = await supabase
      .from("ingredienten")
      .update({
        naam,
        hoeveelheid,
        eenheid,
        notitie: notitie || null,
      })
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating ingredient:", error)
    return NextResponse.json({ error: "Server fout" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)

    const { error } = await supabase.from("ingredienten").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting ingredient:", error)
    return NextResponse.json({ error: "Server fout" }, { status: 500 })
  }
}
