import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Demo mode - always return authenticated for testing
    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: "demo-user-123",
        email: "demo@example.com",
        name: "Demo Admin",
      },
    })
  } catch (error) {
    console.error("Auth status error:", error)
    return NextResponse.json(
      {
        isAuthenticated: false,
        error: "Server fout",
      },
      { status: 500 },
    )
  }
}
