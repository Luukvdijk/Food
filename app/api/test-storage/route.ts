import { NextResponse } from "next/server"
import { supabaseAdmin, testSupabaseConnection } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("Testing Supabase connection...")

    // Test basic connection
    const connectionTest = await testSupabaseConnection()

    // Test bucket access
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    // Test bucket policies (try to get bucket info)
    let bucketInfo = null
    let bucketError = null

    try {
      const { data: files, error } = await supabaseAdmin.storage.from("recipe-images").list("", { limit: 1 })
      bucketInfo = { filesCount: files?.length || 0, error }
    } catch (error) {
      bucketError = error
    }

    return NextResponse.json({
      connection: connectionTest,
      buckets: {
        data: buckets?.map((b) => ({ name: b.name, id: b.id, public: b.public })),
        error: bucketsError,
      },
      recipeImagesBucket: {
        exists: buckets?.some((b) => b.name === "recipe-images"),
        info: bucketInfo,
        error: bucketError,
      },
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
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
