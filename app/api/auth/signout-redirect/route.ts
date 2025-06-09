import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");

  return NextResponse.redirect(
    new URL(
      "/auth/signin",
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    )
  );
}
