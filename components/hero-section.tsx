"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Minus, Plus, Users } from "lucide-react"
import Image from "next/image"
import { IngredientsPopup } from "./ingredients-popup"

interface HeroSectionProps {
  recept?: {
    id: number
    naam: string
    afbeelding_url?: string
    seizoen: string[]
    tags: string[]
    type: string
  } | null
}

export function HeroSection({ recept }: HeroSectionProps) {
  const [servings, setServings] = useState(1)
  const [showIngredientsPopup, setShowIngredientsPopup] = useState(false)

  const incrementServings = () => setServings((prev) => prev + 1)
  const decrementServings = () => setServings((prev) => Math.max(1, prev - 1))

  const refreshPage = () => {
    window.location.reload()
  }

  const handleImageClick = () => {
    if (recept) {
      setShowIngredientsPopup(true)
    }
  }

  if (!recept) {
    return (
      <section className="bg-[#286058] text-white relative overflow-hidden min-h-[600px] w-full">
        <div className="w-full py-12 px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-8">Geen recept gevonden</h1>
            <p className="text-xl opacity-90">Probeer een ander recept te zoeken</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="bg-[#286058] text-white relative overflow-hidden min-h-[600px] w-full">
        <div className="w-full py-12 px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-6xl font-bold leading-tight">{recept.naam}</h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-3">
                {recept.seizoen.map((seizoen) => (
                  <Badge key={seizoen} variant="secondary" className="bg-[#eee1d1] text-black px-4 py-2 text-sm">
                    {seizoen}
                  </Badge>
                ))}
                <Badge variant="secondary" className="bg-[#eee1d1] text-black px-4 py-2 text-sm">
                  {recept.type}
                </Badge>
                {recept.tags.slice(0, 1).map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-[#eee1d1] text-black px-4 py-2 text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                <Button
                  onClick={refreshPage}
                  className="bg-[#e75129] hover:bg-[#e75129]/90 text-white px-8 py-3 text-lg"
                >
                  Nieuw gerecht
                </Button>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={decrementServings}
                      className="h-8 w-8 rounded-full border border-white/30 text-white hover:bg-white/20"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-medium w-8 text-center">{servings}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={incrementServings}
                      className="h-8 w-8 rounded-full border border-white/30 text-white hover:bg-white/20"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Users className="h-6 w-6 text-white/70" />
                </div>
              </div>
            </div>

            {/* Right Content - Recipe Image */}
            <div className="relative flex justify-center items-center">
              {/* Slightly larger overlay container */}
              <div className="relative w-72 h-72 cursor-pointer group" onClick={handleImageClick}>
                {/* Main image */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full overflow-hidden">
                  <Image
                    src={recept.afbeelding_url || "/placeholder.svg?height=400&width=400&query=delicious food"}
                    alt={recept.naam}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Color overlay on hover */}
                  <div className="absolute inset-0 bg-[#e75129]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Dashed Circle Overlay - just slightly bigger than image */}
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

                {/* Click Hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Klik voor ingrediënten
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-8 w-8 fill-[#e75129] text-[#e75129]" />
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
        receptId={recept.id}
        servings={servings}
        receptNaam={recept.naam}
      />
    </>
  )
}
