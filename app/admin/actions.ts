"use server"

import { sql } from "@/lib/db"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import type { GerechtsType, Seizoen, Eigenaar } from "@/types"

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
  eigenaar: Eigenaar
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
    const eigenaar = (formData.get("eigenaar") as Eigenaar) || "henk"

    // Validatie
    if (!naam || !beschrijving || !bereidingstijd || !type) {
      console.error("Missing required fields")
      redirect("/admin?error=missing_fields")
    }

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

    if (bereidingswijze.length === 0) {
      console.error("No preparation steps provided")
      redirect("/admin?error=missing_steps")
    }

    // Parse ingrediënten
    const ingredientenString = formData.get("ingredienten") as string
    const ingredientenLines = ingredientenString.split("\n").filter((line) => line.trim())

    if (ingredientenLines.length === 0) {
      console.error("No ingredients provided")
      redirect("/admin?error=missing_ingredients")
    }

    // Parse bijgerechten
    const bijgerechtenString = formData.get("bijgerechten") as string
    const bijgerechtenLines = bijgerechtenString.split("\n").filter((line) => line.trim())

    // Check if eigenaar column exists
    let hasEigenaarColumn = false
    try {
      const columnCheck = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'recepten' AND column_name = 'eigenaar'
      `
      hasEigenaarColumn = columnCheck.length > 0
    } catch (error) {
      console.error("Error checking eigenaar column:", error)
    }

    console.log("Adding recipe:", { naam, type, eigenaar, hasEigenaarColumn })

    // Voeg het recept toe
    let receptResult
    if (hasEigenaarColumn) {
      receptResult = await sql`
        INSERT INTO recepten (naam, beschrijving, bereidingstijd, moeilijkheidsgraad, type, seizoen, tags, afbeelding_url, bereidingswijze, personen, eigenaar)
        VALUES (${naam}, ${beschrijving}, ${bereidingstijd}, ${moeilijkheidsgraad}, ${type}, ${seizoen}, ${tags}, ${afbeelding_url || null}, ${bereidingswijze}, ${personen}, ${eigenaar})
        RETURNING id
      `
    } else {
      receptResult = await sql`
        INSERT INTO recepten (naam, beschrijving, bereidingstijd, moeilijkheidsgraad, type, seizoen, tags, afbeelding_url, bereidingswijze, personen)
        VALUES (${naam}, ${beschrijving}, ${bereidingstijd}, ${moeilijkheidsgraad}, ${type}, ${seizoen}, ${tags}, ${afbeelding_url || null}, ${bereidingswijze}, ${personen})
        RETURNING id
      `
    }

    const receptId = receptResult[0].id
    console.log("Recipe added with ID:", receptId)

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

    console.log("Recipe successfully added, revalidating paths")
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/zoeken")

    console.log("Redirecting to success page")
    redirect("/admin?success=true")
  } catch (error) {
    console.error("Error adding recept:", error)
    redirect("/admin?error=add_failed")
  }
}

export async function updateRecept(formData: FormData) {
  try {
    const id = Number.parseInt(formData.get("id") as string)
    const naam = formData.get("naam") as string
    const beschrijving = formData.get("beschrijving") as string
    const bereidingstijd = Number.parseInt(formData.get("bereidingstijd") as string)
    const moeilijkheidsgraad = formData.get("moeilijkheidsgraad") as string
    const type = formData.get("type") as GerechtsType
    const personen = Number.parseInt(formData.get("personen") as string)
    const afbeelding_url = formData.get("afbeelding_url") as string
    const eigenaar = (formData.get("eigenaar") as Eigenaar) || "henk"

    console.log("Updating recipe:", { id, naam, type, eigenaar })

    // Validatie
    if (!id || !naam || !beschrijving || !bereidingstijd || !type) {
      console.error("Missing required fields for update")
      redirect("/admin?error=missing_fields")
    }

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

    // Check if eigenaar column exists
    let hasEigenaarColumn = false
    try {
      const columnCheck = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'recepten' AND column_name = 'eigenaar'
      `
      hasEigenaarColumn = columnCheck.length > 0
    } catch (error) {
      console.error("Error checking eigenaar column:", error)
    }

    // Update het recept
    if (hasEigenaarColumn) {
      await sql`
        UPDATE recepten 
        SET naam = ${naam}, beschrijving = ${beschrijving}, bereidingstijd = ${bereidingstijd}, 
            moeilijkheidsgraad = ${moeilijkheidsgraad}, type = ${type}, seizoen = ${seizoen}, 
            tags = ${tags}, afbeelding_url = ${afbeelding_url || null}, bereidingswijze = ${bereidingswijze}, 
            personen = ${personen}, eigenaar = ${eigenaar}
        WHERE id = ${id}
      `
    } else {
      await sql`
        UPDATE recepten 
        SET naam = ${naam}, beschrijving = ${beschrijving}, bereidingstijd = ${bereidingstijd}, 
            moeilijkheidsgraad = ${moeilijkheidsgraad}, type = ${type}, seizoen = ${seizoen}, 
            tags = ${tags}, afbeelding_url = ${afbeelding_url || null}, bereidingswijze = ${bereidingswijze}, 
            personen = ${personen}
        WHERE id = ${id}
      `
    }

    // Verwijder bestaande ingrediënten en bijgerechten
    await sql`DELETE FROM ingredienten WHERE recept_id = ${id}`
    await sql`DELETE FROM bijgerechten WHERE recept_id = ${id}`

    // Voeg nieuwe ingrediënten toe
    for (const line of ingredientenLines) {
      const parts = line.split("|").map((p) => p.trim())
      if (parts.length >= 3) {
        const [hoeveelheid, eenheid, naam, notitie] = parts
        await sql`
          INSERT INTO ingredienten (recept_id, naam, hoeveelheid, eenheid, notitie)
          VALUES (${id}, ${naam}, ${Number.parseFloat(hoeveelheid)}, ${eenheid}, ${notitie || null})
        `
      }
    }

    // Voeg nieuwe bijgerechten toe
    for (const line of bijgerechtenLines) {
      const parts = line.split("|").map((p) => p.trim())
      if (parts.length >= 2) {
        const [naam, beschrijving] = parts
        await sql`
          INSERT INTO bijgerechten (recept_id, naam, beschrijving)
          VALUES (${id}, ${naam}, ${beschrijving})
        `
      }
    }

    console.log("Recipe successfully updated, revalidating paths")
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/zoeken")
    revalidatePath(`/recept/${id}`)

    console.log("Redirecting to updated success page")
    redirect("/admin?updated=true")
  } catch (error) {
    console.error("Error updating recept:", error)
    redirect("/admin?error=update_failed")
  }
}

export async function deleteRecept(receptId: number) {
  try {
    console.log("Deleting recipe:", receptId)

    await sql`DELETE FROM recepten WHERE id = ${receptId}`

    console.log("Recipe successfully deleted, revalidating paths")
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/zoeken")

    console.log("Redirecting to deleted success page")
    redirect("/admin?deleted=true")
  } catch (error) {
    console.error("Error deleting recept:", error)
    redirect("/admin?error=delete_failed")
  }
}

export async function getAllReceptenAdmin() {
  try {
    // Check if eigenaar column exists
    let hasEigenaarColumn = false
    try {
      const columnCheck = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'recepten' AND column_name = 'eigenaar'
      `
      hasEigenaarColumn = columnCheck.length > 0
    } catch (error) {
      console.error("Error checking eigenaar column:", error)
    }

    let result
    if (hasEigenaarColumn) {
      result = await sql`
        SELECT r.*, 
               COUNT(DISTINCT i.id) as ingredient_count,
               COUNT(DISTINCT b.id) as bijgerecht_count
        FROM recepten r
        LEFT JOIN ingredienten i ON r.id = i.recept_id
        LEFT JOIN bijgerechten b ON r.id = b.recept_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `
    } else {
      result = await sql`
        SELECT r.*, 
               COUNT(DISTINCT i.id) as ingredient_count,
               COUNT(DISTINCT b.id) as bijgerecht_count
        FROM recepten r
        LEFT JOIN ingredienten i ON r.id = i.recept_id
        LEFT JOIN bijgerechten b ON r.id = b.recept_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `
      // Add default eigenaar
      result = result.map((r: any) => ({ ...r, eigenaar: "henk" }))
    }

    return result
  } catch (error) {
    console.error("Error fetching recepten for admin:", error)
    throw new Error("Database connection failed")
  }
}

export async function getReceptForEdit(id: number) {
  try {
    const [recept] = await sql`SELECT * FROM recepten WHERE id = ${id}`
    if (!recept) {
      return null
    }

    const ingredienten = await sql`SELECT * FROM ingredienten WHERE recept_id = ${id} ORDER BY id`
    const bijgerechten = await sql`SELECT * FROM bijgerechten WHERE recept_id = ${id} ORDER BY id`

    // Check if eigenaar column exists
    let hasEigenaarColumn = false
    try {
      const columnCheck = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'recepten' AND column_name = 'eigenaar'
      `
      hasEigenaarColumn = columnCheck.length > 0
    } catch (error) {
      console.error("Error checking eigenaar column:", error)
    }

    // Add default eigenaar if column doesn't exist
    if (!hasEigenaarColumn && recept) {
      recept.eigenaar = "henk"
    }

    return {
      recept,
      ingredienten,
      bijgerechten,
    }
  } catch (error) {
    console.error("Error fetching recept for edit:", error)
    throw new Error("Failed to load recipe for editing")
  }
}
