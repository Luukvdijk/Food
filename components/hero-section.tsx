"use client"

import { useState, useTransition, useEffect } from "react"
import { Star, Minus, Plus, Users, Filter } from "lucide-react"
import Image from "next/image"
import { IngredientsPopup } from "./ingredients-popup"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HeroSectionProps {
  recept?: {
    id: number
    naam: string
    afbeelding_url?: string
    seizoen: string[]
    tags: string[]
    type: string
    eigenaar?: string
  } | null
}

interface FilterOptions {
  types: string[]
  seizoenen: string[]
  eigenaars: string[]
}

export function HeroSection({ recept: initialRecept }: HeroSectionProps) {
  const [servings, setServings] = useState(1)
  const [showIngredientsPopup, setShowIngredientsPopup] = useState(false)
  const [hoverStates, setHoverStates] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: "",
    seizoen: "",
    eigenaar: "",
  })
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    types: [],
    seizoenen: [],
    eigenaars: [],
  })
  const [currentRecept, setCurrentRecept] = useState(initialRecept)
  const router = useRouter()
  const [minHeight, setMinHeight] = useState("calc(100vh - 80px)")

  // Load filter options on component mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        console.log("Loading filter options...")
        const response = await fetch("/api/get-filter-options")
        const options = await response.json()
        console.log("Filter options loaded:", options)
        setFilterOptions(options)
      } catch (error) {
        console.error("Error loading filter options:", error)
      }
    }

    loadFilterOptions()
  }, [])

  // Adjust height based on screen size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        setMinHeight("auto")
      } else {
        setMinHeight("calc(100vh - 80px)")
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const incrementServings = () => setServings((prev) => prev + 1)
  const decrementServings = () => setServings((prev) => Math.max(1, prev - 1))

  const fetchRandomRecipe = async () => {
    try {
      let url = "/api/random-recept"
      const params = new URLSearchParams()

      // Only add filters if they have actual values
      if (filters.type) {
        params.append("type", filters.type)
      }
      if (filters.seizoen) {
        params.append("seizoen", filters.seizoen)
      }
      if (filters.eigenaar) {
        params.append("eigenaar", filters.eigenaar)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      console.log("=== Fetching Random Recipe ===")
      console.log("URL:", url)
      console.log("Current filters:", filters)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      console.log("API Response:", data)

      if (data && data.id) {
        setCurrentRecept(data)
        console.log("New recipe loaded:", data.naam)
      } else {
        console.log("No recipe found with current filters")
        alert("Geen recepten gevonden met deze filters. Probeer andere filters.")
      }
    } catch (error) {
      console.error("Error fetching random recipe:", error)
      alert("Er is een fout opgetreden bij het ophalen van een recept.")
    }
  }

  const handleNewRecipe = () => {
    console.log("=== New Recipe Button Clicked ===")
    console.log("Current filters:", filters)

    startTransition(async () => {
      await fetchRandomRecipe()
    })
  }

  const handleFilterChange = (filterType: string, value: string) => {
    console.log(`Filter changed: ${filterType} = ${value}`)
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const applyFilters = () => {
    console.log("=== Apply Filters Clicked ===")
    console.log("Filters to apply:", filters)

    startTransition(async () => {
      await fetchRandomRecipe()
    })
  }

  const clearFilters = () => {
    console.log("=== Clear Filters Clicked ===")
    setFilters({ type: "", seizoen: "", eigenaar: "" })

    startTransition(async () => {
      // Fetch without any filters
      try {
        const response = await fetch("/api/random-recept")
        const data = await response.json()
        if (data && data.id) {
          setCurrentRecept(data)
        }
      } catch (error) {
        console.error("Error clearing filters:", error)
      }
    })
  }

  const handleImageClick = () => {
    if (currentRecept) {
      setShowIngredientsPopup(true)
    }
  }

  const handleBadgeHover = (id: string, isHovering: boolean) => {
    setHoverStates((prev) => ({
      ...prev,
      [id]: isHovering,
    }))
  }

  const hasActiveFilters = filters.type || filters.seizoen || filters.eigenaar

  if (!currentRecept) {
    return (
      <section
        className="bg-[#286058] text-white relative overflow-hidden w-full flex items-center py-16 md:py-0"
        style={{ minHeight: minHeight }}
      >
        <div className="w-full py-12 px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-8">Geen recept gevonden</h1>
            <p className="text-xl opacity-90">Probeer andere filters of zoek een ander recept</p>
            <Button onClick={clearFilters} className="mt-4 bg-[#e75129] hover:bg-[#d63e1a]">
              Alle recepten tonen
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section
        className="bg-[#286058] text-white relative overflow-hidden w-full flex items-center py-16 md:py-0"
        style={{ minHeight: minHeight }}
      >
        <div className="w-full py-12 px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">{currentRecept.naam}</h1>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {currentRecept.seizoen?.map((seizoen) => (
                  <span
                    key={seizoen}
                    style={{
                      backgroundColor: hoverStates[`seizoen-${seizoen}`] ? "#d1c7b8" : "#eee1d1",
                      color: "#286058",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "background-color 0.2s ease",
                      cursor: "default",
                    }}
                    onMouseEnter={() => handleBadgeHover(`seizoen-${seizoen}`, true)}
                    onMouseLeave={() => handleBadgeHover(`seizoen-${seizoen}`, false)}
                  >
                    {seizoen}
                  </span>
                ))}
                <span
                  style={{
                    backgroundColor: hoverStates["type"] ? "#d1c7b8" : "#eee1d1",
                    color: "#286058",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "background-color 0.2s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={() => handleBadgeHover("type", true)}
                  onMouseLeave={() => handleBadgeHover("type", false)}
                >
                  {currentRecept.type}
                </span>
                {currentRecept.tags?.slice(0, 1).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: hoverStates[`tag-${tag}`] ? "#d1c7b8" : "#eee1d1",
                      color: "#286058",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "background-color 0.2s ease",
                      cursor: "default",
                    }}
                    onMouseEnter={() => handleBadgeHover(`tag-${tag}`, true)}
                    onMouseLeave={() => handleBadgeHover(`tag-${tag}`, false)}
                  >
                    {tag}
                  </span>
                ))}
                {currentRecept.eigenaar && (
                  <span
                    style={{
                      backgroundColor: hoverStates["eigenaar"] ? "#d1c7b8" : "#eee1d1",
                      color: "#286058",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "background-color 0.2s ease",
                      cursor: "default",
                    }}
                    onMouseEnter={() => handleBadgeHover("eigenaar", true)}
                    onMouseLeave={() => handleBadgeHover("eigenaar", false)}
                  >
                    {currentRecept.eigenaar}
                  </span>
                )}
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white focus:text-white"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? "Verberg filters" : "Toon filters"}
                </Button>
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white focus:text-white"
                    disabled={isPending}
                  >
                    Wis filters
                  </Button>
                )}
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="bg-white/15 backdrop-blur-sm rounded-lg p-6 space-y-4 border border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Type</label>
                      <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                        <SelectTrigger className="bg-white text-[#286058] border-white/50 hover:bg-gray-50 focus:ring-2 focus:ring-[#e75129] [&>span]:text-[#286058]">
                          <SelectValue placeholder="Alle types" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 [&>*]:text-[#286058]">
                          <SelectItem
                            value="all"
                            className="text-[#286058] hover:bg-gray-100 focus:bg-gray-100 focus:text-[#286058] data-[highlighted]:bg-gray-100 data-[highlighted]:text-[#286058]"
                          >
                            Alle types
                          </SelectItem>
                          {filterOptions.types.map((type) => (
                            <SelectItem
                              key={type}
                              value={type}
                              className="text-[#286058] hover:bg-gray-100 focus:bg-gray-100 focus:text-[#286058] data-[highlighted]:bg-gray-100 data-[highlighted]:text-[#286058]"
                            >
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Seizoen</label>
                      <Select value={filters.seizoen} onValueChange={(value) => handleFilterChange("seizoen", value)}>
                        <SelectTrigger className="bg-white text-[#286058] border-white/50 hover:bg-gray-50 focus:ring-2 focus:ring-[#e75129] [&>span]:text-[#286058]">
                          <SelectValue placeholder="Alle seizoenen" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 [&>*]:text-[#286058]">
                          <SelectItem
                            value="all"
                            className="text-[#286058] hover:bg-gray-100 focus:bg-gray-100 focus:text-[#286058] data-[highlighted]:bg-gray-100 data-[highlighted]:text-[#286058]"
                          >
                            Alle seizoenen
                          </SelectItem>
                          {filterOptions.seizoenen.map((seizoen) => (
                            <SelectItem
                              key={seizoen}
                              value={seizoen}
                              className="text-[#286058] hover:bg-gray-100 focus:bg-gray-100 focus:text-[#286058] data-[highlighted]:bg-gray-100 data-[highlighted]:text-[#286058]"
                            >
                              {seizoen}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Eigenaar</label>
                      <Select value={filters.eigenaar} onValueChange={(value) => handleFilterChange("eigenaar", value)}>
                        <SelectTrigger className="bg-white text-[#286058] border-white/50 hover:bg-gray-50 focus:ring-2 focus:ring-[#e75129] [&>span]:text-[#286058]">
                          <SelectValue placeholder="Alle eigenaars" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 [&>*]:text-[#286058]">
                          <SelectItem
                            value="all"
                            className="text-[#286058] hover:bg-gray-100 focus:bg-gray-100 focus:text-[#286058] data-[highlighted]:bg-gray-100 data-[highlighted]:text-[#286058]"
                          >
                            Alle eigenaars
                          </SelectItem>
                          {filterOptions.eigenaars.map((eigenaar) => (
                            <SelectItem
                              key={eigenaar}
                              value={eigenaar}
                              className="text-[#286058] hover:bg-gray-100 focus:bg-gray-100 focus:text-[#286058] data-[highlighted]:bg-gray-100 data-[highlighted]:text-[#286058]"
                            >
                              {eigenaar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={applyFilters}
                      disabled={isPending}
                      className="bg-[#e75129] hover:bg-[#d63e1a] text-white font-medium px-6 py-2 rounded-md transition-colors duration-200"
                    >
                      {isPending ? "Laden..." : "Filter toepassen"}
                    </Button>
                    <Button
                      onClick={clearFilters}
                      disabled={isPending}
                      variant="outline"
                      className="bg-white/10 border-white/40 text-white hover:bg-white/20 hover:border-white/60 font-medium px-6 py-2 rounded-md transition-colors duration-200"
                    >
                      Wis filters
                    </Button>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-6">
                <button
                  onClick={handleNewRecipe}
                  disabled={isPending}
                  style={{
                    backgroundColor: "#e75129",
                    color: "white",
                    padding: "12px 32px",
                    fontSize: "18px",
                    fontWeight: "500",
                    border: "none",
                    borderRadius: "6px",
                    cursor: isPending ? "not-allowed" : "pointer",
                    transition: "background-color 0.2s ease",
                    opacity: isPending ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isPending) {
                      e.currentTarget.style.backgroundColor = "#d63e1a"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPending) {
                      e.currentTarget.style.backgroundColor = "#e75129"
                    }
                  }}
                >
                  {isPending ? "Laden..." : hasActiveFilters ? "Nieuw gefilterd gerecht" : "Nieuw gerecht"}
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <button
                      onClick={decrementServings}
                      style={{
                        height: "32px",
                        width: "32px",
                        borderRadius: "50%",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                        backgroundColor: "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-xl font-medium w-8 text-center">{servings}</span>
                    <button
                      onClick={incrementServings}
                      style={{
                        height: "32px",
                        width: "32px",
                        borderRadius: "50%",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                        backgroundColor: "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <Users className="h-6 w-6 text-white/70" />
                </div>
              </div>
            </div>

            {/* Right Content - Recipe Image */}
            <div className="relative flex justify-center items-center">
              <div className="relative w-64 h-64 md:w-72 md:h-72 cursor-pointer group" onClick={handleImageClick}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden">
                  <Image
                    src={currentRecept.afbeelding_url || "/placeholder.svg?height=400&width=400&query=delicious food"}
                    alt={currentRecept.naam}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-[#e75129]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 288 288" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle
                      cx="144"
                      cy="144"
                      r="140"
                      stroke="#e75129"
                      strokeWidth="6"
                      strokeDasharray="15 10"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Klik voor ingrediënten
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-6 w-6 md:h-8 md:w-8 fill-[#e75129] text-[#e75129]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients Popup */}
      <IngredientsPopup
        isOpen={showIngredientsPopup}
        onClose={() => setShowIngredientsPopup(false)}
        receptId={currentRecept.id}
        servings={servings}
        receptNaam={currentRecept.naam}
      />
    </>
  )
}
