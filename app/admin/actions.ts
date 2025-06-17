"use server"

import { supabase } from "@/lib/db"
import type { Ingredient, Bijgerecht } from "@/types"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addRecept(formData: FormData): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    console.log("Starting addRecept with formData:", Object.fromEntries(formData.entries()))

    // First, let's check what columns exist in the recepten table
    const { data: tableInfo, error: tableError } = await supabase.from("recepten").select("*").limit(1)

    if (tableError) {
      console.error("Error checking table schema:", tableError)
    } else {
      console.log("Table schema check - sample row:", tableInfo)
    }

    const receptData = {
      naam: formData.get("naam") as string,
      beschrijving: formData.get("beschrijving") as string,
      bereidingstijd: Number.parseInt(formData.get("bereidingstijd") as string),
      moeilijkheidsgraad: formData.get("moeilijkheidsgraad") as string,
      type: formData.get("type") as string,
      seizoen: (formData.get("seizoen") as string)?.split(",").map((s) => s.trim()) || [],
      tags:
        (formData.get("tags") as string)
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
      afbeelding_url: (formData.get("afbeelding_url") as string) || null,
      bereidingswijze: (formData.get("bereidingswijze") as string)?.split("\n").filter((line) => line.trim()) || [],
      personen: Number.parseInt(formData.get("personen") as string),
      eigenaar: formData.get("eigenaar") as string,
      // Remove created_at and updated_at - let the database handle these with defaults
    }

    console.log("Inserting recept data:", receptData)

    const { data: recept, error } = await supabase.from("recepten").insert(receptData).select().single()

    if (error) {
      console.error("Supabase insert error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("Recipe inserted successfully:", recept)

    // Handle ingredients
    const ingredientenData = formData.get("ingredienten") as string
    if (ingredientenData) {
      console.log("Processing ingredients:", ingredientenData)
      try {
        const ingredienten = JSON.parse(ingredientenData)
        const ingredientenToInsert = ingredienten.map((ing: any) => ({
          recept_id: recept.id,
          naam: ing.naam,
          hoeveelheid: Number.parseFloat(ing.hoeveelheid) || 0,
          eenheid: ing.eenheid,
          notitie: ing.notitie || null,
        }))

        console.log("Inserting ingredients:", ingredientenToInsert)
        const { error: ingredientenError } = await supabase.from("ingredienten").insert(ingredientenToInsert)

        if (ingredientenError) {
          console.error("Ingredients insert error:", ingredientenError)
          throw new Error(`Ingredients error: ${ingredientenError.message}`)
        }
      } catch (parseError) {
        console.error("Error parsing ingredients:", parseError)
        throw new Error(
          `Invalid ingredients format: ${parseError instanceof Error ? parseError.message : "Unknown parsing error"}`,
        )
      }
    }

    // Handle bijgerechten
    const bijgerechtenData = formData.get("bijgerechten") as string
    if (bijgerechtenData) {
      console.log("Processing bijgerechten:", bijgerechtenData)
      try {
        const bijgerechten = JSON.parse(bijgerechtenData)
        const bijgerechtenToInsert = bijgerechten.map((bij: any) => ({
          recept_id: recept.id,
          naam: bij.naam,
          beschrijving: bij.beschrijving,
        }))

        console.log("Inserting bijgerechten:", bijgerechtenToInsert)
        const { error: bijgerechtenError } = await supabase.from("bijgerechten").insert(bijgerechtenToInsert)

        if (bijgerechtenError) {
          console.error("Bijgerechten insert error:", bijgerechtenError)
          throw new Error(`Bijgerechten error: ${bijgerechtenError.message}`)
        }
      } catch (parseError) {
        console.error("Error parsing bijgerechten:", parseError)
        throw new Error(
          `Invalid bijgerechten format: ${parseError instanceof Error ? parseError.message : "Unknown parsing error"}`,
        )
      }
    }

    console.log("Revalidating paths...")
    revalidatePath("/admin")
    revalidatePath("/")

    console.log("Redirecting to admin page...")
    redirect("/admin?success=added")

    return { success: true, id: recept.id }
  } catch (error) {
    console.error("Error creating recept:", error)

    // Don't throw redirect errors
    if (
      error instanceof Error &&
      (error.message.includes("NEXT_REDIRECT") || error.digest?.includes("NEXT_REDIRECT"))
    ) {
      throw error // Re-throw redirect errors
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Keep createRecept as an alias for backward compatibility
export const createRecept = addRecept

export async function updateRecept(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const receptData = {
      naam: formData.get("naam") as string,
      beschrijving: formData.get("beschrijving") as string,
      bereidingstijd: Number.parseInt(formData.get("bereidingstijd") as string),
      moeilijkheidsgraad: formData.get("moeilijkheidsgraad") as string,
      type: formData.get("type") as string,
      seizoen: (formData.get("seizoen") as string)?.split(",").map((s) => s.trim()) || [],
      tags:
        (formData.get("tags") as string)
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
      afbeelding_url: (formData.get("afbeelding_url") as string) || null,
      bereidingswijze: (formData.get("bereidingswijze") as string)?.split("\n").filter((line) => line.trim()) || [],
      personen: Number.parseInt(formData.get("personen") as string),
      eigenaar: formData.get("eigenaar") as string,
      // Remove updated_at - let the database handle this
    }

    const { error } = await supabase.from("recepten").update(receptData).eq("id", id)

    if (error) throw error

    // Update ingredients
    const ingredientenData = formData.get("ingredienten") as string
    if (ingredientenData) {
      // Delete existing ingredients
      await supabase.from("ingredienten").delete().eq("recept_id", id)

      // Insert new ingredients
      const ingredienten = JSON.parse(ingredientenData)
      const ingredientenToInsert = ingredienten.map((ing: any) => ({
        recept_id: id,
        naam: ing.naam,
        hoeveelheid: Number.parseFloat(ing.hoeveelheid) || 0,
        eenheid: ing.eenheid,
        notitie: ing.notitie || null,
      }))

      const { error: ingredientenError } = await supabase.from("ingredienten").insert(ingredientenToInsert)

      if (ingredientenError) throw ingredientenError
    }

    // Update bijgerechten
    const bijgerechtenData = formData.get("bijgerechten") as string
    if (bijgerechtenData) {
      // Delete existing bijgerechten
      await supabase.from("bijgerechten").delete().eq("recept_id", id)

      // Insert new bijgerechten
      const bijgerechten = JSON.parse(bijgerechtenData)
      const bijgerechtenToInsert = bijgerechten.map((bij: any) => ({
        recept_id: id,
        naam: bij.naam,
        beschrijving: bij.beschrijving,
      }))

      const { error: bijgerechtenError } = await supabase.from("bijgerechten").insert(bijgerechtenToInsert)

      if (bijgerechtenError) throw bijgerechtenError
    }

    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath(`/recept/${id}`)
    redirect(`/admin?success=updated`)
    return { success: true }
  } catch (error) {
    console.error("Error updating recept:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function deleteRecept(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete related data first
    await supabase.from("ingredienten").delete().eq("recept_id", id)
    await supabase.from("bijgerechten").delete().eq("recept_id", id)

    // Delete the recipe
    const { error } = await supabase.from("recepten").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/admin")
    revalidatePath("/")
    redirect("/admin?success=deleted")
    return { success: true }
  } catch (error) {
    console.error("Error deleting recept:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function addIngredient(
  data: Partial<Ingredient>,
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const { data: newIngredient, error } = await supabase
      .from("ingredienten")
      .insert({
        recept_id: data.recept_id,
        naam: data.naam,
        hoeveelheid: data.hoeveelheid,
        eenheid: data.eenheid,
        notitie: data.notitie || null,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, id: newIngredient.id }
  } catch (error) {
    console.error("Error adding ingredient:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateIngredient(
  id: number,
  data: Partial<Ingredient>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("ingredienten")
      .update({
        naam: data.naam,
        hoeveelheid: data.hoeveelheid,
        eenheid: data.eenheid,
        notitie: data.notitie || null,
      })
      .eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error updating ingredient:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function deleteIngredient(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("ingredienten").delete().eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error deleting ingredient:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function addBijgerecht(
  data: Partial<Bijgerecht>,
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const { data: newBijgerecht, error } = await supabase
      .from("bijgerechten")
      .insert({
        recept_id: data.recept_id,
        naam: data.naam,
        beschrijving: data.beschrijving,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, id: newBijgerecht.id }
  } catch (error) {
    console.error("Error adding bijgerecht:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateBijgerecht(
  id: number,
  data: Partial<Bijgerecht>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("bijgerechten")
      .update({
        naam: data.naam,
        beschrijving: data.beschrijving,
      })
      .eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error updating bijgerecht:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function deleteBijgerecht(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("bijgerechten").delete().eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error deleting bijgerecht:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
