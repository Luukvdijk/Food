import { EditReceptForm } from "./components/edit-recept-form"
import { ReceptenTable } from "./components/recepten-table"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/db"

interface AdminPageProps {
  searchParams: {
    success?: string
    error?: string
    deleted?: string
    updated?: string
    edit?: string
  }
}

async function handleSignOut() {
  "use server"
  redirect("/api/auth/signout-redirect")
}

async function getAllReceptenAdmin() {
  // Get recipes with counts
  const { data: recepten, error } = await supabase.from("recepten").select("*").order("naam")

  if (error) throw error

  // Get ingredient counts for each recipe
  const receptenWithCounts = await Promise.all(
    (recepten || []).map(async (recept) => {
      const { count: ingredientCount } = await supabase
        .from("ingredienten")
        .select("*", { count: "exact", head: true })
        .eq("recept_id", recept.id)

      const { count: bijgerechtCount } = await supabase
        .from("bijgerechten")
        .select("*", { count: "exact", head: true })
        .eq("recept_id", recept.id)

      return {
        ...recept,
        ingredient_count: ingredientCount || 0,
        bijgerecht_count: bijgerechtCount || 0,
      }
    }),
  )

  return receptenWithCounts
}

async function getReceptForEdit(id: number) {
  // Get the recipe
  const { data: recept, error: receptError } = await supabase.from("recepten").select("*").eq("id", id).single()

  if (receptError) throw receptError
  if (!recept) return null

  // Get ingredients
  const { data: ingredienten, error: ingredientenError } = await supabase
    .from("ingredienten")
    .select("*")
    .eq("recept_id", id)
    .order("id")

  if (ingredientenError) throw ingredientenError

  // Get bijgerechten
  const { data: bijgerechten, error: bijgerechtenError } = await supabase
    .from("bijgerechten")
    .select("*")
    .eq("recept_id", id)
    .order("id")

  if (bijgerechtenError) throw bijgerechtenError

  return {
    recept,
    ingredienten: ingredienten || [],
    bijgerechten: bijgerechten || [],
  }
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  // Check authentication first - don't catch redirect errors
  const user = await getUser()
  if (!user) {
    redirect("/auth/signin")
  }

  // Try to load data with error handling
  let recepten: any[] = []
  let dataError: string | null = null
  let editData = null

  try {
    recepten = await getAllReceptenAdmin()
  } catch (error) {
    console.error("Error loading recepten:", error)
    dataError = "Kon recepten niet laden. Controleer de database verbinding."
  }

  // Check if we're editing a recipe
  const editId = searchParams.edit ? Number.parseInt(searchParams.edit) : null
  if (editId && !dataError) {
    try {
      editData = await getReceptForEdit(editId)
      if (!editData) {
        redirect("/admin?error=recipe_not_found")
      }
    } catch (error) {
      console.error("Error loading recipe for edit:", error)
      redirect("/admin?error=edit_failed")
    }
  }

  // Calculate totals
  const totalRecepten = recepten.length
  const totalIngredienten = recepten.reduce((sum, r) => sum + (r.ingredient_count || 0), 0)
  const totalBijgerechten = recepten.reduce((sum, r) => sum + (r.bijgerecht_count || 0), 0)

  return (
    <div style={{ backgroundColor: "#286058", minHeight: "100vh" }} className="text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/70">Welkom terug, {user.email}!</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              style={{ backgroundColor: "#eee1d1", color: "#286058" }}
              className="px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              ← Terug naar website
            </Link>
            <form action={handleSignOut}>
              <button
                type="submit"
                style={{ backgroundColor: "#e75129", color: "white" }}
                className="px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
              >
                Uitloggen
              </button>
            </form>
          </div>
        </div>

        {/* Status berichten */}
        {searchParams.success && (
          <div
            style={{ backgroundColor: "#eee1d1", color: "#286058" }}
            className="p-4 rounded-md mb-6 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Recept succesvol toegevoegd!</span>
          </div>
        )}

        {searchParams.updated && (
          <div
            style={{ backgroundColor: "#eee1d1", color: "#286058" }}
            className="p-4 rounded-md mb-6 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Recept succesvol bijgewerkt!</span>
          </div>
        )}

        {searchParams.deleted && (
          <div
            style={{ backgroundColor: "#eee1d1", color: "#286058" }}
            className="p-4 rounded-md mb-6 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Recept succesvol verwijderd!</span>
          </div>
        )}

        {(searchParams.error || dataError) && (
          <div
            style={{ backgroundColor: "#e75129", color: "white" }}
            className="p-4 rounded-md mb-6 flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            <span>
              {searchParams.error === "recipe_not_found" && "Recept niet gevonden."}
              {searchParams.error === "edit_failed" && "Kon recept niet laden voor bewerking."}
              {searchParams.error === "add_failed" && "Kon recept niet toevoegen."}
              {searchParams.error === "update_failed" && "Kon recept niet bijwerken."}
              {searchParams.error === "delete_failed" && "Kon recept niet verwijderen."}
              {searchParams.error === "missing_fields" && "Niet alle verplichte velden zijn ingevuld."}
              {searchParams.error === "missing_steps" && "Geen bereidingsstappen opgegeven."}
              {searchParams.error === "missing_ingredients" && "Geen ingrediënten opgegeven."}
              {dataError && dataError}
              {searchParams.error &&
                !dataError &&
                ![
                  "recipe_not_found",
                  "edit_failed",
                  "add_failed",
                  "update_failed",
                  "delete_failed",
                  "missing_fields",
                  "missing_steps",
                  "missing_ingredients",
                ].includes(searchParams.error) &&
                "Er is een onbekende fout opgetreden. Probeer het opnieuw."}
            </span>
          </div>
        )}

        {/* Database error fallback */}
        {dataError ? (
          <div style={{ backgroundColor: "#eee1d1", color: "#286058" }} className="p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Database Verbindingsprobleem</h2>
            </div>
            <p className="mb-4">
              Er kan geen verbinding worden gemaakt met de database. Controleer de volgende punten:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm mb-4">
              <li>Zijn de SUPABASE_URL en SUPABASE_SERVICE_KEY environment variables correct ingesteld?</li>
              <li>Is de Supabase server bereikbaar?</li>
              <li>Zijn de database tabellen aangemaakt?</li>
            </ul>
            <Link
              href="/"
              style={{ backgroundColor: "#e75129", color: "white" }}
              className="inline-block px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              Terug naar hoofdpagina
            </Link>
          </div>
        ) : editData ? (
          /* Edit form */
          <EditReceptForm
            recept={editData.recept}
            ingredienten={editData.ingredienten}
            bijgerechten={editData.bijgerechten}
          />
        ) : (
          <>
            {/* Statistieken */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div style={{ backgroundColor: "#eee1d1", color: "#286058" }} className="p-6 rounded-lg">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Totaal Recepten</h3>
                </div>
                <div className="text-2xl font-bold">{totalRecepten}</div>
              </div>
              <div style={{ backgroundColor: "#eee1d1", color: "#286058" }} className="p-6 rounded-lg">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Totaal Ingrediënten</h3>
                </div>
                <div className="text-2xl font-bold">{totalIngredienten}</div>
              </div>
              <div style={{ backgroundColor: "#eee1d1", color: "#286058" }} className="p-6 rounded-lg">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Totaal Bijgerechten</h3>
                </div>
                <div className="text-2xl font-bold">{totalBijgerechten}</div>
              </div>
            </div>

            {/* Tabs voor verschillende secties */}
            <div className="space-y-6">
              <div className="flex space-x-1" style={{ backgroundColor: "#eee1d1" }} className="p-1 rounded-lg">
                <button
                  style={{ backgroundColor: "#e75129", color: "white" }}
                  className="px-4 py-2 rounded-md text-sm font-medium"
                >
                  Overzicht
                </button>
                <button
                  style={{ color: "#286058" }}
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-white/50"
                >
                  Ingrediënten
                </button>
                <button
                  style={{ color: "#286058" }}
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-white/50"
                >
                  Recept Toevoegen
                </button>
              </div>

              <div style={{ backgroundColor: "#eee1d1", color: "#286058" }} className="p-6 rounded-lg">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Alle Recepten</h2>
                  <p className="text-sm opacity-70">Beheer je bestaande recepten</p>
                </div>
                <ReceptenTable recepten={recepten} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
