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
  const [loading, setLoading] = useState(false)

  // Create Supabase client directly
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )

  useEffect(() => {
    if (isOpen && receptId) {
      fetchIngredients()
    }
  }, [isOpen, receptId])

  const fetchIngredients = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("recept_ingredienten")
        .select(`
          hoeveelheid,
          eenheid,
          ingredienten (
            id,
            naam
          )
        `)
        .eq("recept_id", receptId)

      if (error) throw error

      const formattedIngredients =
        data?.map((item: any) => ({
          id: item.ingredienten.id,
          naam: item.ingredienten.naam,
          hoeveelheid: item.hoeveelheid,
          eenheid: item.eenheid,
        })) || []

      setIngredients(formattedIngredients)
    } catch (error) {
      console.error("Error fetching ingredients:", error)
      setIngredients([])
    } finally {
      setLoading(false)
    }
  }

  const calculateAmount = (baseAmount: number) => {
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
              <h2 className="text-3xl font-bold text-[#286058] mb-2">Ingrediënten</h2>
              <div className="w-24 h-1 bg-[#e75129]"></div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-[#286058] hover:bg-[#286058]/10">
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Recipe name */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-[#286058] mb-2">{receptNaam}</h3>
            <p className="text-[#286058]/70">
              Voor {servings} {servings === 1 ? "persoon" : "personen"}
            </p>
          </div>

          {/* Ingredients list */}
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
                    {calculateAmount(ingredient.hoeveelheid)} {ingredient.eenheid} {ingredient.naam}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🥘</div>
              <p className="text-[#286058]/70">Geen ingrediënten gevonden voor dit recept.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
