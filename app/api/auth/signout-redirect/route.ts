import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    await supabase.auth.signOut()

    return NextResponse.redirect(new URL("/auth/signin", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
  } catch (error) {
    console.error("Signout redirect error:", error)
    return NextResponse.redirect(new URL("/auth/signin", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
  }
}
