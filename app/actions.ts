"use server"

import { supabase } from "@/lib/db"
import type { Recept } from "@/types"
import { revalidatePath } from "next/cache"

export async function getAllRecepten(): Promise<Recept[]> {
  try {
    const { data, error } = await supabase
      .from("recepten")
      .select(`
        *,
        ingredienten (*),
        bijgerechten (*)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error fetching recepten:", error)
    return []
  }
}

export async function getReceptById(id: string): Promise<Recept | null> {
  try {
    const { data, error } = await supabase
      .from("recepten")
      .select(`
        *,
        ingredienten (*),
        bijgerechten (*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error fetching recept:", error)
    return null
  }
}

export async function searchRecepten(query: string): Promise<Recept[]> {
  try {
    const { data, error } = await supabase
      .from("recepten")
      .select(`
        *,
        ingredienten (*),
        bijgerechten (*)
      `)
      .or(`naam.ilike.%${query}%, beschrijving.ilike.%${query}%, tags.ilike.%${query}%`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error searching recepten:", error)
    return []
  }
}

export async function getReceptenByFilters(filters: {
  type?: string
  seizoen?: string
  moeilijkheidsgraad?: string
  eigenaar?: string
}): Promise<Recept[]> {
  try {
    let query = supabase.from("recepten").select(`
        *,
        ingredienten (*),
        bijgerechten (*)
      `)

    if (filters.type) {
      query = query.eq("type", filters.type)
    }
    if (filters.seizoen) {
      query = query.contains("seizoen", [filters.seizoen])
    }
    if (filters.moeilijkheidsgraad) {
      query = query.eq("moeilijkheidsgraad", filters.moeilijkheidsgraad)
    }
    if (filters.eigenaar) {
      query = query.eq("eigenaar", filters.eigenaar)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error filtering recepten:", error)
    return []
  }
}

export async function getRandomRecept(): Promise<Recept | null> {
  try {
    // Get total count first
    const { count, error: countError } = await supabase.from("recepten").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Supabase count error:", countError)
      throw countError
    }
    if (!count || count === 0) return null

    // Get random offset
    const randomOffset = Math.floor(Math.random() * count)

    const { data, error } = await supabase
      .from("recepten")
      .select(`
        *,
        ingredienten (*),
        bijgerechten (*)
      `)
      .range(randomOffset, randomOffset)
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Error fetching random recept:", error)
    return null
  }
}

export async function refreshHomepage() {
  "use server"

  // Revalidate the homepage to force a fresh random recipe
  revalidatePath("/")

  // Return success
  return { success: true }
}

export async function checkDatabaseStatus() {
  try {
    const { data, error } = await supabase.from("recepten").select("id", { count: "exact", head: true })

    if (error) {
      return {
        tableExists: false,
        hasData: false,
        error: error.message,
      }
    }

    return {
      tableExists: true,
      hasData: (data?.length || 0) > 0,
    }
  } catch (error) {
    return {
      tableExists: false,
      hasData: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getEigenaars(): Promise<string[]> {
  try {
    const { data, error } = await supabase.from("recepten").select("eigenaar").not("eigenaar", "is", null)

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    const eigenaars = [...new Set(data?.map((r) => r.eigenaar).filter(Boolean))] as string[]
    return eigenaars.sort()
  } catch (error) {
    console.error("Error fetching eigenaars:", error)
    return []
  }
}
