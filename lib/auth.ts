import { cookies } from "next/headers"
import { createServerClient } from "./supabase"

export async function getUser() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient()

    // Get the session token from cookies
    const accessToken = cookieStore.get("sb-access-token")?.value
    const refreshToken = cookieStore.get("sb-refresh-token")?.value

    if (!accessToken) {
      return null
    }

    // Set the session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || user.email!.split("@")[0],
    }
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
