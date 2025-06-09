"use client"

import { useState } from "react"
import { deleteRecept } from "../actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Trash2, Eye, Clock, Users, Pencil } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ReceptenTableProps {
  recepten: any[]
}

export function ReceptenTable({ recepten }: ReceptenTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const router = useRouter()

  // Check if eigenaar column exists in the data
  const hasEigenaarColumn = recepten.length > 0 && "eigenaar" in recepten[0]

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    await deleteRecept(id)
    setDeletingId(null)
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Naam</TableHead>
            {hasEigenaarColumn && <TableHead>Eigenaar</TableHead>}
            <TableHead>Type</TableHead>
            <TableHead>Tijd</TableHead>
            <TableHead>Personen</TableHead>
            <TableHead>Ingrediënten</TableHead>
            <TableHead>Bijgerechten</TableHead>
            <TableHead>Acties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recepten.map((recept) => (
            <TableRow key={recept.id}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold">{recept.naam}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">{recept.beschrijving}</div>
                </div>
              </TableCell>
              {hasEigenaarColumn && (
                <TableCell>
                  <Badge className={getEigenaarColor(recept.eigenaar)}>
                    {recept.eigenaar === "henk" ? "Henk" : "Pepie & Luulie"}
                  </Badge>
                </TableCell>
              )}
              <TableCell>
                <Badge variant="outline">{recept.type}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {recept.bereidingstijd}m
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="mr-1 h-3 w-3" />
                  {recept.personen}
                </div>
              </TableCell>
              <TableCell>{recept.ingredient_count || 0}</TableCell>
              <TableCell>{recept.bijgerecht_count || 0}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/recept/${recept.id}`}>
                      <Eye className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(recept.id)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={deletingId === recept.id}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Recept verwijderen</AlertDialogTitle>
                        <AlertDialogDescription>
                          Weet je zeker dat je "{recept.naam}" wilt verwijderen? Deze actie kan niet ongedaan worden
                          gemaakt.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuleren</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(recept.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Verwijderen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
