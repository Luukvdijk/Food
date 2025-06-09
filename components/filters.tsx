"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { GerechtsType, Seizoen, Eigenaar } from "@/types"

const gerechtsTypes: GerechtsType[] = ["Ontbijt", "Lunch", "Diner", "Dessert", "Snack"]
const seizoenen: Seizoen[] = ["Lente", "Zomer", "Herfst", "Winter"]
const eigenaren: { value: Eigenaar; label: string }[] = [
  { value: "henk", label: "Henk" },
  { value: "pepie en luulie", label: "Pepie & Luulie" },
]

export function Filters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [openType, setOpenType] = useState(false)
  const [openSeizoen, setOpenSeizoen] = useState(false)
  const [openEigenaar, setOpenEigenaar] = useState(false)

  const currentType = searchParams.get("type") as GerechtsType | undefined
  const currentSeizoen = searchParams.get("seizoen") as Seizoen | undefined
  const currentEigenaar = searchParams.get("eigenaar") as Eigenaar | undefined
  const currentZoekterm = searchParams.get("q")

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === null) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`/zoeken?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Popover open={openType} onOpenChange={setOpenType}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={openType} className="justify-between w-[200px]">
            {currentType || "Type gerecht"}
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
                      updateFilters("type", currentType === type ? null : type)
                      setOpenType(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", currentType === type ? "opacity-100" : "opacity-0")} />
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
          <Button variant="outline" role="combobox" aria-expanded={openSeizoen} className="justify-between w-[200px]">
            {currentSeizoen || "Seizoen"}
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
                      updateFilters("seizoen", currentSeizoen === seizoen ? null : seizoen)
                      setOpenSeizoen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", currentSeizoen === seizoen ? "opacity-100" : "opacity-0")} />
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
          <Button variant="outline" role="combobox" aria-expanded={openEigenaar} className="justify-between w-[200px]">
            {currentEigenaar ? eigenaren.find((e) => e.value === currentEigenaar)?.label : "Eigenaar"}
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
                      updateFilters("eigenaar", currentEigenaar === eigenaar.value ? null : eigenaar.value)
                      setOpenEigenaar(false)
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", currentEigenaar === eigenaar.value ? "opacity-100" : "opacity-0")}
                    />
                    {eigenaar.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {(currentType || currentSeizoen || currentEigenaar || currentZoekterm) && (
        <Button variant="ghost" onClick={() => router.push("/zoeken")}>
          Filters wissen
        </Button>
      )}
    </div>
  )
}
