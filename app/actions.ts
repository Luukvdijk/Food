"use server"

import { sql } from "@/lib/db"
import type { FilterOptions, Recept, Ingredient, Bijgerecht, Eigenaar } from "@/types"

export async function getRandomRecept(eigenaar?: Eigenaar | null): Promise<Recept | null> {
  try {
    // First check if eigenaar column exists
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'recepten' AND column_name = 'eigenaar'
    `

    const hasEigenaarColumn = columnCheck.length > 0

    let query
    if (eigenaar && hasEigenaarColumn) {
      query = sql`
        SELECT * FROM recepten 
        WHERE eigenaar = ${eigenaar}
        ORDER BY RANDOM() 
        LIMIT 1
      `
    } else {
      query = sql`
        SELECT * FROM recepten 
        ORDER BY RANDOM() 
        LIMIT 1
      `
    }

    const result = await query

    if (result.length === 0) {
      return null
    }

    // Add default eigenaar if column doesn't exist
    const recept = result[0] as Recept
    if (!hasEigenaarColumn) {
      recept.eigenaar = "henk"
    }

    return recept
  } catch (error) {
    console.error("Error fetching random recept:", error)
    return null
  }
}

export async function getReceptById(id: number): Promise<Recept | null> {
  try {
    const result = await sql`
      SELECT * FROM recepten 
      WHERE id = ${id}
    `

    if (result.length === 0) {
      return null
    }

    return result[0] as Recept
  } catch (error) {
    console.error("Error fetching recept by id:", error)
    return null
  }
}

export async function getIngredienten(receptId: number): Promise<Ingredient[]> {
  try {
    const result = await sql`
      SELECT * FROM ingredienten 
      WHERE recept_id = ${receptId}
      ORDER BY id
    `

    return result as Ingredient[]
  } catch (error) {
    console.error("Error fetching ingredienten:", error)
    return []
  }
}

export async function getBijgerechten(receptId: number): Promise<Bijgerecht[]> {
  try {
    const result = await sql`
      SELECT * FROM bijgerechten 
      WHERE recept_id = ${receptId}
      ORDER BY id
    `

    return result as Bijgerecht[]
  } catch (error) {
    console.error("Error fetching bijgerechten:", error)
    return []
  }
}

export async function zoekRecepten(options: FilterOptions): Promise<Recept[]> {
  try {
    // Check if eigenaar column exists
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'recepten' AND column_name = 'eigenaar'
    `

    const hasEigenaarColumn = columnCheck.length > 0

    if (!options.type && !options.seizoen && (!options.eigenaar || !hasEigenaarColumn) && !options.zoekterm) {
      // No filters, return all recipes
      const result = await sql`
        SELECT * FROM recepten 
        ORDER BY naam
      `
      return (result as Recept[]).map((r) => ({
        ...r,
        eigenaar: r.eigenaar || "henk",
      }))
    }

    const conditions: string[] = []
    const values: any[] = []

    if (options.type) {
      conditions.push(`type = $${values.length + 1}`)
      values.push(options.type)
    }

    if (options.seizoen) {
      conditions.push(`$${values.length + 1} = ANY(seizoen)`)
      values.push(options.seizoen)
    }

    if (options.eigenaar && hasEigenaarColumn) {
      conditions.push(`eigenaar = $${values.length + 1}`)
      values.push(options.eigenaar)
    }

    if (options.zoekterm) {
      conditions.push(`(naam ILIKE $${values.length + 1} OR beschrijving ILIKE $${values.length + 2})`)
      values.push(`%${options.zoekterm}%`, `%${options.zoekterm}%`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    const result = await sql`
      SELECT * FROM recepten 
      ${sql.unsafe(whereClause)}
      ORDER BY naam
    `

    return (result as Recept[]).map((r) => ({
      ...r,
      eigenaar: r.eigenaar || "henk",
    }))
  } catch (error) {
    console.error("Error searching recepten:", error)
    return []
  }
}

export async function getAllRecepten(): Promise<Recept[]> {
  try {
    const result = await sql`
      SELECT * FROM recepten 
      ORDER BY created_at DESC
    `
    return result as Recept[]
  } catch (error) {
    console.error("Error fetching all recepten:", error)
    return []
  }
}

export async function checkDatabaseStatus(): Promise<{ hasData: boolean; tableExists: boolean }> {
  try {
    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'recepten'
      );
    `

    const tableExists = tableCheck[0]?.exists || false

    if (!tableExists) {
      return { hasData: false, tableExists: false }
    }

    // Check if we have data
    const dataCheck = await sql`
      SELECT COUNT(*) as count FROM recepten
    `

    const hasData = (dataCheck[0]?.count || 0) > 0

    return { hasData, tableExists }
  } catch (error) {
    console.error("Error checking database status:", error)
    return { hasData: false, tableExists: false }
  }
}
