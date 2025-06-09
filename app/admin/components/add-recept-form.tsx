"use client"

import { useState } from "react"
import { addRecept } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { GerechtsType, Eigenaar } from "@/types"

const gerechtsTypes: GerechtsType[] = ["Ontbijt", "Lunch", "Diner", "Dessert", "Snack"]
const moeilijkheidsgraden = ["Makkelijk", "Gemiddeld", "Moeilijk"]
const eigenaren: { value: Eigenaar; label: string }[] = [
  { value: "henk", label: "Henk" },
  { value: "pepie en luulie", label: "Pepie & Luulie" },
]

export function AddReceptForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState<GerechtsType>("Diner")
  const [selectedMoeilijkheid, setSelectedMoeilijkheid] = useState("Gemiddeld")
  const [selectedEigenaar, setSelectedEigenaar] = useState<Eigenaar>("henk")

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    formData.set("type", selectedType)
    formData.set("moeilijkheidsgraad", selectedMoeilijkheid)
    formData.set("eigenaar", selectedEigenaar)
    await addRecept(formData)
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Basis informatie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basis Informatie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="naam">Recept Naam *</Label>
              <Input id="naam" name="naam" required placeholder="Bijv. Hollandse Erwtensoep" />
            </div>
            <div>
              <Label htmlFor="personen">Aantal Personen *</Label>
              <Input id="personen" name="personen" type="number" required defaultValue="4" min="1" max="20" />
            </div>
          </div>

          <div>
            <Label htmlFor="beschrijving">Beschrijving *</Label>
            <Textarea
              id="beschrijving"
              name="beschrijving"
              required
              placeholder="Een korte beschrijving van het recept..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="bereidingstijd">Bereidingstijd (minuten) *</Label>
              <Input id="bereidingstijd" name="bereidingstijd" type="number" required placeholder="30" min="1" />
            </div>
            <div>
              <Label>Type Gerecht *</Label>
              <Select value={selectedType} onValueChange={(value) => setSelectedType(value as GerechtsType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gerechtsTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Moeilijkheidsgraad *</Label>
              <Select value={selectedMoeilijkheid} onValueChange={setSelectedMoeilijkheid}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moeilijkheidsgraden.map((niveau) => (
                    <SelectItem key={niveau} value={niveau}>
                      {niveau}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Eigenaar *</Label>
              <Select value={selectedEigenaar} onValueChange={(value) => setSelectedEigenaar(value as Eigenaar)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eigenaren.map((eigenaar) => (
                    <SelectItem key={eigenaar.value} value={eigenaar.value}>
                      {eigenaar.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seizoen">Seizoenen (komma gescheiden)</Label>
              <Input
                id="seizoen"
                name="seizoen"
                placeholder="Lente, Zomer, Herfst, Winter"
                defaultValue="Lente, Zomer, Herfst, Winter"
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (komma gescheiden)</Label>
              <Input id="tags" name="tags" placeholder="vegetarisch, snel, gezond" />
            </div>
          </div>

          <div>
            <Label htmlFor="afbeelding_url">Afbeelding URL (optioneel)</Label>
            <Input id="afbeelding_url" name="afbeelding_url" type="url" placeholder="https://example.com/image.jpg" />
          </div>
        </CardContent>
      </Card>

      {/* Bereidingswijze */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bereidingswijze</CardTitle>
          <CardDescription>Voer elke stap op een nieuwe regel in</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="bereidingswijze"
            required
            placeholder="Stap 1: Was de groenten grondig&#10;Stap 2: Snijd alle ingrediënten in stukjes&#10;Stap 3: Verhit de olie in een pan"
            rows={8}
          />
        </CardContent>
      </Card>

      {/* Ingrediënten */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ingrediënten</CardTitle>
          <CardDescription>
            Formaat per regel: hoeveelheid | eenheid | naam | notitie (optioneel)
            <br />
            Bijvoorbeeld: 500 | gram | spliterwten | gedroogd
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="ingredienten"
            required
            placeholder="500 | gram | spliterwten | gedroogd&#10;2 | stuks | uien | gesnipperd&#10;1 | liter | water"
            rows={8}
          />
        </CardContent>
      </Card>

      {/* Bijgerechten */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bijgerechten (optioneel)</CardTitle>
          <CardDescription>
            Formaat per regel: naam | beschrijving
            <br />
            Bijvoorbeeld: Stokbrood | Knapperig vers stokbrood met kruidenboter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="bijgerechten"
            placeholder="Stokbrood | Knapperig vers stokbrood met kruidenboter&#10;Salade | Frisse groene salade"
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Recept toevoegen..." : "Recept Toevoegen"}
        </Button>
      </div>
    </form>
  )
}
