"use client"

import { useState, useTransition } from "react"
import { Star, Minus, Plus, Users } from "lucide-react"
import Image from "next/image"
import { IngredientsPopup } from "./ingredients-popup"
import { refreshHomepage } from "@/app/actions"
import { useRouter } from "next/navigation"

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
  const [hoverStates, setHoverStates] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const incrementServings = () => setServings((prev) => prev + 1)
  const decrementServings = () => setServings((prev) => Math.max(1, prev - 1))

  const handleNewRecipe = () => {
    startTransition(async () => {
      try {
        await refreshHomepage()
        router.refresh()
      } catch (error) {
        console.error("Error refreshing recipe:", error)
        // Fallback to window reload if server action fails
        window.location.reload()
      }
    })
  }

  const handleImageClick = () => {
    if (recept) {
      setShowIngredientsPopup(true)
    }
  }

  const handleBadgeHover = (id: string, isHovering: boolean) => {
    setHoverStates((prev) => ({
      ...prev,
      [id]: isHovering,
    }))
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {recept.seizoen.map((seizoen) => (
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
                  {recept.type}
                </span>
                {recept.tags.slice(0, 1).map((tag) => (
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
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
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
                  {isPending ? "Laden..." : "Nieuw gerecht"}
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
