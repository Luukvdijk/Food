"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Minus } from "lucide-react"
import { IngredientsPopup } from "./ingredients-popup"
import { refreshHomepage } from "@/app/actions"

interface Recept {
  id: number
  naam: string
  afbeelding_url?: string
  seizoen?: string
  type?: string
  tags?: string
  bereidingstijd?: number
  moeilijkheidsgraad?: string
}

interface HeroSectionProps {
  recept: Recept | null
}

export function HeroSection({ recept }: HeroSectionProps) {
  const [servings, setServings] = useState(4)
  const [showIngredients, setShowIngredients] = useState(false)
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleNewRecipe = () => {
    startTransition(async () => {
      try {
        await refreshHomepage()
        router.refresh()
      } catch (error) {
        console.error("Error refreshing:", error)
        // Fallback to page reload
        window.location.reload()
      }
    })
  }

  const adjustServings = (increment: boolean) => {
    setServings((prev) => {
      if (increment) return Math.min(prev + 1, 12)
      return Math.max(prev - 1, 1)
    })
  }

  if (!recept) {
    return (
      <div className="relative min-h-screen w-full bg-[#286058] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-6">🍽️</div>
          <h2 className="text-3xl font-bold mb-4">Geen recept gevonden</h2>
          <p className="text-xl opacity-80">Probeer later opnieuw</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative min-h-screen w-full bg-[#286058] flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={recept.afbeelding_url || "/placeholder.svg?height=800&width=1200&query=delicious food recipe"}
            alt={recept.naam}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#286058]/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-8 max-w-4xl mx-auto">
          {/* Recipe Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">{recept.naam}</h1>

          {/* Recipe Info Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {recept.seizoen && (
              <span
                style={{
                  backgroundColor: hoveredBadge === `seizoen-${recept.id}` ? "#d1c7b8" : "#eee1d1",
                  color: "#286058",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "default",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={() => setHoveredBadge(`seizoen-${recept.id}`)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                🌱 {recept.seizoen}
              </span>
            )}
            {recept.type && (
              <span
                style={{
                  backgroundColor: hoveredBadge === `type-${recept.id}` ? "#d1c7b8" : "#eee1d1",
                  color: "#286058",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "default",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={() => setHoveredBadge(`type-${recept.id}`)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                🍽️ {recept.type}
              </span>
            )}
            {recept.bereidingstijd && (
              <span
                style={{
                  backgroundColor: hoveredBadge === `tijd-${recept.id}` ? "#d1c7b8" : "#eee1d1",
                  color: "#286058",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "default",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={() => setHoveredBadge(`tijd-${recept.id}`)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                ⏱️ {recept.bereidingstijd} min
              </span>
            )}
            {recept.moeilijkheidsgraad && (
              <span
                style={{
                  backgroundColor: hoveredBadge === `moeilijk-${recept.id}` ? "#d1c7b8" : "#eee1d1",
                  color: "#286058",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "default",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={() => setHoveredBadge(`moeilijk-${recept.id}`)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                📊 {recept.moeilijkheidsgraad}
              </span>
            )}
            {recept.tags && (
              <span
                style={{
                  backgroundColor: hoveredBadge === `tags-${recept.id}` ? "#d1c7b8" : "#eee1d1",
                  color: "#286058",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "default",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={() => setHoveredBadge(`tags-${recept.id}`)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                🏷️ {recept.tags}
              </span>
            )}
          </div>

          {/* Servings Control */}
          <div className="flex items-center justify-center gap-6 mb-12">
            <span className="text-xl font-medium">Voor</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => adjustServings(false)}
                disabled={servings <= 1}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "2px solid white",
                  backgroundColor: "transparent",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: servings <= 1 ? "not-allowed" : "pointer",
                  opacity: servings <= 1 ? 0.5 : 1,
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (servings > 1) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                }}
              >
                <Minus size={20} />
              </button>

              <span className="text-3xl font-bold min-w-[60px] text-center">{servings}</span>

              <button
                onClick={() => adjustServings(true)}
                disabled={servings >= 12}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "2px solid white",
                  backgroundColor: "transparent",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: servings >= 12 ? "not-allowed" : "pointer",
                  opacity: servings >= 12 ? 0.5 : 1,
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (servings < 12) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                }}
              >
                <Plus size={20} />
              </button>
            </div>
            <span className="text-xl font-medium">{servings === 1 ? "persoon" : "personen"}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => setShowIngredients(true)}
              style={{
                backgroundColor: "#eee1d1",
                color: "#286058",
                padding: "16px 32px",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
                minWidth: "200px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#d1c7b8"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#eee1d1"
              }}
            >
              Bekijk Recept
            </button>

            <button
              onClick={handleNewRecipe}
              disabled={isPending}
              style={{
                backgroundColor: "#e75129",
                color: "white",
                padding: "16px 32px",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "600",
                border: "none",
                cursor: isPending ? "not-allowed" : "pointer",
                transition: "background-color 0.2s ease",
                minWidth: "200px",
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
              {isPending ? "Laden..." : "Nieuw Gerecht"}
            </button>
          </div>
        </div>
      </div>

      {/* Ingredients Popup */}
      <IngredientsPopup
        isOpen={showIngredients}
        onClose={() => setShowIngredients(false)}
        receptId={recept.id}
        servings={servings}
        receptNaam={recept.naam}
      />
    </>
  )
}
