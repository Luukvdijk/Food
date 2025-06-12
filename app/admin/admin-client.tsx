"use client"

import { AddReceptForm } from "./components/add-recept-form"
import { IngredientsManager } from "./components/ingredients-manager"
import { EditReceptForm } from "./components/edit-recept-form"
import { ReceptenTable } from "./components/recepten-table"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { handleSignOut } from "./server-actions"

interface AdminClientProps {
  user: any
  recepten: any[]
  editData: any
  searchParams: {
    success?: string
    error?: string
    deleted?: string
    updated?: string
    edit?: string
  }
  dataError: string | null
}

export default function AdminClient({ user, recepten, editData, searchParams, dataError }: AdminClientProps) {
  // Calculate totals
  const totalRecepten = recepten.length
  const totalIngredienten = recepten.reduce((sum, r) => sum + (r.ingredient_count || 0), 0)
  const totalBijgerechten = recepten.reduce((sum, r) => sum + (r.bijgerecht_count || 0), 0)

  // State for active tab
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div style={{ backgroundColor: "#286058", minHeight: "100vh" }} className="text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/70">Welkom terug, {user.email}!</p>
          </div>
          <div className="flex gap-2">
            <a
              href="/"
              style={{
                backgroundColor: "#eee1d1",
                color: "#286058",
                padding: "8px 16px",
                borderRadius: "6px",
                textDecoration: "none",
                transition: "background-color 0.2s ease",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d1c7b8")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#eee1d1")}
            >
              ← Terug naar website
            </a>
            <form action={handleSignOut}>
              <button
                type="submit"
                style={{
                  backgroundColor: "#e75129",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d63e1a")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e75129")}
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
              style={{
                backgroundColor: "#e75129",
                color: "white",
                transition: "background-color 0.2s ease",
              }}
              className="inline-block px-4 py-2 rounded-md"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d63e1a")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e75129")}
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
              {/* Tab Navigation */}
              <div
                style={{ backgroundColor: "#eee1d1", padding: "4px", borderRadius: "8px" }}
                className="flex space-x-1"
              >
                <button
                  onClick={() => setActiveTab("overview")}
                  style={{
                    backgroundColor: activeTab === "overview" ? "#e75129" : "transparent",
                    color: activeTab === "overview" ? "white" : "#286058",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== "overview") {
                      e.currentTarget.style.backgroundColor = "#d1c7b8"
                    } else {
                      e.currentTarget.style.backgroundColor = "#d63e1a"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "overview") {
                      e.currentTarget.style.backgroundColor = "transparent"
                    } else {
                      e.currentTarget.style.backgroundColor = "#e75129"
                    }
                  }}
                >
                  Overzicht
                </button>
                <button
                  onClick={() => setActiveTab("ingredients")}
                  style={{
                    backgroundColor: activeTab === "ingredients" ? "#e75129" : "transparent",
                    color: activeTab === "ingredients" ? "white" : "#286058",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== "ingredients") {
                      e.currentTarget.style.backgroundColor = "#d1c7b8"
                    } else {
                      e.currentTarget.style.backgroundColor = "#d63e1a"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "ingredients") {
                      e.currentTarget.style.backgroundColor = "transparent"
                    } else {
                      e.currentTarget.style.backgroundColor = "#e75129"
                    }
                  }}
                >
                  Ingrediënten
                </button>
                <button
                  onClick={() => setActiveTab("add")}
                  style={{
                    backgroundColor: activeTab === "add" ? "#e75129" : "transparent",
                    color: activeTab === "add" ? "white" : "#286058",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== "add") {
                      e.currentTarget.style.backgroundColor = "#d1c7b8"
                    } else {
                      e.currentTarget.style.backgroundColor = "#d63e1a"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "add") {
                      e.currentTarget.style.backgroundColor = "transparent"
                    } else {
                      e.currentTarget.style.backgroundColor = "#e75129"
                    }
                  }}
                >
                  Recept Toevoegen
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div style={{ backgroundColor: "#eee1d1", color: "#286058" }} className="rounded-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold mb-2">Alle Recepten</h2>
                    <p className="text-sm opacity-70">Beheer je bestaande recepten</p>
                  </div>
                  <div className="p-6">
                    <ReceptenTable recepten={recepten} />
                  </div>
                </div>
              )}

              {activeTab === "ingredients" && (
                <div style={{ backgroundColor: "#eee1d1", color: "#286058" }} className="rounded-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold mb-2">Ingrediënten Beheer</h2>
                    <p className="text-sm opacity-70">Beheer ingrediënten van alle recepten</p>
                  </div>
                  <div className="p-6">
                    <IngredientsManager />
                  </div>
                </div>
              )}

              {activeTab === "add" && (
                <div style={{ backgroundColor: "#eee1d1", color: "#286058" }} className="rounded-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold mb-2">Nieuw Recept Toevoegen</h2>
                    <p className="text-sm opacity-70">Voeg een nieuw recept toe aan je collectie</p>
                  </div>
                  <div className="p-6">
                    <AddReceptForm />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
