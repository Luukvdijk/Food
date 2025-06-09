import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient()

    // Get the access token to sign out properly
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (accessToken) {
      // Sign out from Supabase
      await supabase.auth.signOut()
    }

    // Clear cookies
    const response = NextResponse.json({ success: true })
    response.cookies.delete("sb-access-token")
    response.cookies.delete("sb-refresh-token")

    return response
  } catch (error) {
    console.error("Signout error:", error)
    // Still clear cookies even if Supabase signout fails
    const response = NextResponse.json({ success: true })
    response.cookies.delete("sb-access-token")
    response.cookies.delete("sb-refresh-token")
    return response
  }
}
