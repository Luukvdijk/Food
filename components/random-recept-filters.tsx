"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GerechtsType, Seizoen, Eigenaar, FilterOptions } from "@/types"

const gerechtsTypes: GerechtsType[] = ["Ontbijt", "Lunch", "Diner", "Dessert", "Snack"]
const seizoenen: Seizoen[] = ["Lente", "Zomer", "Herfst", "Winter"]
const eigenaren: { value: Eigenaar; label: string }[] = [
  { value: "henk", label: "Henk" },
  { value: "pepie en luulie", label: "Pepie & Luulie" },
]

interface RandomReceptFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void
}

export function RandomReceptFilters({ onFiltersChange }: RandomReceptFiltersProps) {
  const [selectedType, setSelectedType] = useState<GerechtsType | "">(null)
  const [selectedSeizoen, setSelectedSeizoen] = useState<Seizoen | "">(null)
  const [selectedEigenaar, setSelectedEigenaar] = useState<Eigenaar | "">(null)

  const updateFilters = () => {
    const filters: FilterOptions = {}
    if (selectedType) filters.type = selectedType
    if (selectedSeizoen) filters.seizoen = selectedSeizoen
    if (selectedEigenaar) filters.eigenaar = selectedEigenaar

    onFiltersChange(filters)
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value as GerechtsType | null)
    setTimeout(() => {
      const filters: FilterOptions = {}
      if (value) filters.type = value as GerechtsType
      if (selectedSeizoen) filters.seizoen = selectedSeizoen
      if (selectedEigenaar) filters.eigenaar = selectedEigenaar
      onFiltersChange(filters)
    }, 0)
  }

  const handleSeizoenChange = (value: string) => {
    setSelectedSeizoen(value as Seizoen | null)
    setTimeout(() => {
      const filters: FilterOptions = {}
      if (selectedType) filters.type = selectedType
      if (value) filters.seizoen = value as Seizoen
      if (selectedEigenaar) filters.eigenaar = selectedEigenaar
      onFiltersChange(filters)
    }, 0)
  }

  const handleEigenaarChange = (value: string) => {
    setSelectedEigenaar(value as Eigenaar | null)
    setTimeout(() => {
      const filters: FilterOptions = {}
      if (selectedType) filters.type = selectedType
      if (selectedSeizoen) filters.seizoen = selectedSeizoen
      if (value) filters.eigenaar = value as Eigenaar
      onFiltersChange(filters)
    }, 0)
  }

  const resetFilters = () => {
    setSelectedType(null)
    setSelectedSeizoen(null)
    setSelectedEigenaar(null)
    onFiltersChange({})
  }

  const hasActiveFilters = selectedType || selectedSeizoen || selectedEigenaar

  return (
    <div className="space-y-4 w-full max-w-md">
      <h3 className="text-sm font-medium text-center">Filter op:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type-select">Type gerecht</Label>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger id="type-select">
              <SelectValue placeholder="Alle types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Alle types</SelectItem>
              {gerechtsTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seizoen-select">Seizoen</Label>
          <Select value={selectedSeizoen} onValueChange={handleSeizoenChange}>
            <SelectTrigger id="seizoen-select">
              <SelectValue placeholder="Alle seizoenen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Alle seizoenen</SelectItem>
              {seizoenen.map((seizoen) => (
                <SelectItem key={seizoen} value={seizoen}>
                  {seizoen}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="eigenaar-select">Eigenaar</Label>
          <Select value={selectedEigenaar} onValueChange={handleEigenaarChange}>
            <SelectTrigger id="eigenaar-select">
              <SelectValue placeholder="Alle eigenaren" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Alle eigenaren</SelectItem>
              {eigenaren.map((eigenaar) => (
                <SelectItem key={eigenaar.value} value={eigenaar.value}>
                  {eigenaar.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Wis filters
          </Button>
        </div>
      )}
    </div>
  )
}
