import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Auth status error:", error)
      return NextResponse.json({ isAuthenticated: false, user: null })
    }

    const isAuthenticated = !!session?.user

    return NextResponse.json({
      isAuthenticated,
      user: isAuthenticated
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email,
          }
        : null,
    })
  } catch (error) {
    console.error("Auth status error:", error)
    return NextResponse.json({ isAuthenticated: false, user: null })
  }
}
