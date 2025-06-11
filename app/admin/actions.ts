"use server"

import { supabase } from "@/lib/db"
import type { Recept, Ingredient, Bijgerecht } from "@/types"

export async function createRecept(data: Partial<Recept>): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const { data: newRecept, error } = await supabase
      .from("recepten")
      .insert({
        naam: data.naam,
        beschrijving: data.beschrijving,
        bereidingstijd: data.bereidingstijd,
        moeilijkheidsgraad: data.moeilijkheidsgraad,
        personen: data.personen,
        type: data.type,
        seizoen: data.seizoen || [],
        tags: data.tags || [],
        bereidingswijze: data.bereidingswijze || [],
        afbeelding_url: data.afbeelding_url,
        eigenaar: data.eigenaar || "henk",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, id: newRecept.id }
  } catch (error) {
    console.error("Error creating recept:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateRecept(id: number, data: Partial<Recept>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("recepten")
      .update({
        naam: data.naam,
        beschrijving: data.beschrijving,
        bereidingstijd: data.bereidingstijd,
        moeilijkheidsgraad: data.moeilijkheidsgraad,
        personen: data.personen,
        type: data.type,
        seizoen: data.seizoen || [],
        tags: data.tags || [],
        bereidingswijze: data.bereidingswijze || [],
        afbeelding_url: data.afbeelding_url,
        eigenaar: data.eigenaar,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error updating recept:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function deleteRecept(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // First delete related ingredients and side dishes
    await supabase.from("ingredienten").delete().eq("recept_id", id)
    await supabase.from("bijgerechten").delete().eq("recept_id", id)

    // Then delete the recipe
    const { error } = await supabase.from("recepten").delete().eq("id", id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error deleting recept:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
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
