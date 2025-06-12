"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, ChevronDown, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FilterPopup } from "./filter-popup"
import type { FilterOptions } from "@/types"

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
                <Input
                  type="search"
                  placeholder="Zoek jouw gerecht"
                  value={zoekterm}
                  onChange={(e) => setZoekterm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
                />
              </div>
            </form>

            {/* Admin */}
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <Button asChild variant="ghost" className="text-white hover:bg-white/10">
                  <Link href="/admin">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="ghost" className="text-white hover:bg-white/10">
                  <Link href="/auth/signin">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Login
                  </Link>
                </Button>
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
