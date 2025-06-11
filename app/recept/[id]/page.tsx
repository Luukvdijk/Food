import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, ChefHat, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { IngredientenLijst } from "@/components/ingredienten-lijst"
import { Bijgerechten } from "@/components/bijgerechten"
import { supabase } from "@/lib/db"

interface ReceptPageProps {
  params: {
    id: string
  }
}

export default async function ReceptPage({ params }: ReceptPageProps) {
  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    return notFound()
  }

  // Get recipe details using Supabase
  const { data: recept, error: receptError } = await supabase.from("recepten").select("*").eq("id", id).single()

  if (receptError || !recept) {
    console.error("Error fetching recipe:", receptError)
    return notFound()
  }

  // Get ingredients using Supabase
  const { data: ingredienten, error: ingredientenError } = await supabase
    .from("ingredienten")
    .select("*")
    .eq("recept_id", id)
    .order("id")

  if (ingredientenError) {
    console.error("Error fetching ingredients:", ingredientenError)
  }

  // Get side dishes using Supabase
  const { data: bijgerechten, error: bijgerechtenError } = await supabase
    .from("bijgerechten")
    .select("*")
    .eq("recept_id", id)
    .order("id")

  if (bijgerechtenError) {
    console.error("Error fetching side dishes:", bijgerechtenError)
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <a href="/zoeken">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar alle recepten
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-6">
            <Image
              src={recept.afbeelding_url || "/placeholder.svg?height=600&width=800"}
              alt={recept.naam}
              fill
              className="object-cover"
              priority
            />
          </div>

          <h1 className="text-3xl font-bold mb-2">{recept.naam}</h1>
          <p className="text-lg text-muted-foreground mb-4">{recept.beschrijving}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="outline">{recept.type}</Badge>
            {recept.seizoen &&
              recept.seizoen.map((s: string) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            {recept.tags &&
              recept.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>{recept.bereidingstijd} minuten</span>
            </div>
            <div className="flex items-center">
              <ChefHat className="mr-2 h-4 w-4" />
              <span>{recept.moeilijkheidsgraad}</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>{recept.personen} personen</span>
            </div>
          </div>

          <Separator className="my-6" />

          <h2 className="text-xl font-semibold mb-4">Bereidingswijze</h2>
          <ol className="space-y-4 mb-8">
            {recept.bereidingswijze &&
              recept.bereidingswijze.map((stap: string, index: number) => (
                <li key={index} className="ml-6 list-decimal">
                  <p>{stap}</p>
                </li>
              ))}
          </ol>

          <Bijgerechten bijgerechten={bijgerechten || []} />
        </div>

        <div>
          <Card>
            <CardContent className="pt-6">
              <IngredientenLijst ingredienten={ingredienten || []} defaultPersonen={recept.personen} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
