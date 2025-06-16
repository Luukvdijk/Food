import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Demo mode - disable auth protection for testing
  console.log("Middleware: allowing access to", request.nextUrl.pathname)
  return NextResponse.next()

  /* Original auth code - commented out for demo
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const response = NextResponse.next()
    const supabase = getMiddlewareClient(request, response)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const loginUrl = new URL("/auth/signin", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
  */
}

export const config = {
  matcher: ["/admin/:path*"],
}
