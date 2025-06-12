"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedSeizoen, setSelectedSeizoen] = useState<string>("")
  const [selectedEigenaar, setSelectedEigenaar] = useState<string>("")

  const updateFilters = (type?: string, seizoen?: string, eigenaar?: string) => {
    const filters: FilterOptions = {}

    const finalType = type !== undefined ? type : selectedType
    const finalSeizoen = seizoen !== undefined ? seizoen : selectedSeizoen
    const finalEigenaar = eigenaar !== undefined ? eigenaar : selectedEigenaar

    if (finalType && finalType !== "all") filters.type = finalType as GerechtsType
    if (finalSeizoen && finalSeizoen !== "all") filters.seizoen = finalSeizoen as Seizoen
    if (finalEigenaar && finalEigenaar !== "all") filters.eigenaar = finalEigenaar as Eigenaar

    console.log("Updating filters:", filters)
    onFiltersChange(filters)
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value)
    updateFilters(value, undefined, undefined)
  }

  const handleSeizoenChange = (value: string) => {
    setSelectedSeizoen(value)
    updateFilters(undefined, value, undefined)
  }

  const handleEigenaarChange = (value: string) => {
    setSelectedEigenaar(value)
    updateFilters(undefined, undefined, value)
  }

  const resetFilters = () => {
    setSelectedType("")
    setSelectedSeizoen("")
    setSelectedEigenaar("")
    onFiltersChange({})
  }

  const hasActiveFilters =
    (selectedType && selectedType !== "all") ||
    (selectedSeizoen && selectedSeizoen !== "all") ||
    (selectedEigenaar && selectedEigenaar !== "all")

  return (
    <div className="space-y-4 w-full max-w-md">
      <h3 className="text-sm font-medium text-center">Filter op:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Alle types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle types</SelectItem>
              {gerechtsTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Select value={selectedSeizoen} onValueChange={handleSeizoenChange}>
            <SelectTrigger>
              <SelectValue placeholder="Alle seizoenen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle seizoenen</SelectItem>
              {seizoenen.map((seizoen) => (
                <SelectItem key={seizoen} value={seizoen}>
                  {seizoen}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Select value={selectedEigenaar} onValueChange={handleEigenaarChange}>
            <SelectTrigger>
              <SelectValue placeholder="Alle eigenaren" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle eigenaren</SelectItem>
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
