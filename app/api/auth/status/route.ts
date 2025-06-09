import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const authToken = cookieStore.get("auth-token")

    const isAuthenticated = authToken?.value === "authenticated"

    return NextResponse.json({
      isAuthenticated,
      user: isAuthenticated ? { name: "Admin", email: "admin@recepten.nl" } : null,
    })
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false, user: null })
  }
}
