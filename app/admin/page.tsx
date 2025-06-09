import { getAllReceptenAdmin, getReceptForEdit } from "./actions"
import { AddReceptForm } from "./components/add-recept-form"
import { EditReceptForm } from "./components/edit-recept-form"
import { ReceptenTable } from "./components/recepten-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { IngredientsManager } from "./components/ingredients-manager"

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

export default async function AdminPage({ searchParams }: AdminPageProps) {
  // Check authentication first
  let user
  try {
    user = await getUser()
    if (!user) {
      redirect("/auth/signin")
    }
  } catch (error) {
    console.error("Auth error:", error)
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welkom terug, {user.name}!</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/">← Terug naar website</Link>
          </Button>
          <form action={handleSignOut}>
            <Button type="submit" variant="ghost">
              Uitloggen
            </Button>
          </form>
        </div>
      </div>

      {/* Status berichten */}
      {searchParams.success && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Recept succesvol toegevoegd!</AlertDescription>
        </Alert>
      )}

      {searchParams.updated && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Recept succesvol bijgewerkt!</AlertDescription>
        </Alert>
      )}

      {searchParams.deleted && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Recept succesvol verwijderd!</AlertDescription>
        </Alert>
      )}

      {(searchParams.error || dataError) && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{dataError || "Er is een fout opgetreden. Probeer het opnieuw."}</AlertDescription>
        </Alert>
      )}

      {/* Database error fallback */}
      {dataError ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Database Verbindingsprobleem
            </CardTitle>
            <CardDescription>
              Er kan geen verbinding worden gemaakt met de database. Controleer de volgende punten:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Is de DATABASE_URL environment variable correct ingesteld?</li>
              <li>Is de database server bereikbaar?</li>
              <li>Zijn de database tabellen aangemaakt?</li>
            </ul>
            <div className="mt-4">
              <Button asChild>
                <Link href="/">Terug naar hoofdpagina</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : editData ? (
        /* Edit form */
        <EditReceptForm
          recept={editData.recept}
          ingredienten={editData.ingredienten}
          bijgerechten={editData.bijgerechten}
          onCancel={() => redirect("/admin")}
        />
      ) : (
        <>
          {/* Statistieken */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totaal Recepten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recepten.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totaal Ingrediënten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recepten.reduce((sum, r) => sum + (Number.parseInt(r.ingredient_count) || 0), 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totaal Bijgerechten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recepten.reduce((sum, r) => sum + (Number.parseInt(r.bijgerecht_count) || 0), 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs voor verschillende secties */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overzicht</TabsTrigger>
              <TabsTrigger value="ingredients">Ingrediënten</TabsTrigger>
              <TabsTrigger value="add">Recept Toevoegen</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Alle Recepten</CardTitle>
                  <CardDescription>Beheer je bestaande recepten</CardDescription>
                </CardHeader>
                <CardContent>
                  <ReceptenTable recepten={recepten} onEdit={(id) => redirect(`/admin?edit=${id}`)} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ingredients">
              <Card>
                <CardHeader>
                  <CardTitle>Ingrediënten Beheer</CardTitle>
                  <CardDescription>Beheer ingrediënten van alle recepten</CardDescription>
                </CardHeader>
                <CardContent>
                  <IngredientsManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add">
              <Card>
                <CardHeader>
                  <CardTitle>Nieuw Recept Toevoegen</CardTitle>
                  <CardDescription>Voeg een nieuw recept toe aan je collectie</CardDescription>
                </CardHeader>
                <CardContent>
                  <AddReceptForm />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
