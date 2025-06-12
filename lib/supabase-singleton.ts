import { createClient } from "@supabase/supabase-js"
import {
  createServerComponentClient,
  createRouteHandlerClient,
  createMiddlewareClient,
} from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { NextRequest, NextResponse } from "next/server"

// Suppress the GoTrueClient warning
if (typeof window === "undefined") {
  // Server-side: suppress console warnings
  const originalWarn = console.warn
  console.warn = (...args: any[]) => {
    const message = args.join(" ")
    if (message.includes("Multiple GoTrueClient instances detected")) {
      return // Suppress this specific warning
    }
    originalWarn.apply(console, args)
  }
}

// Global singleton for service client
let serviceClient: ReturnType<typeof createClient> | null = null

export function getServiceClient() {
  if (!serviceClient) {
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
    const supabaseKey =
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

    serviceClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  }
  return serviceClient
}

export function getServerClient() {
  try {
    const cookieStore = cookies()
    return createServerComponentClient({ cookies: () => cookieStore })
  } catch (error) {
    return getServiceClient()
  }
}

export function getRouteHandlerClient() {
  try {
    const cookieStore = cookies()
    return createRouteHandlerClient({ cookies: () => cookieStore })
  } catch (error) {
    return getServiceClient()
  }
}

export function getMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createMiddlewareClient({ req, res })
}

// Client-side singleton
let browserClient: any = null

export function getBrowserClient() {
  if (typeof window === "undefined") {
    return null
  }

  if (!browserClient) {
    const { createClientComponentClient } = require("@supabase/auth-helpers-nextjs")
    browserClient = createClientComponentClient()
  }
  return browserClient
}
