import { type NextRequest, NextResponse } from "next/server"

// Demo gebruiker - in productie zou dit uit een database komen
const DEMO_USER = {
  email: "admin@recepten.nl",
  password: "Bonappetit",
  id: "1",
  name: "Admin",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email en wachtwoord zijn verplicht" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Supabase auth error:", error)
      return NextResponse.json(
        {
          error: error.message === "Invalid login credentials" ? "Ongeldige inloggegevens" : "Inloggen mislukt",
        },
        { status: 401 },
      )
    }

    if (!data.user || !data.session) {
      return NextResponse.json({ error: "Inloggen mislukt" }, { status: 401 })
    }

    // Set secure cookies for the session
    const response = NextResponse.json({ success: true })

    // Set access token cookie
    response.cookies.set("sb-access-token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: data.session.expires_in,
      path: "/",
    })

    // Set refresh token cookie
    response.cookies.set("sb-refresh-token", data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: "Server fout" }, { status: 500 })
  }
}
