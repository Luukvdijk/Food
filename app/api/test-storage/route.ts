import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Testing Supabase environment...")

    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + "...",
    }

    console.log("Environment check:", envCheck)

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: "Missing required environment variables",
        environment: envCheck,
      })
    }

    // Try to create Supabase client
    const { createClient } = await import("@supabase/supabase-js")

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("Supabase client created successfully")

    // Test a simple operation
    let storageTest = null
    let storageError = null

    try {
      // Try to get public URL (this doesn't require special permissions)
      const { data } = supabaseAdmin.storage.from("recipe-images").getPublicUrl("test.jpg")
      storageTest = { publicUrlGenerated: !!data.publicUrl, sampleUrl: data.publicUrl }
    } catch (error) {
      storageError = error instanceof Error ? error.message : "Unknown error"
    }

    return NextResponse.json({
      environment: envCheck,
      supabaseClient: "Created successfully",
      storageTest,
      storageError,
      instructions: {
        step1: "Ga naar Supabase Dashboard → Storage",
        step2: "Maak een nieuwe bucket aan genaamd 'recipe-images'",
        step3: "Zet de bucket op 'Public'",
        step4: "Ga naar Storage → Policies",
        step5: "Voeg policies toe voor authenticated uploads en public downloads",
      },
    })
  } catch (error) {
    console.error("Storage test error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
