"use server"

import { supabase } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createRecept(formData: FormData) {
  try {
    const receptData = {
      naam: formData.get("naam") as string,
      beschrijving: formData.get("beschrijving") as string,
      bereidingstijd: Number.parseInt(formData.get("bereidingstijd") as string),
      moeilijkheidsgraad: formData.get("moeilijkheidsgraad") as string,
      type: formData.get("type") as string,
      seizoen: formData.get("seizoen") as string,
      tags: formData.get("tags") as string,
      afbeelding_url: formData.get("afbeelding_url") as string,
      bereidingswijze: formData.get("bereidingswijze") as string,
      personen: Number.parseInt(formData.get("personen") as string),
      eigenaar: formData.get("eigenaar") as string,
    }

    const { data: recept, error } = await supabase.from("recepten").insert(receptData).select().single()

    if (error) throw error

    // Handle ingredients
    const ingredientenData = formData.get("ingredienten") as string
    if (ingredientenData) {
      const ingredienten = JSON.parse(ingredientenData)
      const ingredientenToInsert = ingredienten.map((ing: any) => ({
        ...ing,
        recept_id: recept.id,
      }))

      const { error: ingredientenError } = await supabase.from("ingredienten").insert(ingredientenToInsert)

      if (ingredientenError) throw ingredientenError
    }

    // Handle bijgerechten
    const bijgerechtenData = formData.get("bijgerechten") as string
    if (bijgerechtenData) {
      const bijgerechten = JSON.parse(bijgerechtenData)
      const bijgerechtenToInsert = bijgerechten.map((bij: any) => ({
        ...bij,
        recept_id: recept.id,
      }))

      const { error: bijgerechtenError } = await supabase.from("bijgerechten").insert(bijgerechtenToInsert)

      if (bijgerechtenError) throw bijgerechtenError
    }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true, id: recept.id }
  } catch (error) {
    console.error("Error creating recept:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function updateRecept(id: string, formData: FormData) {
  try {
    const receptData = {
      naam: formData.get("naam") as string,
      beschrijving: formData.get("beschrijving") as string,
      bereidingstijd: Number.parseInt(formData.get("bereidingstijd") as string),
      moeilijkheidsgraad: formData.get("moeilijkheidsgraad") as string,
      type: formData.get("type") as string,
      seizoen: formData.get("seizoen") as string,
      tags: formData.get("tags") as string,
      afbeelding_url: formData.get("afbeelding_url") as string,
      bereidingswijze: formData.get("bereidingswijze") as string,
      personen: Number.parseInt(formData.get("personen") as string),
      eigenaar: formData.get("eigenaar") as string,
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
        ...ing,
        recept_id: id,
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
        ...bij,
        recept_id: id,
      }))

      const { error: bijgerechtenError } = await supabase.from("bijgerechten").insert(bijgerechtenToInsert)

      if (bijgerechtenError) throw bijgerechtenError
    }

    revalidatePath("/admin")
    revalidatePath("/")
    revalidatePath(`/recept/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating recept:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function deleteRecept(id: string) {
  try {
    // Delete related data first
    await supabase.from("ingredienten").delete().eq("recept_id", id)
    await supabase.from("bijgerechten").delete().eq("recept_id", id)

    // Delete the recipe
    const { error } = await supabase.from("recepten").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting recept:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
