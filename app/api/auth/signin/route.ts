import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email en wachtwoord zijn verplicht" }, { status: 400 })
    }

    // Demo mode - accept any credentials for testing
    console.log("Demo login attempt:", { email })

    // Simulate successful login
    return NextResponse.json({
      success: true,
      user: {
        id: "demo-user-123",
        email: email,
        name: "Demo Admin",
      },
    })
  } catch (error) {
    console.error("Signin error:", error)
    return NextResponse.json({ error: "Server fout" }, { status: 500 })
  }
}
