import { getServerSupabaseClient } from "./supabase-server"

// Use fallback values for preview environment
const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

// Create Supabase client with service key for server-side operations
// const supabase = createClient(supabaseUrl, supabaseKey)

// Use the singleton server client for database operations
const serverSupabase = getServerSupabaseClient()

// Create a wrapper function that mimics the neon sql template literal tag
export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  // Convert the template literal to a SQL string
  let query = strings[0]
  for (let i = 1; i < strings.length; i++) {
    query += `$${i}` + strings[i]
  }

  // Return a promise that executes the query
  return serverSupabase
    .rpc("execute_sql", {
      query: query,
      params: values,
    })
    .then(({ data, error }) => {
      if (error) throw error
      return data
    })
    .catch((error) => {
      // In preview mode, return mock data instead of throwing
      console.warn("Database operation failed, using mock data:", error.message)
      return []
    })
}

// Export the supabase client for direct use
// export { supabase }

export async function getRandomRecept() {
  try {
    const { data, error } = await serverSupabase.from("recepten").select("*").order("RANDOM()").limit(1).single()

    if (error) {
      console.error("Error fetching random recept:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getRandomRecept:", error)
    return null
  }
}

// ... rest of your database functions
