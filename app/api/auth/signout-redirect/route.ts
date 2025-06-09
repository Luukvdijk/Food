import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient()

    // Get the access token to sign out properly
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (accessToken) {
      // Sign out from Supabase
      await supabase.auth.signOut()
    }
  } catch (error) {
    console.error("Signout error:", error)
  }

  // Clear cookies and redirect
  const response = NextResponse.redirect(
    new URL("/auth/signin", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  )
  response.cookies.delete("sb-access-token")
  response.cookies.delete("sb-refresh-token")

  return response
}
