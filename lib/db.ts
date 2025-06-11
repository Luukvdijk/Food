import { createClient } from "@supabase/supabase-js"

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set")
}

// Create Supabase client with service key for server-side operations
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// Create a wrapper function that mimics the neon sql template literal tag
export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  // Convert the template literal to a SQL string
  let query = strings[0]
  for (let i = 1; i < strings.length; i++) {
    query += `$${i}` + strings[i]
  }

  // Return a promise that executes the query
  return supabase
    .rpc("execute_sql", {
      query: query,
      params: values,
    })
    .then(({ data, error }) => {
      if (error) throw error
      return data
    })
}

// Export the supabase client for direct use
export { supabase }
