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

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create Supabase client directly here to avoid import issues
    const { createClient } = await import("@supabase/supabase-js")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables:", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
      })
      return NextResponse.json({ error: "Supabase configuratie ontbreekt" }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("Attempting upload to Supabase...")

    // Try to upload directly without checking buckets first
    const { data, error } = await supabaseAdmin.storage.from("recipe-images").upload(path, buffer, {
      contentType: file.type,
      upsert: true, // Allow overwriting existing files
    })

    if (error) {
      console.error("Supabase upload error:", {
        message: error.message,
        statusCode: error.statusCode,
        error: error,
      })

      // More specific error handling
      if (error.message?.includes("Bucket not found") || error.message?.includes("bucket")) {
        return NextResponse.json(
          {
            error: "Storage bucket niet gevonden. Maak eerst de 'recipe-images' bucket aan in Supabase Dashboard.",
            details: error.message,
          },
          { status: 500 },
        )
      }

      if (
        error.message?.includes("Policy") ||
        error.message?.includes("permission") ||
        error.message?.includes("RLS")
      ) {
        return NextResponse.json(
          {
            error: "Geen toestemming voor upload. Controleer storage policies in Supabase.",
            details: error.message,
          },
          { status: 403 },
        )
      }

      if (error.message?.includes("JWT") || error.message?.includes("token")) {
        return NextResponse.json(
          {
            error: "Authenticatie probleem. Controleer SUPABASE_SERVICE_ROLE_KEY.",
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
