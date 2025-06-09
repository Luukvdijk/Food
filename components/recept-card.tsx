import Image from "next/image"
import Link from "next/link"
import { Clock, ChefHat } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { Recept } from "@/types"

interface ReceptCardProps {
  recept: Recept
}

export function ReceptCard({ recept }: ReceptCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48">
        <Image
          src={recept.afbeelding_url || "/placeholder.svg?height=400&width=600"}
          alt={recept.naam}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader>
        <Link href={`/recept/${recept.id}`} className="hover:underline">
          <h3 className="text-lg font-semibold">{recept.naam}</h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2">{recept.beschrijving}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            <span>{recept.bereidingstijd} min</span>
          </div>
          <div className="flex items-center">
            <ChefHat className="mr-1 h-4 w-4" />
            <span>{recept.moeilijkheidsgraad}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{recept.type}</Badge>
          {recept.seizoen.map((s) => (
            <Badge key={s} variant="secondary">
              {s}
            </Badge>
          ))}
          {recept.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}
