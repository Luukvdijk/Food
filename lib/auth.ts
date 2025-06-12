import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function getUser() {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)
      return null
    }

    if (session?.user) {
      return {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.user_metadata?.full_name || session.user.email || "Admin",
      }
    }

    return null
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    throw new Error("Niet geautoriseerd")
  }
  return user
}
