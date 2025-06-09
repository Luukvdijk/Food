import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Demo gebruiker - in productie zou dit uit een database komen
const DEMO_USER = {
  email: "admin@recepten.nl",
  password: "admin123",
  id: "1",
  name: "Admin",
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Simpele authenticatie check (in productie zou dit beveiligd zijn)
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      // Set een cookie voor de sessie
      const cookieStore = cookies()
      cookieStore.set("auth-token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dagen
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Ongeldige inloggegevens" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Server fout" }, { status: 500 })
  }
}
