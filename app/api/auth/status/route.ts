import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUser()

    return NextResponse.json({
      isAuthenticated: !!user,
      user: user || null,
    })
  } catch (error) {
    console.error("Auth status error:", error)
    return NextResponse.json({ isAuthenticated: false, user: null })
  }
}
