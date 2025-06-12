import { getBrowserClient } from "./supabase-singleton"

export function getSupabaseClient() {
  return getBrowserClient()
}
