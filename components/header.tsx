"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Header() {
  const [zoekterm, setZoekterm] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    // Check login status client-side
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return null
  }

  return (
    <header className="border-b">
      <div className="container mx-auto py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">
            <a href="/" className="hover:text-primary transition-colors">
              Lekkere Recepten
            </a>
          </h1>

          <form onSubmit={handleSearch} className="w-full md:w-1/2 flex gap-2">
            <Input
              type="search"
              placeholder="Zoek recepten op naam of ingrediënten..."
              value={zoekterm}
              onChange={(e) => setZoekterm(e.target.value)}
              className="w-full"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
              <span className="sr-only">Zoeken</span>
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {isLoggedIn ? (
              <>
                <span className="text-sm text-muted-foreground hidden md:inline">Ingelogd als Admin</span>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm">
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
  )
}
