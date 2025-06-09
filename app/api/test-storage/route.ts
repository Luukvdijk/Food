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
        manualSetup: {
          step1: "Go to Supabase Dashboard → Settings → API",
          step2: "Copy the 'service_role' key (not anon key)",
          step3: "Add it to Vercel as SUPABASE_SERVICE_ROLE_KEY",
          step4: "Redeploy your application",
        },
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
    let bucketExists = false

    try {
      // Try to list buckets
      const { data: buckets, error } = await supabaseAdmin.storage.listBuckets()

      if (error) {
        storageError = error.message
      } else {
        bucketExists = buckets?.some((b) => b.name === "recipe-images") || false
        storageTest = {
          bucketsFound: buckets?.length || 0,
          buckets: buckets?.map((b) => ({ name: b.name, public: b.public })),
          hasRecipeImagesBucket: bucketExists,
        }
      }
    } catch (error) {
      storageError = error instanceof Error ? error.message : "Unknown error"
    }

    // Test upload if bucket exists
    let uploadTest = null
    let uploadError = null

    if (bucketExists) {
      try {
        // Try a small test upload
        const testContent = Buffer.from("test")
        const testPath = `test-${Date.now()}.txt`

        const { data, error } = await supabaseAdmin.storage
          .from("recipe-images")
          .upload(testPath, testContent, { upsert: true })

        if (error) {
          uploadError = error.message
        } else {
          uploadTest = { success: true, path: data.path }
          // Clean up test file
          await supabaseAdmin.storage.from("recipe-images").remove([testPath])
        }
      } catch (error) {
        uploadError = error instanceof Error ? error.message : "Unknown upload error"
      }
    }

    return NextResponse.json({
      environment: envCheck,
      serviceKeyFound: !!serviceKey,
      storageTest,
      storageError,
      uploadTest,
      uploadError,
      manualSetupRequired: !bucketExists || !!uploadError,
      dashboardInstructions: {
        title: "Manual Setup Required in Supabase Dashboard",
        steps: [
          "1. Go to Supabase Dashboard → Storage",
          "2. Click 'New bucket' if 'recipe-images' doesn't exist",
          "3. Name: 'recipe-images', Public: ON",
          "4. Go to Storage → Policies",
          "5. Click 'New policy' for the objects table",
          "6. Use template: 'Enable insert for authenticated users only'",
          "7. Change bucket_id condition to: bucket_id = 'recipe-images'",
          "8. Repeat for SELECT, UPDATE, DELETE operations",
          "9. Or use the simple policy: Allow all operations for recipe-images bucket",
        ],
        simplePolicy: `
-- Simple policy that allows all operations on recipe-images bucket
-- Run this in Supabase SQL Editor:

CREATE POLICY "recipe_images_all_operations" ON storage.objects
FOR ALL USING (bucket_id = 'recipe-images')
WITH CHECK (bucket_id = 'recipe-images');
        `,
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
