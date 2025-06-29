import { getMiddlewareClient } from "@/lib/supabase-singleton"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Only protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const response = NextResponse.next()
    const supabase = getMiddlewareClient(request, response)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
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
