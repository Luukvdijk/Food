"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    return <div className="text-center py-8">Laden...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter op Recept</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedReceptId} onValueChange={setSelectedReceptId}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle recepten</SelectItem>
              {recepten.map((recept) => (
                <SelectItem key={recept.id} value={recept.id.toString()}>
                  {recept.naam}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Ingrediënten tabel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ingrediënten ({filteredIngredienten.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredIngredienten.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Geen ingrediënten gevonden</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recept</TableHead>
                    <TableHead>Naam</TableHead>
                    <TableHead>Hoeveelheid</TableHead>
                    <TableHead>Eenheid</TableHead>
                    <TableHead>Notitie</TableHead>
                    <TableHead>Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIngredienten.map((ingredient) => (
                    <TableRow key={ingredient.id}>
                      <TableCell>
                        <Badge variant="outline">{ingredient.recept_naam}</Badge>
                      </TableCell>
                      <TableCell>
                        {editingId === ingredient.id ? (
                          <Input
                            value={editForm.naam}
                            onChange={(e) => setEditForm({ ...editForm, naam: e.target.value })}
                            className="w-full"
                          />
                        ) : (
                          ingredient.naam
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === ingredient.id ? (
                          <Input
                            type="number"
                            step="0.1"
                            value={editForm.hoeveelheid}
                            onChange={(e) =>
                              setEditForm({ ...editForm, hoeveelheid: Number.parseFloat(e.target.value) })
                            }
                            className="w-20"
                          />
                        ) : (
                          ingredient.hoeveelheid
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === ingredient.id ? (
                          <Input
                            value={editForm.eenheid}
                            onChange={(e) => setEditForm({ ...editForm, eenheid: e.target.value })}
                            className="w-20"
                          />
                        ) : (
                          ingredient.eenheid
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === ingredient.id ? (
                          <Input
                            value={editForm.notitie}
                            onChange={(e) => setEditForm({ ...editForm, notitie: e.target.value })}
                            className="w-32"
                            placeholder="Optioneel"
                          />
                        ) : (
                          ingredient.notitie || "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {editingId === ingredient.id ? (
                            <>
                              <Button size="sm" onClick={() => saveEdit(ingredient.id)} className="h-8 w-8 p-0">
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit} className="h-8 w-8 p-0">
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(ingredient)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteIngredient(ingredient.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
