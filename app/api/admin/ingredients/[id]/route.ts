import { getUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      );
    }

    const id = Number.parseInt(params.id);
    const { naam, hoeveelheid, eenheid, notitie } = await request.json();

    await sql`
      UPDATE ingredienten 
      SET naam = ${naam}, hoeveelheid = ${hoeveelheid}, eenheid = ${eenheid}, notitie = ${
      notitie || null
    }
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating ingredient:", error);
    return NextResponse.json({ error: "Server fout" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Niet geautoriseerd" },
        { status: 401 }
      );
    }

    const id = Number.parseInt(params.id);

    await sql`DELETE FROM ingredienten WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    return NextResponse.json({ error: "Server fout" }, { status: 500 });
  }
}
