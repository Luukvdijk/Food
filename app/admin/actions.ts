"use server"

import { sql } from "@/lib/db"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import type { GerechtsType, Seizoen } from "@/types"

export interface ReceptFormData {
  naam: string
  beschrijving: string
  bereidingstijd: number
  moeilijkheidsgraad: string
  type: GerechtsType
  seizoen: Seizoen[]
  tags: string[]
  afbeelding_url?: string
  bereidingswijze: string[]
  personen: number
}

export interface IngredientFormData {
  naam: string
  hoeveelheid: number
  eenheid: string
  notitie?: string
}

export interface BijgerechtFormData {
  naam: string
  beschrijving: string
}

export async function addRecept(formData: FormData) {
  try {
    const naam = formData.get("naam") as string
    const beschrijving = formData.get("beschrijving") as string
    const bereidingstijd = Number.parseInt(formData.get("bereidingstijd") as string)
    const moeilijkheidsgraad = formData.get("moeilijkheidsgraad") as string
    const type = formData.get("type") as GerechtsType
    const personen = Number.parseInt(formData.get("personen") as string)
    const afbeelding_url = formData.get("afbeelding_url") as string

    // Parse seizoenen (comma separated)
    const seizoenString = formData.get("seizoen") as string
    const seizoen = seizoenString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as Seizoen[]

    // Parse tags (comma separated)
    const tagsString = formData.get("tags") as string
    const tags = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    // Parse bereidingswijze (newline separated)
    const bereidingswijzeString = formData.get("bereidingswijze") as string
    const bereidingswijze = bereidingswijzeString
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)

    // Parse ingrediënten
    const ingredientenString = formData.get("ingredienten") as string
    const ingredientenLines = ingredientenString.split("\n").filter((line) => line.trim())

    // Parse bijgerechten
    const bijgerechtenString = formData.get("bijgerechten") as string
    const bijgerechtenLines = bijgerechtenString.split("\n").filter((line) => line.trim())

    // Voeg het recept toe
    const receptResult = await sql`
      INSERT INTO recepten (naam, beschrijving, bereidingstijd, moeilijkheidsgraad, type, seizoen, tags, afbeelding_url, bereidingswijze, personen)
      VALUES (${naam}, ${beschrijving}, ${bereidingstijd}, ${moeilijkheidsgraad}, ${type}, ${seizoen}, ${tags}, ${afbeelding_url || null}, ${bereidingswijze}, ${personen})
      RETURNING id
    `

    const receptId = receptResult[0].id

    // Voeg ingrediënten toe
    for (const line of ingredientenLines) {
      const parts = line.split("|").map((p) => p.trim())
      if (parts.length >= 3) {
        const [hoeveelheid, eenheid, naam, notitie] = parts
        await sql`
          INSERT INTO ingredienten (recept_id, naam, hoeveelheid, eenheid, notitie)
          VALUES (${receptId}, ${naam}, ${Number.parseFloat(hoeveelheid)}, ${eenheid}, ${notitie || null})
        `
      }
    }

    // Voeg bijgerechten toe
    for (const line of bijgerechtenLines) {
      const parts = line.split("|").map((p) => p.trim())
      if (parts.length >= 2) {
        const [naam, beschrijving] = parts
        await sql`
          INSERT INTO bijgerechten (recept_id, naam, beschrijving)
          VALUES (${receptId}, ${naam}, ${beschrijving})
        `
      }
    }

    revalidatePath("/")
    revalidatePath("/admin")
    redirect("/admin?success=true")
  } catch (error) {
    console.error("Error adding recept:", error)
    redirect("/admin?error=true")
  }
}

export async function deleteRecept(receptId: number) {
  try {
    await sql`DELETE FROM recepten WHERE id = ${receptId}`
    revalidatePath("/")
    revalidatePath("/admin")
    redirect("/admin?deleted=true")
  } catch (error) {
    console.error("Error deleting recept:", error)
    redirect("/admin?error=true")
  }
}

export async function getAllReceptenAdmin() {
  try {
    const result = await sql`
      SELECT r.*, 
             COUNT(i.id) as ingredient_count,
             COUNT(b.id) as bijgerecht_count
      FROM recepten r
      LEFT JOIN ingredienten i ON r.id = i.recept_id
      LEFT JOIN bijgerechten b ON r.id = b.recept_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `
    return result
  } catch (error) {
    console.error("Error fetching recepten for admin:", error)
    return []
  }
}
