import { cookies } from "next/headers"

export async function getUser() {
  const cookieStore = cookies()
  const authToken = cookieStore.get("auth-token")

  if (authToken?.value === "authenticated") {
    return {
      id: "1",
      email: "admin@recepten.nl",
      name: "Admin",
    }
  }

  return null
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    throw new Error("Niet geautoriseerd")
  }
  return user
}
