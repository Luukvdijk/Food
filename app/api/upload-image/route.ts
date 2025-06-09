import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
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

    console.log("Buffer created, size:", buffer.length)

    // First, check if bucket exists
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()
    console.log(
      "Available buckets:",
      buckets?.map((b) => b.name),
    )

    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      return NextResponse.json({ error: "Fout bij controleren van storage buckets" }, { status: 500 })
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === "recipe-images")
    if (!bucketExists) {
      console.error("Bucket 'recipe-images' does not exist")
      return NextResponse.json({ error: "Storage bucket 'recipe-images' bestaat niet" }, { status: 500 })
    }

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage.from("recipe-images").upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error("Supabase upload error:", {
        message: error.message,
        statusCode: error.statusCode,
        error: error,
      })

      // More specific error messages
      if (error.message?.includes("Bucket not found")) {
        return NextResponse.json(
          { error: "Storage bucket niet gevonden. Controleer Supabase configuratie." },
          { status: 500 },
        )
      }

      if (error.message?.includes("Policy")) {
        return NextResponse.json(
          { error: "Geen toestemming voor upload. Controleer storage policies." },
          { status: 403 },
        )
      }

      if (error.message?.includes("already exists")) {
        return NextResponse.json({ error: "Bestand bestaat al. Probeer opnieuw." }, { status: 409 })
      }

      return NextResponse.json(
        {
          error: `Upload naar storage mislukt: ${error.message}`,
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
      },
      { status: 500 },
    )
  }
}
