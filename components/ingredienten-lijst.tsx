"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Ingredient {
  id: number
  naam: string
  hoeveelheid: number
  eenheid: string
  notitie?: string
}

interface IngredientenLijstProps {
  ingredienten: Ingredient[]
  defaultPersonen: number
}

export function IngredientenLijst({ ingredienten, defaultPersonen }: IngredientenLijstProps) {
  const [personen, setPersonen] = useState(defaultPersonen)

  const berekenHoeveelheid = (origineleHoeveelheid: number) => {
    const factor = personen / defaultPersonen
    const nieuweHoeveelheid = origineleHoeveelheid * factor

    // Round to reasonable precision
    if (nieuweHoeveelheid < 1) {
      return Math.round(nieuweHoeveelheid * 100) / 100
    } else if (nieuweHoeveelheid < 10) {
      return Math.round(nieuweHoeveelheid * 10) / 10
    } else {
      return Math.round(nieuweHoeveelheid)
    }
  }

  const selectStyles = `
    .custom-select-content {
      background-color: white !important;
      border-color: #286058 !important;
    }
    .custom-select-item {
      color: #286058 !important;
    }
    .custom-select-item:hover {
      background-color: #eee1d1 !important;
      color: #286058 !important;
    }
    .custom-select-item[data-state="checked"] {
      background-color: #e75129 !important;
      color: white !important;
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: selectStyles }} />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="personen" className="text-sm font-medium">
            Aantal personen:
          </Label>
          <Select value={personen.toString()} onValueChange={(value) => setPersonen(Number(value))}>
            <SelectTrigger
              className="w-20"
              style={{
                backgroundColor: "white",
                color: "#286058",
                borderColor: "#286058",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="custom-select-content">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <SelectItem key={num} value={num.toString()} className="custom-select-item">
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Ingrediënten</h3>
          <ul className="space-y-2">
            {ingredienten.map((ingredient) => (
              <li key={ingredient.id} className="flex justify-between items-start">
                <span className="font-medium">{ingredient.naam}</span>
                <span className="text-sm text-right">
                  {berekenHoeveelheid(ingredient.hoeveelheid)} {ingredient.eenheid}
                  {ingredient.notitie && (
                    <div className="text-xs text-muted-foreground italic">{ingredient.notitie}</div>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
