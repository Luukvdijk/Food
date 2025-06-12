"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@supabase/supabase-js"

interface Ingredient {
  id: number
  naam: string
  hoeveelheid: number
  eenheid: string
}

interface IngredientsPopupProps {
  isOpen: boolean
  onClose: () => void
  receptId: number
  servings: number
  receptNaam: string
}

export function IngredientsPopup({ isOpen, onClose, receptId, servings, receptNaam }: IngredientsPopupProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [bereidingswijze, setBereidingswijze] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // Create Supabase client directly
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )

  useEffect(() => {
    if (isOpen && receptId) {
      fetchRecipeData()
    }
  }, [isOpen, receptId])

  const fetchRecipeData = async () => {
    setLoading(true)
    try {
      // Get recipe with ingredients and preparation method
      const { data: receptData, error: receptError } = await supabase
        .from("recepten")
        .select(`
          *,
          ingredienten (*)
        `)
        .eq("id", receptId)
        .single()

      if (receptError) {
        console.error("Error fetching recipe:", receptError)
        // Fallback: try to get ingredients from ingredienten table
        const { data: ingredientsData, error: ingredientsError } = await supabase
          .from("ingredienten")
          .select("*")
          .eq("recept_id", receptId)

        if (ingredientsError) {
          console.error("Error fetching ingredients:", ingredientsError)
          setIngredients([])
        } else {
          setIngredients(ingredientsData || [])
        }
        setBereidingswijze("")
      } else {
        // Use the ingredients and preparation method from the recipe data
        setIngredients(receptData.ingredienten || [])
        setBereidingswijze(receptData.bereidingswijze || "")
      }
    } catch (error) {
      console.error("Error fetching recipe data:", error)
      setIngredients([])
      setBereidingswijze("")
    } finally {
      setLoading(false)
    }
  }

  const calculateAmount = (baseAmount: number) => {
    if (!baseAmount) return "1"
    return (baseAmount * servings).toFixed(1).replace(/\.0$/, "")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
      <div className="bg-[#eee1d1] h-full w-full max-w-md shadow-2xl overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#286058] mb-2">Recept Details</h2>
              <div className="w-24 h-1 bg-[#e75129]"></div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-[#286058] hover:bg-[#286058]/10">
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Recipe name */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-[#286058] mb-2">{receptNaam}</h3>
            <p className="text-[#286058]/70">
              Voor {servings} {servings === 1 ? "persoon" : "personen"}
            </p>
          </div>

          {/* Ingredients Section */}
          <div className="mb-8">
            <h4 className="text-2xl font-bold text-[#286058] mb-4">Ingrediënten</h4>
            <div className="w-16 h-1 bg-[#e75129] mb-6"></div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-[#e75129]/30 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-[#286058]/20 rounded flex-1 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : ingredients.length > 0 ? (
              <div className="space-y-4">
                {ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-[#e75129] rounded-full flex-shrink-0"></div>
                    <span className="text-[#286058] text-lg">
                      {ingredient.hoeveelheid
                        ? `${calculateAmount(ingredient.hoeveelheid)} ${ingredient.eenheid || ""} `
                        : ""}
                      {ingredient.naam}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🥘</div>
                <p className="text-[#286058]/70 mb-4">Geen ingrediënten gevonden voor dit recept.</p>
                <p className="text-[#286058]/50 text-sm">
                  Voeg ingrediënten toe via het admin panel om ze hier te zien.
                </p>
              </div>
            )}
          </div>

          {/* Preparation Method Section */}
          <div className="mb-8">
            <h4 className="text-2xl font-bold text-[#286058] mb-4">Bereidingswijze</h4>
            <div className="w-16 h-1 bg-[#e75129] mb-6"></div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 bg-[#286058]/20 rounded animate-pulse"></div>
                ))}
              </div>
            ) : bereidingswijze ? (
              <div className="bg-white/50 rounded-lg p-6">
                <div className="text-[#286058] text-lg leading-relaxed whitespace-pre-wrap">{bereidingswijze}</div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-[#286058]/70 mb-4">Geen bereidingswijze gevonden voor dit recept.</p>
                <p className="text-[#286058]/50 text-sm">
                  Voeg een bereidingswijze toe via het admin panel om deze hier te zien.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
