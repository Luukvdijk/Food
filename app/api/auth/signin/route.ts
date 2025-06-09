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

    // Simpele authenticatie check (in productie zou dit beveiligd zijn)
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      // Set een cookie voor de sessie
      const response = NextResponse.json({ success: true })

      response.cookies.set("auth-token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dagen
        path: "/",
      })

      return response
    } else {
      return NextResponse.json({ error: "Ongeldige inloggegevens" }, { status: 401 })
    }
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: "Server fout" }, { status: 500 })
  }
}
