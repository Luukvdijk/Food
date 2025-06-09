import { getUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      );
    }

    const result = await sql`
      SELECT id, naam FROM recepten ORDER BY naam
    `;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching recepten:", error);
    return NextResponse.json({ error: "Server fout" }, { status: 500 });
  }
}
