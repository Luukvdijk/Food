import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Recept } from "@/types"

interface ModernRecipeCardProps {
  recept: Recept
}

export function ModernRecipeCard({ recept }: ModernRecipeCardProps) {
  // Count ingredients for display
  const ingredientCount = recept.ingredienten?.length || 0

  return (
    <Link href={`/recept/${recept.id}`}>
      <Card className="bg-[#286058] text-white overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer">
        <div className="relative h-48 bg-[#eee1d1] rounded-t-lg">
          <div className="absolute inset-4 rounded-full overflow-hidden bg-white">
            <Image
              src={recept.afbeelding_url || "/placeholder.svg?height=200&width=200&query=delicious food"}
              alt={recept.naam}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-2xl font-bold mb-2">{recept.naam}</h3>
          <p className="text-white/80 mb-4">{ingredientCount} ingrediënten</p>

          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-5 w-5 fill-[#e75129] text-[#e75129]" />
            ))}
          </div>
        </div>
      </Card>
    </Link>
  )
}
