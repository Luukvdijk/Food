"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Ingredient, Recept } from "@/types"

interface IngredientWithRecept extends Ingredient {
  recept_naam: string
}

export function IngredientsManager() {
  const [ingredienten, setIngredienten] = useState<IngredientWithRecept[]>([])
  const [recepten, setRecepten] = useState<Recept[]>([])
  const [selectedReceptId, setSelectedReceptId] = useState<string>("all")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    naam: "",
    hoeveelheid: 0,
    eenheid: "",
    notitie: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Style constants
  const styles = {
    container: {
      backgroundColor: "#eee1d1",
      color: "#286058",
      border: "1px solid #d1d5db",
      borderRadius: "0.5rem",
      overflow: "hidden",
      marginBottom: "1.5rem",
    },
    header: {
      padding: "1.5rem",
      borderBottom: "1px solid #d1d5db",
    },
    content: {
      padding: "1.5rem",
    },
    select: {
      backgroundColor: "white",
      color: "#286058",
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      padding: "0.5rem",
      width: "100%",
      maxWidth: "20rem",
      cursor: "pointer",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
    },
    tableHeader: {
      backgroundColor: "#eee1d1",
      color: "#286058",
      fontWeight: "600",
      textAlign: "left" as const,
      padding: "0.75rem 1rem",
      borderBottom: "1px solid #d1d5db",
    },
    tableCell: {
      padding: "0.75rem 1rem",
      borderBottom: "1px solid #d1d5db",
      color: "#286058",
    },
    tableRow: {
      backgroundColor: "#eee1d1",
      transition: "background-color 0.2s ease",
    },
    badge: {
      backgroundColor: "#286058",
      color: "white",
      padding: "0.25rem 0.5rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: "500",
    },
    input: {
      backgroundColor: "white",
      color: "#286058",
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      padding: "0.5rem",
      width: "100%",
    },
    buttonOrange: {
      backgroundColor: "#e75129",
      color: "white",
      width: "32px",
      height: "32px",
      padding: "0",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background-color 0.2s ease",
    },
    buttonCream: {
      backgroundColor: "#eee1d1",
      color: "#286058",
      width: "32px",
      height: "32px",
      padding: "0",
      borderRadius: "4px",
      border: "1px solid #d1d5db",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background-color 0.2s ease",
    },
  }

  const [rowHoverStates, setRowHoverStates] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [ingredientenRes, receptenRes] = await Promise.all([
        fetch("/api/admin/ingredients"),
        fetch("/api/admin/recepten"),
      ])

      if (ingredientenRes.ok && receptenRes.ok) {
        const ingredientenData = await ingredientenRes.json()
        const receptenData = await receptenRes.json()
        setIngredienten(ingredientenData)
        setRecepten(receptenData)
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Fout bij laden van data",
        className: "bg-red-50 border-red-200 text-red-800",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredIngredienten =
    selectedReceptId === "all"
      ? ingredienten
      : ingredienten.filter((ing) => ing.recept_id.toString() === selectedReceptId)

  const startEdit = (ingredient: IngredientWithRecept) => {
    setEditingId(ingredient.id)
    setEditForm({
      naam: ingredient.naam,
      hoeveelheid: ingredient.hoeveelheid,
      eenheid: ingredient.eenheid,
      notitie: ingredient.notitie || "",
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ naam: "", hoeveelheid: 0, eenheid: "", notitie: "" })
  }

  const saveEdit = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/ingredients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        toast({
          title: "Succes!",
          description: "Ingredient succesvol bijgewerkt",
          className: "bg-green-50 border-green-200 text-green-800",
        })
        loadData()
        cancelEdit()
      } else {
        toast({
          title: "Fout",
          description: "Fout bij bijwerken",
          className: "bg-red-50 border-red-200 text-red-800",
        })
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Fout bij bijwerken",
        className: "bg-red-50 border-red-200 text-red-800",
      })
    }
  }

  const deleteIngredient = async (id: number) => {
    if (!confirm("Weet je zeker dat je dit ingredient wilt verwijderen?")) return

    try {
      const response = await fetch(`/api/admin/ingredients/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Succes!",
          description: "Ingredient verwijderd",
          className: "bg-green-50 border-green-200 text-green-800",
        })
        loadData()
      } else {
        toast({
          title: "Fout",
          description: "Fout bij verwijderen",
          className: "bg-red-50 border-red-200 text-red-800",
        })
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Fout bij verwijderen",
        className: "bg-red-50 border-red-200 text-red-800",
      })
    }
  }

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "2rem", color: "#286058" }}>Laden...</div>
  }

  return (
    <>
      <style jsx>{`
        .ingredients-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          color: #286058;
        }
        .table-responsive {
          overflow-x: auto;
        }
        .select-container {
          width: 100%;
          max-width: 20rem;
        }
        @media (min-width: 768px) {
          .select-container {
            width: 33.333333%;
          }
        }
      `}</style>

      <div className="ingredients-container">
        {/* Filter */}
        <div style={styles.container}>
          <div style={styles.header}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "0.5rem" }}>Filter op Recept</h3>
          </div>
          <div style={styles.content}>
            <div className="select-container">
              <select
                value={selectedReceptId}
                onChange={(e) => setSelectedReceptId(e.target.value)}
                style={styles.select}
              >
                <option value="all">Alle recepten</option>
                {recepten.map((recept) => (
                  <option key={recept.id} value={recept.id.toString()}>
                    {recept.naam}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ingrediënten tabel */}
        <div style={styles.container}>
          <div style={styles.header}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>Ingrediënten ({filteredIngredienten.length})</h3>
          </div>
          <div style={styles.content}>
            {filteredIngredienten.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>Geen ingrediënten gevonden</div>
            ) : (
              <div className="table-responsive">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Recept</th>
                      <th style={styles.tableHeader}>Naam</th>
                      <th style={styles.tableHeader}>Hoeveelheid</th>
                      <th style={styles.tableHeader}>Eenheid</th>
                      <th style={styles.tableHeader}>Notitie</th>
                      <th style={styles.tableHeader}>Acties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIngredienten.map((ingredient) => {
                      const rowHover = rowHoverStates[ingredient.id] || false
                      return (
                        <tr
                          key={ingredient.id}
                          style={{
                            ...styles.tableRow,
                            backgroundColor: rowHover ? "#f1ece2" : "#eee1d1",
                          }}
                          onMouseEnter={() => setRowHoverStates({ ...rowHoverStates, [ingredient.id]: true })}
                          onMouseLeave={() => setRowHoverStates({ ...rowHoverStates, [ingredient.id]: false })}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.badge}>{ingredient.recept_naam}</span>
                          </td>
                          <td style={styles.tableCell}>
                            {editingId === ingredient.id ? (
                              <input
                                type="text"
                                value={editForm.naam}
                                onChange={(e) => setEditForm({ ...editForm, naam: e.target.value })}
                                style={styles.input}
                              />
                            ) : (
                              ingredient.naam
                            )}
                          </td>
                          <td style={styles.tableCell}>
                            {editingId === ingredient.id ? (
                              <input
                                type="number"
                                step="0.1"
                                value={editForm.hoeveelheid}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, hoeveelheid: Number.parseFloat(e.target.value) })
                                }
                                style={{ ...styles.input, width: "80px" }}
                              />
                            ) : (
                              ingredient.hoeveelheid
                            )}
                          </td>
                          <td style={styles.tableCell}>
                            {editingId === ingredient.id ? (
                              <input
                                type="text"
                                value={editForm.eenheid}
                                onChange={(e) => setEditForm({ ...editForm, eenheid: e.target.value })}
                                style={{ ...styles.input, width: "80px" }}
                              />
                            ) : (
                              ingredient.eenheid
                            )}
                          </td>
                          <td style={styles.tableCell}>
                            {editingId === ingredient.id ? (
                              <input
                                type="text"
                                value={editForm.notitie}
                                onChange={(e) => setEditForm({ ...editForm, notitie: e.target.value })}
                                style={{ ...styles.input, width: "120px" }}
                                placeholder="Optioneel"
                              />
                            ) : (
                              ingredient.notitie || "-"
                            )}
                          </td>
                          <td style={styles.tableCell}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              {editingId === ingredient.id ? (
                                <>
                                  <button
                                    onClick={() => saveEdit(ingredient.id)}
                                    style={styles.buttonOrange}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d63e1a")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e75129")}
                                  >
                                    <Save className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    style={styles.buttonCream}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d1c7b8")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#eee1d1")}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEdit(ingredient)}
                                    style={styles.buttonOrange}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d63e1a")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e75129")}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => deleteIngredient(ingredient.id)}
                                    style={styles.buttonOrange}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d63e1a")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e75129")}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
