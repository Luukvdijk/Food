"use server"

import { supabase } from "@/lib/supabase"
import type { FilterOptions, Recept, Ingredient, Bijgerecht } from "@/types"

export async function getRandomRecept(): Promise<Recept | null> {
  const { data, error } = await supabase.from("recepten").select("*").order("id", { ascending: false }).limit(50)

  if (error || !data || data.length === 0) {
    console.error("Error fetching random recept:", error)
    return null
  }

  const randomIndex = Math.floor(Math.random() * data.length)
  return data[randomIndex] as Recept
}

export async function getReceptById(id: number): Promise<Recept | null> {
  const { data, error } = await supabase.from("recepten").select("*").eq("id", id).single()

  if (error || !data) {
    console.error("Error fetching recept by id:", error)
    return null
  }

  return data as Recept
}

export async function getIngredienten(receptId: number): Promise<Ingredient[]> {
  const { data, error } = await supabase.from("ingredienten").select("*").eq("recept_id", receptId)

  if (error || !data) {
    console.error("Error fetching ingredienten:", error)
    return []
  }

  return data as Ingredient[]
}

export async function getBijgerechten(receptId: number): Promise<Bijgerecht[]> {
  const { data, error } = await supabase.from("bijgerechten").select("*").eq("recept_id", receptId)

  if (error || !data) {
    console.error("Error fetching bijgerechten:", error)
    return []
  }

  return data as Bijgerecht[]
}

export async function zoekRecepten(options: FilterOptions): Promise<Recept[]> {
  let query = supabase.from("recepten").select("*")

  if (options.type) {
    query = query.eq("type", options.type)
  }

  if (options.seizoen) {
    query = query.contains("seizoen", [options.seizoen])
  }

  if (options.zoekterm) {
    query = query.or(`naam.ilike.%${options.zoekterm}%,beschrijving.ilike.%${options.zoekterm}%`)
  }

  const { data, error } = await query.order("naam")

  if (error || !data) {
    console.error("Error searching recepten:", error)
    return []
  }

  return data as Recept[]
}
