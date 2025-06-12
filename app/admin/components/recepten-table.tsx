"use client"

import { useState } from "react"
import { deleteRecept } from "../actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Eye, Clock, Users, Pencil, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface ReceptenTableProps {
  recepten: any[]
}

export function ReceptenTable({ recepten }: ReceptenTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Check if eigenaar column exists in the data
  const hasEigenaarColumn = recepten.length > 0 && "eigenaar" in recepten[0]

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await deleteRecept(id)
    } catch (error: any) {
      // Check if this is a redirect (which is expected and means success)
      if (error?.digest?.includes("NEXT_REDIRECT") || error?.message === "NEXT_REDIRECT") {
        // This is actually success - the redirect happened
        toast({
          title: "Succes!",
          description: "Recept succesvol verwijderd",
          className: "bg-green-50 border-green-200 text-green-800",
        })
      } else {
        // This is an actual error
        console.error("Delete error:", error)
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het verwijderen van het recept",
          className: "bg-red-50 border-red-200 text-red-800",
        })
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (id: number) => {
    router.push(`/admin?edit=${id}`)
  }

  if (recepten.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nog geen recepten toegevoegd.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Gebruik het "Recept Toevoegen" tabblad om je eerste recept toe te voegen.
        </p>
      </div>
    )
  }

  const getEigenaarColor = (eigenaar: string) => {
    switch (eigenaar) {
      case "henk":
        return "bg-blue-100 text-blue-800"
      case "pepie en luulie":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Custom table styles
  const tableStyles = {
    container: {
      width: "100%",
      overflowX: "auto" as const,
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
      fontSize: "14px",
    },
    thead: {
      backgroundColor: "#f8f9fa",
    },
    th: {
      padding: "12px 16px",
      textAlign: "left" as const,
      fontWeight: 500,
      color: "#286058",
      borderBottom: "1px solid #e2e8f0",
    },
    tr: {
      borderBottom: "1px solid #e2e8f0",
      transition: "background-color 0.2s ease",
    },
    trHover: {
      backgroundColor: "#f1ece2", // Lighter cream color for hover
    },
    td: {
      padding: "12px 16px",
      color: "#286058",
    },
    actionButton: {
      padding: "6px",
      borderRadius: "4px",
      backgroundColor: "transparent",
      border: "1px solid #e2e8f0",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
    },
    actionButtonHover: {
      backgroundColor: "#f1ece2", // Lighter cream for hover
      borderColor: "#d1c7b8",
    },
    deleteButton: {
      backgroundColor: "#e75129",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },
    deleteButtonHover: {
      backgroundColor: "#d63e1a", // Darker orange
    },
    cancelButton: {
      backgroundColor: "#eee1d1",
      color: "#286058",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },
    cancelButtonHover: {
      backgroundColor: "#d1c7b8", // Darker cream
    },
  }

  return (
    <div style={tableStyles.container}>
      <table style={tableStyles.table}>
        <thead style={tableStyles.thead}>
          <tr>
            <th style={tableStyles.th}>Naam</th>
            {hasEigenaarColumn && <th style={tableStyles.th}>Eigenaar</th>}
            <th style={tableStyles.th}>Type</th>
            <th style={tableStyles.th}>Tijd</th>
            <th style={tableStyles.th}>Personen</th>
            <th style={tableStyles.th}>Ingrediënten</th>
            <th style={tableStyles.th}>Bijgerechten</th>
            <th style={tableStyles.th}>Acties</th>
          </tr>
        </thead>
        <tbody>
          {recepten.map((recept) => (
            <tr
              key={recept.id}
              style={tableStyles.tr}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, tableStyles.trHover)
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = ""
              }}
            >
              <td style={tableStyles.td}>
                <div>
                  <div style={{ fontWeight: 600 }}>{recept.naam}</div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "300px",
                    }}
                  >
                    {recept.beschrijving}
                  </div>
                </div>
              </td>
              {hasEigenaarColumn && (
                <td style={tableStyles.td}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: 500,
                      backgroundColor: recept.eigenaar === "henk" ? "#dbeafe" : "#fce7f3",
                      color: recept.eigenaar === "henk" ? "#1e40af" : "#9d174d",
                    }}
                  >
                    {recept.eigenaar === "henk" ? "Henk" : "Pepie & Luulie"}
                  </span>
                </td>
              )}
              <td style={tableStyles.td}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 500,
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {recept.type}
                </span>
              </td>
              <td style={tableStyles.td}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Clock style={{ marginRight: "4px", height: "12px", width: "12px" }} />
                  {recept.bereidingstijd}m
                </div>
              </td>
              <td style={tableStyles.td}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Users style={{ marginRight: "4px", height: "12px", width: "12px" }} />
                  {recept.personen}
                </div>
              </td>
              <td style={tableStyles.td}>{recept.ingredient_count || 0}</td>
              <td style={tableStyles.td}>{recept.bijgerecht_count || 0}</td>
              <td style={tableStyles.td}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <a
                    href={`/recept/${recept.id}`}
                    style={tableStyles.actionButton}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, tableStyles.actionButtonHover)
                    }}
                    onMouseLeave={(e) => {
                      Object.assign(e.currentTarget.style, tableStyles.actionButton)
                    }}
                  >
                    <Eye style={{ height: "16px", width: "16px", color: "#286058" }} />
                  </a>
                  <button
                    onClick={() => handleEdit(recept.id)}
                    style={tableStyles.actionButton}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, tableStyles.actionButtonHover)
                    }}
                    onMouseLeave={(e) => {
                      Object.assign(e.currentTarget.style, tableStyles.actionButton)
                    }}
                  >
                    <Pencil style={{ height: "16px", width: "16px", color: "#286058" }} />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        style={tableStyles.actionButton}
                        disabled={deletingId === recept.id}
                        onMouseEnter={(e) => {
                          if (deletingId !== recept.id) {
                            Object.assign(e.currentTarget.style, tableStyles.actionButtonHover)
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (deletingId !== recept.id) {
                            Object.assign(e.currentTarget.style, tableStyles.actionButton)
                          }
                        }}
                      >
                        {deletingId === recept.id ? (
                          <Loader2
                            style={{
                              height: "16px",
                              width: "16px",
                              color: "#286058",
                              animation: "spin 1s linear infinite",
                            }}
                          />
                        ) : (
                          <Trash2 style={{ height: "16px", width: "16px", color: "#e75129" }} />
                        )}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent
                      style={{
                        backgroundColor: "#eee1d1",
                        color: "#286058",
                        border: "none",
                        borderRadius: "8px",
                        padding: "24px",
                      }}
                    >
                      <AlertDialogHeader>
                        <AlertDialogTitle style={{ fontSize: "18px", fontWeight: 600, color: "#286058" }}>
                          Recept verwijderen
                        </AlertDialogTitle>
                        <AlertDialogDescription style={{ color: "#286058", opacity: 0.8 }}>
                          Weet je zeker dat je "{recept.naam}" wilt verwijderen? Deze actie kan niet ongedaan worden
                          gemaakt.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter style={{ marginTop: "16px" }}>
                        <AlertDialogCancel
                          style={tableStyles.cancelButton}
                          onMouseEnter={(e) => {
                            Object.assign(e.currentTarget.style, tableStyles.cancelButtonHover)
                          }}
                          onMouseLeave={(e) => {
                            Object.assign(e.currentTarget.style, tableStyles.cancelButton)
                          }}
                        >
                          Annuleren
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(recept.id)}
                          style={tableStyles.deleteButton}
                          onMouseEnter={(e) => {
                            Object.assign(e.currentTarget.style, tableStyles.deleteButtonHover)
                          }}
                          onMouseLeave={(e) => {
                            Object.assign(e.currentTarget.style, tableStyles.deleteButton)
                          }}
                        >
                          Verwijderen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
