import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check all possible environment variable names
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
      SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    }

    const envCheck = Object.entries(envVars).reduce(
      (acc, [key, value]) => {
        acc[key] = {
          exists: !!value,
          preview: value ? value.substring(0, 20) + "..." : "Not set",
        }
        return acc
      },
      {} as Record<string, any>,
    )

    // Find the service key
    const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_KEY || envVars.SUPABASE_SECRET_KEY

    if (!envVars.NEXT_PUBLIC_SUPABASE_URL || !serviceKey) {
      return NextResponse.json({
        error: "Missing required environment variables",
        environment: envCheck,
        allEnvVars: Object.keys(process.env).filter((key) => key.includes("SUPABASE")),
        instructions: [
          "1. Go to Supabase Dashboard → Settings → API",
          "2. Copy the 'service_role' key (not anon key)",
          "3. Add it to Vercel as SUPABASE_SERVICE_ROLE_KEY",
          "4. Redeploy your application",
        ],
      })
    }

    // Test Supabase connection
    const { createClient } = await import("@supabase/supabase-js")

    const supabaseAdmin = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Test storage access
    let storageTest = null
    let storageError = null

    try {
      // Try to list buckets
      const { data: buckets, error } = await supabaseAdmin.storage.listBuckets()

      if (error) {
        storageError = error.message
      } else {
        storageTest = {
          bucketsFound: buckets?.length || 0,
          buckets: buckets?.map((b) => ({ name: b.name, public: b.public })),
          hasRecipeImagesBucket: buckets?.some((b) => b.name === "recipe-images"),
        }
      }
    } catch (error) {
      storageError = error instanceof Error ? error.message : "Unknown error"
    }

    return NextResponse.json({
      environment: envCheck,
      serviceKeyFound: !!serviceKey,
      storageTest,
      storageError,
      nextSteps: storageError
        ? [
            "1. Check if 'recipe-images' bucket exists in Supabase Dashboard",
            "2. Ensure bucket is set to 'public'",
            "3. Check storage policies allow uploads",
          ]
        : ["Environment looks good!", "Try uploading an image now."],
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
