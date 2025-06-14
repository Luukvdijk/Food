import { supabase } from "@/lib/db"
import { getAllRecepten, getRandomRecept } from "@/app/actions"

async function testDirectQuery() {
  try {
    const { data, error } = await supabase.from("recepten").select("*").limit(5)

    return { data, error: error?.message }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function testRandomQuery() {
  try {
    const { count, error: countError } = await supabase.from("recepten").select("*", { count: "exact", head: true })

    if (countError) return { data: null, error: countError.message, count: 0 }
    if (!count || count === 0) return { data: null, error: "No recipes found", count: 0 }

    const randomOffset = Math.floor(Math.random() * count)
    const { data, error } = await supabase.from("recepten").select("*").range(randomOffset, randomOffset).single()

    return { data, error: error?.message, count }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Unknown error", count: 0 }
  }
}

export default async function DebugPage() {
  const directQuery = await testDirectQuery()
  const randomQuery = await testRandomQuery()
  const actionQuery = await getAllRecepten()
  const randomAction = await getRandomRecept()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Database Debug Information</h1>

      <div className="space-y-8">
        {/* Environment Variables */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2 text-sm">
            <div>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</div>
            <div>
              NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}
            </div>
            <div>SUPABASE_SERVICE_KEY: {process.env.SUPABASE_SERVICE_KEY ? "✅ Set" : "❌ Missing"}</div>
          </div>
        </div>

        {/* Direct Query Test */}
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Direct Supabase Query Test</h2>
          {directQuery.error ? (
            <div className="text-red-600">❌ Error: {directQuery.error}</div>
          ) : (
            <div>
              <div className="text-green-600 mb-2">✅ Success - Found {directQuery.data?.length} recipes</div>
              <pre className="bg-white p-2 rounded text-xs overflow-auto">
                {JSON.stringify(directQuery.data?.slice(0, 2), null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Random Query Test */}
        <div className="bg-green-50 p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Random Recipe Query Test</h2>
          {randomQuery.error ? (
            <div className="text-red-600">❌ Error: {randomQuery.error}</div>
          ) : (
            <div>
              <div className="text-green-600 mb-2">✅ Success - Total count: {randomQuery.count}</div>
              <pre className="bg-white p-2 rounded text-xs overflow-auto">
                {JSON.stringify(randomQuery.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Action Query Test */}
        <div className="bg-yellow-50 p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">getAllRecepten() Action Test</h2>
          <div>
            <div className="text-green-600 mb-2">Found {actionQuery.length} recipes via action</div>
            <pre className="bg-white p-2 rounded text-xs overflow-auto">
              {JSON.stringify(
                actionQuery.slice(0, 2).map((r) => ({ id: r.id, naam: r.naam, eigenaar: r.eigenaar })),
                null,
                2,
              )}
            </pre>
          </div>
        </div>

        {/* Random Action Test */}
        <div className="bg-purple-50 p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">getRandomRecept() Action Test</h2>
          {randomAction ? (
            <div>
              <div className="text-green-600 mb-2">✅ Random recipe found</div>
              <pre className="bg-white p-2 rounded text-xs overflow-auto">
                {JSON.stringify(
                  { id: randomAction.id, naam: randomAction.naam, eigenaar: randomAction.eigenaar },
                  null,
                  2,
                )}
              </pre>
            </div>
          ) : (
            <div className="text-red-600">❌ No random recipe returned</div>
          )}
        </div>
      </div>
    </div>
  )
}
