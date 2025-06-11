"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
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
  const [openType, setOpenType] = useState(false)
  const [openSeizoen, setOpenSeizoen] = useState(false)
  const [openEigenaar, setOpenEigenaar] = useState(false)

  const [selectedType, setSelectedType] = useState<GerechtsType | null>(null)
  const [selectedSeizoen, setSelectedSeizoen] = useState<Seizoen | null>(null)
  const [selectedEigenaar, setSelectedEigenaar] = useState<Eigenaar | null>(null)

  const updateFilters = (
    type: GerechtsType | null = selectedType,
    seizoen: Seizoen | null = selectedSeizoen,
    eigenaar: Eigenaar | null = selectedEigenaar,
  ) => {
    setSelectedType(type)
    setSelectedSeizoen(seizoen)
    setSelectedEigenaar(eigenaar)

    const filters: FilterOptions = {}
    if (type) filters.type = type
    if (seizoen) filters.seizoen = seizoen
    if (eigenaar) filters.eigenaar = eigenaar

    onFiltersChange(filters)
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
      <div className="flex flex-wrap gap-2 justify-center">
        <Popover open={openType} onOpenChange={setOpenType}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openType} className="justify-between">
              {selectedType || "Type gerecht"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Zoek type..." />
              <CommandList>
                <CommandEmpty>Geen type gevonden.</CommandEmpty>
                <CommandGroup>
                  {gerechtsTypes.map((type) => (
                    <CommandItem
                      key={type}
                      value={type}
                      onSelect={() => {
                        updateFilters(selectedType === type ? null : type)
                        setOpenType(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedType === type ? "opacity-100" : "opacity-0")} />
                      {type}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover open={openSeizoen} onOpenChange={setOpenSeizoen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openSeizoen} className="justify-between">
              {selectedSeizoen || "Seizoen"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Zoek seizoen..." />
              <CommandList>
                <CommandEmpty>Geen seizoen gevonden.</CommandEmpty>
                <CommandGroup>
                  {seizoenen.map((seizoen) => (
                    <CommandItem
                      key={seizoen}
                      value={seizoen}
                      onSelect={() => {
                        updateFilters(selectedType, selectedSeizoen === seizoen ? null : seizoen)
                        setOpenSeizoen(false)
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", selectedSeizoen === seizoen ? "opacity-100" : "opacity-0")}
                      />
                      {seizoen}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover open={openEigenaar} onOpenChange={setOpenEigenaar}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openEigenaar} className="justify-between">
              {selectedEigenaar ? eigenaren.find((e) => e.value === selectedEigenaar)?.label : "Eigenaar"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Zoek eigenaar..." />
              <CommandList>
                <CommandEmpty>Geen eigenaar gevonden.</CommandEmpty>
                <CommandGroup>
                  {eigenaren.map((eigenaar) => (
                    <CommandItem
                      key={eigenaar.value}
                      value={eigenaar.value}
                      onSelect={() => {
                        updateFilters(
                          selectedType,
                          selectedSeizoen,
                          selectedEigenaar === eigenaar.value ? null : eigenaar.value,
                        )
                        setOpenEigenaar(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedEigenaar === eigenaar.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {eigenaar.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-10">
            Wis filters
          </Button>
        )}
      </div>
    </div>
  )
}
