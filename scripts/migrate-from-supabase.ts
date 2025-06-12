import { createClient } from "@supabase/supabase-js"
import { sql } from "@/lib/db"

export async function migrateFromSupabase() {
  try {
    // Create a direct connection to Supabase
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

    // Fetch all recipes from Supabase
    const { data: recepten, error: receptenError } = await supabase.from("recepten").select("*")

    if (receptenError) throw receptenError

    // Clear existing recipes in the application database
    await sql`TRUNCATE TABLE recepten CASCADE`

    // Insert recipes from Supabase
    for (const recept of recepten) {
      await sql`
        INSERT INTO recepten (
          id, naam, beschrijving, bereidingstijd, moeilijkheidsgraad, 
          type, seizoen, tags, afbeelding_url, bereidingswijze, 
          personen, eigenaar, created_at
        ) VALUES (
          ${recept.id}, ${recept.naam}, ${recept.beschrijving}, 
          ${recept.bereidingstijd}, ${recept.moeilijkheidsgraad}, 
          ${recept.type}, ${recept.seizoen}, ${recept.tags}, 
          ${recept.afbeelding_url}, ${recept.bereidingswijze}, 
          ${recept.personen}, ${recept.eigenaar}, ${recept.created_at}
        )
      `
    }

    // Fetch and migrate ingredients
    const { data: ingredienten, error: ingredientenError } = await supabase.from("ingredienten").select("*")

    if (ingredientenError) throw ingredientenError

    for (const ingredient of ingredienten) {
      await sql`
        INSERT INTO ingredienten (
          id, recept_id, naam, hoeveelheid, eenheid, notitie, created_at
        ) VALUES (
          ${ingredient.id}, ${ingredient.recept_id}, ${ingredient.naam}, 
          ${ingredient.hoeveelheid}, ${ingredient.eenheid}, 
          ${ingredient.notitie}, ${ingredient.created_at}
        )
      `
    }

    // Fetch and migrate side dishes
    const { data: bijgerechten, error: bijgerechtenError } = await supabase.from("bijgerechten").select("*")

    if (bijgerechtenError) throw bijgerechtenError

    for (const bijgerecht of bijgerechten) {
      await sql`
        INSERT INTO bijgerechten (
          id, recept_id, naam, beschrijving, created_at
        ) VALUES (
          ${bijgerecht.id}, ${bijgerecht.recept_id}, ${bijgerecht.naam}, 
          ${bijgerecht.beschrijving}, ${bijgerecht.created_at}
        )
      `
    }

    return { success: true, message: "Data successfully migrated from Supabase" }
  } catch (error) {
    console.error("Error migrating data from Supabase:", error)
    return {
      success: false,
      message: `Error migrating data: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
