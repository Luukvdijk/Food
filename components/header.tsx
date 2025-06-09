"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Header() {
  const [zoekterm, setZoekterm] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (zoekterm.trim()) {
      router.push(`/zoeken?q=${encodeURIComponent(zoekterm)}`)
    }
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

          <Button asChild variant="outline" size="sm">
            <Link href="/admin">
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
