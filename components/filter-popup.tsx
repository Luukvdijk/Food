"use client"

import { useState, useEffect } from "react"
import { ChevronDown, X } from "lucide-react"
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

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

  const toggleDropdown = (category: string) => {
    setOpenDropdown(openDropdown === category ? null : category)
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

  const clearFilters = () => {
    setFilters({})
    onFiltersChange({})
    onClose()
  }

  if (!isOpen) return null

  const getSelectedCount = (category: keyof FilterOptions) => {
    return (filters[category] || []).length
  }

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className={`absolute top-0 left-8 w-96 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-[#eee1d1] rounded-b-xl shadow-2xl flex flex-col"
          style={{ height: "70vh", maxHeight: "500px" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 pb-4 flex-shrink-0">
            <h2 className="text-[#e75129] text-3xl font-medium">Filters</h2>
            <X className="h-6 w-6 text-[#e75129] cursor-pointer" onClick={onClose} />
          </div>

          {/* Filter Categories - Scrollable */}
          <div className="flex-1 px-6 overflow-y-auto">
            <div className="space-y-3">
              {/* Vlees Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("vlees")}
                  className="w-full flex justify-between items-center p-3 bg-white rounded-lg border border-[#286058]/20 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-[#286058] text-lg font-medium">
                    Vlees {getSelectedCount("vlees") > 0 && `(${getSelectedCount("vlees")})`}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#286058] transform transition-transform ${
                      openDropdown === "vlees" ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {openDropdown === "vlees" && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[#286058]/20 shadow-lg z-10 max-h-32 overflow-y-auto">
                    {options.vlees.map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-2 hover:bg-gray-50">
                        <Checkbox
                          id={`vlees-${option}`}
                          checked={(filters.vlees || []).includes(option)}
                          onCheckedChange={() => toggleFilter("vlees", option)}
                          className="border-[#286058] data-[state=checked]:bg-[#e75129] data-[state=checked]:border-[#e75129]"
                        />
                        <label htmlFor={`vlees-${option}`} className="text-[#286058] cursor-pointer flex-1 text-sm">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Berijding Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("berijding")}
                  className="w-full flex justify-between items-center p-3 bg-white rounded-lg border border-[#286058]/20 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-[#286058] text-lg font-medium">
                    Berijding {getSelectedCount("berijding") > 0 && `(${getSelectedCount("berijding")})`}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#286058] transform transition-transform ${
                      openDropdown === "berijding" ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {openDropdown === "berijding" && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[#286058]/20 shadow-lg z-10 max-h-32 overflow-y-auto">
                    {options.berijding.map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-2 hover:bg-gray-50">
                        <Checkbox
                          id={`berijding-${option}`}
                          checked={(filters.berijding || []).includes(option)}
                          onCheckedChange={() => toggleFilter("berijding", option)}
                          className="border-[#286058] data-[state=checked]:bg-[#e75129] data-[state=checked]:border-[#e75129]"
                        />
                        <label htmlFor={`berijding-${option}`} className="text-[#286058] cursor-pointer flex-1 text-sm">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seizoen Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("seizoen")}
                  className="w-full flex justify-between items-center p-3 bg-white rounded-lg border border-[#286058]/20 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-[#286058] text-lg font-medium">
                    Seizoen {getSelectedCount("seizoen") > 0 && `(${getSelectedCount("seizoen")})`}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#286058] transform transition-transform ${
                      openDropdown === "seizoen" ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {openDropdown === "seizoen" && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[#286058]/20 shadow-lg z-10 max-h-32 overflow-y-auto">
                    {options.seizoen.map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-2 hover:bg-gray-50">
                        <Checkbox
                          id={`seizoen-${option}`}
                          checked={(filters.seizoen || []).includes(option)}
                          onCheckedChange={() => toggleFilter("seizoen", option)}
                          className="border-[#286058] data-[state=checked]:bg-[#e75129] data-[state=checked]:border-[#e75129]"
                        />
                        <label htmlFor={`seizoen-${option}`} className="text-[#286058] cursor-pointer flex-1 text-sm">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Eigenaar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("eigenaar")}
                  className="w-full flex justify-between items-center p-3 bg-white rounded-lg border border-[#286058]/20 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-[#286058] text-lg font-medium">
                    Eigenaar {getSelectedCount("eigenaar") > 0 && `(${getSelectedCount("eigenaar")})`}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#286058] transform transition-transform ${
                      openDropdown === "eigenaar" ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                {openDropdown === "eigenaar" && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[#286058]/20 shadow-lg z-10 max-h-32 overflow-y-auto">
                    {options.eigenaar.map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-2 hover:bg-gray-50">
                        <Checkbox
                          id={`eigenaar-${option}`}
                          checked={(filters.eigenaar || []).includes(option)}
                          onCheckedChange={() => toggleFilter("eigenaar", option)}
                          className="border-[#286058] data-[state=checked]:bg-[#e75129] data-[state=checked]:border-[#e75129]"
                        />
                        <label htmlFor={`eigenaar-${option}`} className="text-[#286058] cursor-pointer flex-1 text-sm">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Always Visible */}
          <div className="p-6 pt-4 flex gap-3 flex-shrink-0 border-t border-[#286058]/10">
            <button
              onClick={clearFilters}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-md text-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Wis alles
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 bg-[#e75129] text-white px-4 py-3 rounded-md text-lg font-medium hover:bg-[#d04a26] transition-colors"
            >
              Toepassen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
