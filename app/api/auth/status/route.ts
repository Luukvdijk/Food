import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token");

    const isAuthenticated = authToken?.value === "authenticated";

    return NextResponse.json({
      isAuthenticated,
      user: isAuthenticated
        ? { name: "Admin", email: "admin@recepten.nl" }
        : null,
    });
  } catch (error) {
    console.error("Auth status error:", error);
    return NextResponse.json({ isAuthenticated: false, user: null });
  }
}
