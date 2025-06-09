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

    console.log("Uploading file:", {
      name: file.name,
      type: file.type,
      size: file.size,
      path: path,
    })

    // Check environment variables with different possible names
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY

    console.log("Environment check:", {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      urlPreview: supabaseUrl?.substring(0, 30) + "...",
      serviceKeyPreview: supabaseServiceKey?.substring(0, 10) + "...",
    })

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          error: "Supabase configuratie ontbreekt",
          details: {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!supabaseServiceKey,
            envVars: Object.keys(process.env).filter((key) => key.includes("SUPABASE")),
          },
        },
        { status: 500 },
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create Supabase client directly
    const { createClient } = await import("@supabase/supabase-js")

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("Attempting upload to Supabase...")

    // Try upload with upsert to avoid conflicts
    const { data, error } = await supabaseAdmin.storage.from("recipe-images").upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

    if (error) {
      console.error("Supabase upload error:", error)

      // Handle specific errors
      if (error.message?.includes("Bucket not found")) {
        return NextResponse.json(
          {
            error: "Storage bucket 'recipe-images' niet gevonden",
            solution: "Ga naar Supabase Dashboard → Storage → Buckets en maak een bucket aan met naam 'recipe-images'",
            details: error.message,
          },
          { status: 500 },
        )
      }

      if (error.message?.includes("new row violates row-level security")) {
        return NextResponse.json(
          {
            error: "Geen toestemming voor upload",
            solution: "Controleer de storage policies in Supabase Dashboard → Storage → Policies",
            details: error.message,
          },
          { status: 403 },
        )
      }

      if (error.message?.includes("JWT")) {
        return NextResponse.json(
          {
            error: "Authenticatie probleem",
            solution: "Controleer of SUPABASE_SERVICE_ROLE_KEY correct is ingesteld",
            details: error.message,
          },
          { status: 401 },
        )
      }

      return NextResponse.json(
        {
          error: `Upload mislukt: ${error.message}`,
          details: error,
        },
        { status: 500 },
      )
    }

    console.log("Upload successful:", data)

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("recipe-images").getPublicUrl(path)

    console.log("Public URL generated:", publicUrl)

    return NextResponse.json({ publicUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: `Server fout: ${error instanceof Error ? error.message : "Onbekende fout"}`,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
