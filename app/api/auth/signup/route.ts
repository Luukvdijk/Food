import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Alle velden zijn verplicht" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Wachtwoord moet minimaal 6 karakters zijn" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    })

    if (error) {
      console.error("Supabase signup error:", error)

      // Handle specific error cases
      if (error.message.includes("already registered")) {
        return NextResponse.json(
          {
            error: "Dit e-mailadres is al geregistreerd",
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: "Registratie mislukt: " + error.message,
        },
        { status: 400 },
      )
    }

    if (!data.user) {
      return NextResponse.json({ error: "Registratie mislukt" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Account aangemaakt! Controleer je email voor verificatie.",
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Server fout" }, { status: 500 })
  }
}
