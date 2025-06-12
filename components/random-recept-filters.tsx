"use client"

import { useState, useEffect } from "react"
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
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedSeizoen, setSelectedSeizoen] = useState<string>("all")
  const [selectedEigenaar, setSelectedEigenaar] = useState<string>("all")
  const [dbInfo, setDbInfo] = useState<any>(null)

  // Fetch database info on component mount to help debug
  useEffect(() => {
    const fetchDbInfo = async () => {
      try {
        const response = await fetch("/api/debug-recepten")
        if (response.ok) {
          const data = await response.json()
          setDbInfo(data)
          console.log("Database info:", data)
        }
      } catch (error) {
        console.error("Error fetching DB info:", error)
      }
    }

    fetchDbInfo()
  }, [])

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
    console.log("Type changed to:", value)
    setSelectedType(value)
    updateFilters(value, undefined, undefined)
  }

  const handleSeizoenChange = (value: string) => {
    console.log("Seizoen changed to:", value)
    setSelectedSeizoen(value)
    updateFilters(undefined, value, undefined)
  }

  const handleEigenaarChange = (value: string) => {
    console.log("Eigenaar changed to:", value)
    setSelectedEigenaar(value)
    updateFilters(undefined, undefined, value)
  }

  const resetFilters = () => {
    setSelectedType("all")
    setSelectedSeizoen("all")
    setSelectedEigenaar("all")
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
              {dbInfo?.uniqueTypes
                ? dbInfo.uniqueTypes.map((type: string) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))
                : gerechtsTypes.map((type) => (
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
              {dbInfo?.uniqueSeasons
                ? dbInfo.uniqueSeasons.map((seizoen: string) => (
                    <SelectItem key={seizoen} value={seizoen}>
                      {seizoen}
                    </SelectItem>
                  ))
                : seizoenen.map((seizoen) => (
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
