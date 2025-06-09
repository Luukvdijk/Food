import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = cookies()
  cookieStore.delete("auth-token")

  return NextResponse.redirect(new URL("/auth/signin", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
}
