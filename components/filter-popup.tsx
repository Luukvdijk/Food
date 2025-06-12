"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@supabase/supabase-js"

// Define types
export interface FilterOptions {
  vlees?: string[]
  berijding?: string[]
  seizoen?: string[]
  eigenaar?: string[]
}

interface FilterPopupProps {
  isOpen: boolean
  onClose: () => void
  onFiltersChange: (filters: FilterOptions) => void
  currentFilters: FilterOptions
}

export function FilterPopup({ isOpen, onClose, onFiltersChange, currentFilters }: FilterPopupProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters || {})
  const [categories, setCategories] = useState({
    vlees: true,
    berijding: true,
    seizoen: true,
    eigenaar: true,
  })

  // Initialize with some default options
  const [options, setOptions] = useState({
    vlees: ["Vlees", "Vegetarisch", "Vis"],
    berijding: ["Oven", "Pan", "Magnetron", "Bakken", "Koken"],
    seizoen: ["Winter", "Lente", "Zomer", "Herfst"],
    eigenaar: ["Henk", "Pepie & Luulie"],
  })

  // Fetch actual options from database
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        )

        // Fetch unique values for each category
        const { data: recepten } = await supabase.from("recepten").select("type, eigenaar, seizoen")

        if (recepten) {
          // Extract unique values
          const typeOptions = [...new Set(recepten.map((r) => r.type).filter(Boolean))]
          const eigenaarOptions = [...new Set(recepten.map((r) => r.eigenaar).filter(Boolean))]

          // Extract unique values from seizoen arrays
          const seizoenOptions = [...new Set(recepten.flatMap((r) => r.seizoen || []).filter(Boolean))]

          // Update options with actual data
          setOptions((prev) => ({
            ...prev,
            vlees: typeOptions.length > 0 ? typeOptions : prev.vlees,
            seizoen: seizoenOptions.length > 0 ? seizoenOptions : prev.seizoen,
            eigenaar: eigenaarOptions.length > 0 ? eigenaarOptions : prev.eigenaar,
          }))
        }
      } catch (error) {
        console.error("Error fetching filter options:", error)
      }
    }

    if (isOpen) {
      fetchOptions()
    }
  }, [isOpen])

  const toggleCategory = (category: keyof typeof categories) => {
    setCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const toggleFilter = (category: keyof FilterOptions, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[category] || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value]

      return {
        ...prev,
        [category]: newValues.length > 0 ? newValues : undefined,
      }
    })
  }

  const applyFilters = () => {
    onFiltersChange(filters)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className={`absolute top-0 left-8 w-96 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#eee1d1] rounded-b-xl shadow-2xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[#e75129] text-3xl font-medium">Filters</h2>
            <ChevronDown className="h-6 w-6 text-[#e75129] cursor-pointer transform rotate-180" onClick={onClose} />
          </div>

          {/* Vlees Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleCategory("vlees")}>
              <h3 className="text-[#286058] text-2xl font-medium">Vlees</h3>
              <ChevronDown
                className={`h-6 w-6 text-[#286058] transform transition-transform ${categories.vlees ? "rotate-0" : "rotate-180"}`}
              />
            </div>

            {categories.vlees && (
              <div className="mt-3 space-y-3">
                {options.vlees.map((option) => (
                  <div key={option} className="flex items-center space-x-3">
                    <Checkbox
                      id={`vlees-${option}`}
                      checked={(filters.vlees || []).includes(option)}
                      onCheckedChange={() => toggleFilter("vlees", option)}
                      className="border-[#286058] data-[state=checked]:bg-[#e75129] data-[state=checked]:border-[#e75129]"
                    />
                    <label htmlFor={`vlees-${option}`} className="text-[#286058] text-xl cursor-pointer">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-[#286058]/20 my-4" />

          {/* Berijding Section */}
          <div className="mb-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleCategory("berijding")}
            >
              <h3 className="text-[#286058] text-2xl font-medium">Berijding</h3>
              <ChevronDown
                className={`h-6 w-6 text-[#286058] transform transition-transform ${categories.berijding ? "rotate-0" : "rotate-180"}`}
              />
            </div>

            {categories.berijding && (
              <div className="mt-3 space-y-3">
                {options.berijding.map((option) => (
                  <div key={option} className="flex items-center space-x-3">
                    <Checkbox
                      id={`berijding-${option}`}
                      checked={(filters.berijding || []).includes(option)}
                      onCheckedChange={() => toggleFilter("berijding", option)}
                      className="border-[#286058] data-[state=checked]:bg-[#e75129] data-[state=checked]:border-[#e75129]"
                    />
                    <label htmlFor={`berijding-${option}`} className="text-[#286058] text-xl cursor-pointer">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-[#286058]/20 my-4" />

          {/* Seizoen Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleCategory("seizoen")}>
              <h3 className="text-[#286058] text-2xl font-medium">Seizoen</h3>
              <ChevronDown
                className={`h-6 w-6 text-[#286058] transform transition-transform ${categories.seizoen ? "rotate-0" : "rotate-180"}`}
              />
            </div>

            {categories.seizoen && (
              <div className="mt-3 space-y-3">
                {options.seizoen.map((option) => (
                  <div key={option} className="flex items-center space-x-3">
                    <Checkbox
                      id={`seizoen-${option}`}
                      checked={(filters.seizoen || []).includes(option)}
                      onCheckedChange={() => toggleFilter("seizoen", option)}
                      className="border-[#286058] data-[state=checked]:bg-[#e75129] data-[state=checked]:border-[#e75129]"
                    />
                    <label htmlFor={`seizoen-${option}`} className="text-[#286058] text-xl cursor-pointer">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-[#286058]/20 my-4" />

          {/* Eigenaar Section */}
          <div className="mb-6">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleCategory("eigenaar")}
            >
              <h3 className="text-[#286058] text-2xl font-medium">Eigenaar</h3>
              <ChevronDown
                className={`h-6 w-6 text-[#286058] transform transition-transform ${categories.eigenaar ? "rotate-0" : "rotate-180"}`}
              />
            </div>

            {categories.eigenaar && (
              <div className="mt-3 space-y-3">
                {options.eigenaar.map((option) => (
                  <div key={option} className="flex items-center space-x-3">
                    <Checkbox
                      id={`eigenaar-${option}`}
                      checked={(filters.eigenaar || []).includes(option)}
                      onCheckedChange={() => toggleFilter("eigenaar", option)}
                      className="border-[#286058] data-[state=checked]:bg-[#e75129] data-[state=checked]:border-[#e75129]"
                    />
                    <label htmlFor={`eigenaar-${option}`} className="text-[#286058] text-xl cursor-pointer">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Apply Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={applyFilters}
              className="bg-[#e75129] text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-[#d04a26] transition-colors"
            >
              Filters toepassen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
