"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"
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

  const buttonStyle = {
    backgroundColor: "#eee1d1",
    color: "#286058",
    border: "1px solid #286058",
  }

  const dropdownStyle = {
    backgroundColor: "#eee1d1",
    border: "1px solid #286058",
  }

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Type Filter */}
      <div className="relative">
        <button
          onClick={() => setOpenType(!openType)}
          style={buttonStyle}
          className="flex items-center justify-between w-[200px] px-3 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-opacity"
        >
          {currentType || "Type gerecht"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
        {openType && (
          <div
            style={dropdownStyle}
            className="absolute top-full left-0 mt-1 w-[200px] rounded-md shadow-lg z-50 max-h-60 overflow-auto"
          >
            <div className="p-2">
              <input
                type="text"
                placeholder="Zoek type..."
                className="w-full px-2 py-1 text-sm border rounded"
                style={{ backgroundColor: "white", color: "#286058" }}
              />
            </div>
            <div className="py-1">
              {gerechtsTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    updateFilters("type", currentType === type ? null : type)
                    setOpenType(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-white/50 transition-colors"
                  style={{ color: "#286058" }}
                >
                  <Check className={cn("mr-2 h-4 w-4", currentType === type ? "opacity-100" : "opacity-0")} />
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seizoen Filter */}
      <div className="relative">
        <button
          onClick={() => setOpenSeizoen(!openSeizoen)}
          style={buttonStyle}
          className="flex items-center justify-between w-[200px] px-3 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-opacity"
        >
          {currentSeizoen || "Seizoen"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
        {openSeizoen && (
          <div
            style={dropdownStyle}
            className="absolute top-full left-0 mt-1 w-[200px] rounded-md shadow-lg z-50 max-h-60 overflow-auto"
          >
            <div className="p-2">
              <input
                type="text"
                placeholder="Zoek seizoen..."
                className="w-full px-2 py-1 text-sm border rounded"
                style={{ backgroundColor: "white", color: "#286058" }}
              />
            </div>
            <div className="py-1">
              {seizoenen.map((seizoen) => (
                <button
                  key={seizoen}
                  onClick={() => {
                    updateFilters("seizoen", currentSeizoen === seizoen ? null : seizoen)
                    setOpenSeizoen(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-white/50 transition-colors"
                  style={{ color: "#286058" }}
                >
                  <Check className={cn("mr-2 h-4 w-4", currentSeizoen === seizoen ? "opacity-100" : "opacity-0")} />
                  {seizoen}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Eigenaar Filter */}
      <div className="relative">
        <button
          onClick={() => setOpenEigenaar(!openEigenaar)}
          style={buttonStyle}
          className="flex items-center justify-between w-[200px] px-3 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-opacity"
        >
          {currentEigenaar ? eigenaren.find((e) => e.value === currentEigenaar)?.label : "Eigenaar"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
        {openEigenaar && (
          <div
            style={dropdownStyle}
            className="absolute top-full left-0 mt-1 w-[200px] rounded-md shadow-lg z-50 max-h-60 overflow-auto"
          >
            <div className="p-2">
              <input
                type="text"
                placeholder="Zoek eigenaar..."
                className="w-full px-2 py-1 text-sm border rounded"
                style={{ backgroundColor: "white", color: "#286058" }}
              />
            </div>
            <div className="py-1">
              {eigenaren.map((eigenaar) => (
                <button
                  key={eigenaar.value}
                  onClick={() => {
                    updateFilters("eigenaar", currentEigenaar === eigenaar.value ? null : eigenaar.value)
                    setOpenEigenaar(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm hover:bg-white/50 transition-colors"
                  style={{ color: "#286058" }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", currentEigenaar === eigenaar.value ? "opacity-100" : "opacity-0")}
                  />
                  {eigenaar.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {(currentType || currentSeizoen || currentEigenaar || currentZoekterm) && (
        <button
          onClick={() => router.push("/zoeken")}
          className="px-4 py-2 rounded-md text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "#e75129", color: "white" }}
        >
          Filters wissen
        </button>
      )}
    </div>
  )
}
