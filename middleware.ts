import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Alleen admin routes beschermen
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const authToken = request.cookies.get("auth-token")

    if (!authToken || authToken.value !== "authenticated") {
      // Redirect naar login pagina
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
