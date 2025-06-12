import { createClient } from "@supabase/supabase-js"
import {
  createServerComponentClient,
  createRouteHandlerClient,
  createMiddlewareClient,
} from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { NextRequest, NextResponse } from "next/server"

// Global singleton for service client
let serviceClient: ReturnType<typeof createClient> | null = null

// Global singleton for server component client
let serverClient: any = null

// Disable browser features for server-side clients
const serverOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    flowType: "pkce",
    debug: false,
    storageKey: `sb-${Math.random().toString(36).substring(2, 10)}`, // Random storage key to prevent conflicts
  },
}

export function getServiceClient() {
  if (!serviceClient) {
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
    const supabaseKey =
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

    serviceClient = createClient(supabaseUrl, supabaseKey, serverOptions)
  }
  return serviceClient
}

export function getServerClient() {
  if (typeof window !== "undefined") {
    console.warn("getServerClient should not be called from browser context")
  }

  if (!serverClient) {
    try {
      const cookieStore = cookies()
      serverClient = createServerComponentClient(
        { cookies: () => cookieStore },
        {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          options: serverOptions,
        },
      )
    } catch (error) {
      // Fallback to service client if cookies are not available
      return getServiceClient()
    }
  }
  return serverClient
}

// These should create new instances as they handle different request contexts
export function getRouteHandlerClient() {
  try {
    const cookieStore = cookies()
    return createRouteHandlerClient(
      { cookies: () => cookieStore },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        options: {
          ...serverOptions,
          storageKey: `sb-route-${Math.random().toString(36).substring(2, 10)}`,
        },
      },
    )
  } catch (error) {
    return getServiceClient()
  }
}

export function getMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createMiddlewareClient(
    { req, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      options: {
        ...serverOptions,
        storageKey: `sb-middleware-${Math.random().toString(36).substring(2, 10)}`,
      },
    },
  )
}

// Client-side singleton
let browserClient: any = null

export function getBrowserClient() {
  if (typeof window === "undefined") {
    console.warn("getBrowserClient should not be called from server context")
    return null
  }

  if (!browserClient) {
    const { createClientComponentClient } = require("@supabase/auth-helpers-nextjs")
    browserClient = createClientComponentClient()
  }
  return browserClient
}

// Reset function for testing
export function resetClients() {
  serviceClient = null
  serverClient = null
  browserClient = null
}
