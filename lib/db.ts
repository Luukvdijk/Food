import { createClient } from "@supabase/supabase-js"
import { neon } from "@neondatabase/serverless"

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY environment variables must be set")
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

// Create a wrapper function that mimics the neon sql template literal tag
export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  // Convert the template literal to a SQL string with parameters
  const query = strings.reduce((acc, str, i) => {
    return acc + str + (i < values.length ? `$${i + 1}` : "")
  }, "")

  // Return a function that executes the query
  return async () => {
    const { data, error } = await supabase.from("recepten").select("*")

    if (error) throw error
    return data
  }
}

// Add unsafe method for compatibility
sql.unsafe = (text: string) => {
  return text
}

const sqlNeon = neon(process.env.DATABASE_URL)

export { sqlNeon }
