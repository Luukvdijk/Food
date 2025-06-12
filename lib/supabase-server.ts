import {
  createServerComponentClient,
  createRouteHandlerClient,
  createMiddlewareClient,
} from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { NextRequest, NextResponse } from "next/server"

// Server component client singleton
let serverComponentClient: ReturnType<typeof createServerComponentClient> | null = null

export function getServerSupabaseClient() {
  if (!serverComponentClient) {
    const cookieStore = cookies()
    serverComponentClient = createServerComponentClient({ cookies: () => cookieStore })
  }
  return serverComponentClient
}

// Route handler client (creates new instance each time as required)
export function getRouteHandlerClient() {
  const cookieStore = cookies()
  return createRouteHandlerClient({ cookies: () => cookieStore })
}

// Middleware client (creates new instance each time as required)
export function getMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createMiddlewareClient({ req, res })
}

// Reset singleton (useful for testing or when cookies change)
export function resetServerClient() {
  serverComponentClient = null
}
