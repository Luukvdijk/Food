"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, ChevronDown, Settings, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { FilterPopup, type FilterOptions } from "./filter-popup"

export function ModernHeader() {
  const [zoekterm, setZoekterm] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({})
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/status")
        const data = await response.json()
        setIsLoggedIn(data.isAuthenticated)
      } catch (error) {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (zoekterm.trim()) {
      router.push(`/zoeken?q=${encodeURIComponent(zoekterm)}`)
    }
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    // Apply filters to random recipe
    window.location.reload()
  }

  const clearSearch = () => {
    setZoekterm("")
  }

  return (
    <>
      <header className="bg-[#286058] text-white relative overflow-hidden w-full">
        <div className="w-full py-6 px-8 relative z-10">
          <div className="flex items-center justify-between">
            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-[#e75129] font-medium text-lg"
            >
              Filters
              <ChevronDown className="h-5 w-5" />
            </button>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Zoek jouw gerecht"
                  value={zoekterm}
                  onChange={(e) => setZoekterm(e.target.value)}
                  style={{
                    paddingLeft: "2.5rem",
                    paddingRight: zoekterm ? "2.5rem" : "1rem",
                    paddingTop: "0.5rem",
                    paddingBottom: "0.5rem",
                    width: "20rem",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "0.375rem",
                    color: "white",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
                    e.target.style.borderColor = "#eee1d1"
                    e.target.style.boxShadow = "0 0 0 2px rgba(238, 225, 209, 0.3)"
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"
                    e.target.style.boxShadow = "none"
                  }}
                />
                {zoekterm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#286058] hover:text-[#1a4a42] transition-colors"
                    style={{
                      backgroundColor: "#eee1d1",
                      borderRadius: "50%",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#d1c7b8"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#eee1d1"
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </form>

            {/* Admin */}
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    backgroundColor: "transparent",
                    color: "white",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }}
                  onClick={() => router.push("/admin")}
                >
                  <Settings className="h-4 w-4" />
                  Admin
                </button>
              ) : (
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    backgroundColor: "transparent",
                    color: "white",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }}
                  onClick={() => router.push("/auth/signin")}
                >
                  <Settings className="h-4 w-4" />
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Filter Popup */}
      <FilterPopup
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onFiltersChange={handleFiltersChange}
        currentFilters={filters}
      />
    </>
  )
}
