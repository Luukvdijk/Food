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
  if (!serverClient) {
    try {
      const cookieStore = cookies()
      serverClient = createServerComponentClient(
        {
          cookies: () => cookieStore,
        },
        {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
      {
        cookies: () => cookieStore,
      },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    )
  } catch (error) {
    return getServiceClient()
  }
}

export function getMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createMiddlewareClient(
    {
      req,
      res,
    },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  )
}

// Reset function for testing
export function resetClients() {
  serviceClient = null
  serverClient = null
}
