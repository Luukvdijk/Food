import { type NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const path = formData.get("path") as string

    if (!file || !path) {
      return NextResponse.json({ error: "Bestand en pad zijn verplicht" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Alleen afbeeldingen zijn toegestaan" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Bestand mag maximaal 5MB zijn" }, { status: 400 })
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          error: "Supabase configuratie ontbreekt",
        },
        { status: 500 },
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create Supabase client
    const { createClient } = await import("@supabase/supabase-js")

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage.from("recipe-images").upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

    if (error) {
      console.error("Supabase upload error:", error)
      return NextResponse.json(
        {
          error: `Upload mislukt: ${error.message}`,
        },
        { status: 500 },
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("recipe-images").getPublicUrl(path)

    return NextResponse.json({
      publicUrl,
      success: true,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: `Server fout: ${error instanceof Error ? error.message : "Onbekende fout"}`,
      },
      { status: 500 },
    )
  }
}
