"use server"

import { redirect } from "next/navigation"

export async function handleSignOut() {
  redirect("/api/auth/signout-redirect")
}
