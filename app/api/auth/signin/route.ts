import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email en wachtwoord zijn verplicht" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Supabase auth error:", error)
      return NextResponse.json({ error: "Ongeldige inloggegevens" }, { status: 401 })
    }

    if (data.user) {
      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email,
        },
      })
    }

    return NextResponse.json({ error: "Inloggen mislukt" }, { status: 401 })
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: "Server fout" }, { status: 500 })
  }
}
