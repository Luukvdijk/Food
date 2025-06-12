import Image from "next/image"
import Link from "next/link"
import { Clock, ChefHat } from "lucide-react"
import type { Recept } from "@/types"

interface ReceptCardProps {
  recept: Recept
}

export function ReceptCard({ recept }: ReceptCardProps) {
  return (
    <div
      className="overflow-hidden h-full flex flex-col rounded-lg"
      style={{ backgroundColor: "#eee1d1", border: "1px solid #eee1d1" }}
    >
      <div className="relative h-48">
        <Image
          src={recept.afbeelding_url || "/placeholder.svg?height=400&width=600"}
          alt={recept.naam}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6" style={{ backgroundColor: "#eee1d1" }}>
        <Link href={`/recept/${recept.id}`} className="hover:underline">
          <h3 className="text-lg font-semibold text-gray-900">{recept.naam}</h3>
        </Link>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{recept.beschrijving}</p>
      </div>
      <div className="px-6 flex-grow" style={{ backgroundColor: "#eee1d1" }}>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            <span>{recept.bereidingstijd} min</span>
          </div>
          <div className="flex items-center">
            <ChefHat className="mr-1 h-4 w-4" />
            <span>{recept.moeilijkheidsgraad}</span>
          </div>
        </div>
      </div>
      <div className="px-6 pb-6" style={{ backgroundColor: "#eee1d1" }}>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md border border-[#286058] bg-white px-2 py-1 text-xs font-medium text-[#286058]">
            {recept.type}
          </span>
          {recept.seizoen.map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-md bg-[#e75129] px-2 py-1 text-xs font-medium text-white"
            >
              {s}
            </span>
          ))}
          {recept.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md border border-[#286058] bg-white px-2 py-1 text-xs font-medium text-[#286058]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
