import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Only protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const authToken = request.cookies.get("auth-token")

    if (!authToken || authToken.value !== "authenticated") {
      // Redirect to login page
      const loginUrl = new URL("/auth/signin", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
