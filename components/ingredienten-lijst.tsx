"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Ingredient } from "@/types"

interface IngredientenLijstProps {
  ingredienten: Ingredient[]
  defaultPersonen: number
}

export function IngredientenLijst({ ingredienten, defaultPersonen }: IngredientenLijstProps) {
  const [personen, setPersonen] = useState(defaultPersonen)
  const [aangepastIngredienten, setAangepastIngredienten] = useState(ingredienten)

  useEffect(() => {
    const factor = personen / defaultPersonen

    const nieuwIngredienten = ingredienten.map((ingredient) => ({
      ...ingredient,
      hoeveelheid: Math.round(ingredient.hoeveelheid * factor * 10) / 10,
    }))

    setAangepastIngredienten(nieuwIngredienten)
  }, [personen, defaultPersonen, ingredienten])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Ingrediënten</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm">Voor</span>
          <Select value={personen.toString()} onValueChange={(value) => setPersonen(Number.parseInt(value))}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder={personen.toString()} />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((aantal) => (
                <SelectItem key={aantal} value={aantal.toString()}>
                  {aantal} {aantal === 1 ? "persoon" : "personen"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ul className="space-y-2">
        {aangepastIngredienten.map((ingredient) => (
          <li key={ingredient.id} className="flex items-center">
            <span className="font-medium w-20">
              {ingredient.hoeveelheid} {ingredient.eenheid}
            </span>
            <span>{ingredient.naam}</span>
            {ingredient.notitie && <span className="text-muted-foreground ml-2 text-sm">({ingredient.notitie})</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
