import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/db"
import AdminClient from "./admin-client"

interface AdminPageProps {
  searchParams: {
    success?: string
    error?: string
    deleted?: string
    updated?: string
    edit?: string
  }
}

async function getAllReceptenAdmin() {
  try {
    // Get recipes with counts
    const { data: recepten, error } = await supabase.from("recepten").select("*").order("naam")

    if (error) {
      console.warn("Database error, using mock data:", error.message)
      // Return mock data for preview
      return [
        {
          id: 1,
          naam: "Spaghetti Carbonara",
          beschrijving: "Klassieke Italiaanse pasta",
          bereidingstijd: 30,
          porties: 4,
          moeilijkheidsgraad: "Gemiddeld",
          eigenaar: "admin",
          ingredient_count: 6,
          bijgerecht_count: 2,
        },
        {
          id: 2,
          naam: "Chicken Tikka Masala",
          beschrijving: "Kruidige Indiase curry",
          bereidingstijd: 45,
          porties: 4,
          moeilijkheidsgraad: "Moeilijk",
          eigenaar: "admin",
          ingredient_count: 12,
          bijgerecht_count: 3,
        },
      ]
    }

    // Get ingredient counts for each recipe
    const receptenWithCounts = await Promise.all(
      (recepten || []).map(async (recept) => {
        try {
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
        } catch (error) {
          return {
            ...recept,
            ingredient_count: 0,
            bijgerecht_count: 0,
          }
        }
      }),
    )

    return receptenWithCounts
  } catch (error) {
    console.warn("Database connection failed, using mock data")
    return [
      {
        id: 1,
        naam: "Spaghetti Carbonara",
        beschrijving: "Klassieke Italiaanse pasta",
        bereidingstijd: 30,
        porties: 4,
        moeilijkheidsgraad: "Gemiddeld",
        eigenaar: "admin",
        ingredient_count: 6,
        bijgerecht_count: 2,
      },
      {
        id: 2,
        naam: "Chicken Tikka Masala",
        beschrijving: "Kruidige Indiase curry",
        bereidingstijd: 45,
        porties: 4,
        moeilijkheidsgraad: "Moeilijk",
        eigenaar: "admin",
        ingredient_count: 12,
        bijgerecht_count: 3,
      },
    ]
  }
}

async function getReceptForEdit(id: number) {
  try {
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
  } catch (error) {
    console.warn("Could not load recipe for edit:", error)
    return null
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

  return (
    <AdminClient
      user={user}
      recepten={recepten}
      editData={editData}
      searchParams={searchParams}
      dataError={dataError}
    />
  )
}
