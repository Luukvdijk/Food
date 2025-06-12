"use client"

import { useState, useEffect } from "react"
import { addRecept } from "../actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/image-upload"
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
  const [hasEigenaarSupport, setHasEigenaarSupport] = useState(true)
  const [imageUrl, setImageUrl] = useState("")
  const { toast } = useToast()

  // Check if eigenaar column exists
  useEffect(() => {
    const checkEigenaarSupport = async () => {
      try {
        const response = await fetch("/api/check-eigenaar-support")
        const data = await response.json()
        setHasEigenaarSupport(data.hasEigenaarSupport)
      } catch (error) {
        console.error("Error checking eigenaar support:", error)
        setHasEigenaarSupport(false)
      }
    }

    checkEigenaarSupport()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

    try {
      formData.set("type", selectedType)
      formData.set("moeilijkheidsgraad", selectedMoeilijkheid)
      formData.set("afbeelding_url", imageUrl)
      if (hasEigenaarSupport) {
        formData.set("eigenaar", selectedEigenaar)
      }

      await addRecept(formData)

      // If we get here without a redirect, something went wrong
      console.log("Action completed without redirect - this shouldn't happen")
    } catch (error: any) {
      // Check if this is a redirect (which is expected and means success)
      if (error?.digest?.includes("NEXT_REDIRECT") || error?.message === "NEXT_REDIRECT") {
        // This is actually success - the redirect happened
        toast({
          title: "Succes!",
          description: "Recept succesvol toegevoegd",
          className: "bg-green-50 border-green-200 text-green-800",
        })

        // Reset form after a delay
        setTimeout(() => {
          // Reset form fields
          const form = document.querySelector("form") as HTMLFormElement
          if (form) {
            form.reset()
          }
          setSelectedType("Diner")
          setSelectedMoeilijkheid("Gemiddeld")
          setSelectedEigenaar("henk")
          setImageUrl("")
        }, 1000)
      } else {
        // This is an actual error
        console.error("Form submission error:", error)
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het toevoegen van het recept",
          className: "bg-red-50 border-red-200 text-red-800",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="space-y-6">
        {/* Basis informatie */}
        <div
          style={{ backgroundColor: "#eee1d1", color: "#286058", border: "1px solid #d1d5db" }}
          className="rounded-lg overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Basis Informatie</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="naam">Recept Naam *</Label>
                <Input
                  id="naam"
                  name="naam"
                  required
                  placeholder="Bijv. Hollandse Erwtensoep"
                  disabled={isSubmitting}
                  style={{ backgroundColor: "white", border: "1px solid #d1d5db", color: "#286058" }}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 hover:border-green-500 transition-colors"
                />
              </div>
              <div>
                <Label htmlFor="personen">Aantal Personen *</Label>
                <Input
                  id="personen"
                  name="personen"
                  type="number"
                  required
                  defaultValue="4"
                  min="1"
                  max="20"
                  disabled={isSubmitting}
                  style={{ backgroundColor: "white", border: "1px solid #d1d5db", color: "#286058" }}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 hover:border-green-500 transition-colors"
                />
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
                disabled={isSubmitting}
                style={{ backgroundColor: "white", border: "1px solid #d1d5db", color: "#286058" }}
                className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 hover:border-green-500 transition-colors"
              />
            </div>

            <div className={`grid grid-cols-1 ${hasEigenaarSupport ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4`}>
              <div>
                <Label htmlFor="bereidingstijd">Bereidingstijd (minuten) *</Label>
                <Input
                  id="bereidingstijd"
                  name="bereidingstijd"
                  type="number"
                  required
                  placeholder="30"
                  min="1"
                  disabled={isSubmitting}
                  style={{ backgroundColor: "white", border: "1px solid #d1d5db", color: "#286058" }}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 hover:border-green-500 transition-colors"
                />
              </div>
              <div>
                <Label>Type Gerecht *</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value as GerechtsType)}
                  disabled={isSubmitting}
                >
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
                <Select value={selectedMoeilijkheid} onValueChange={setSelectedMoeilijkheid} disabled={isSubmitting}>
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
              {hasEigenaarSupport && (
                <div>
                  <Label>Eigenaar *</Label>
                  <Select
                    value={selectedEigenaar}
                    onValueChange={(value) => setSelectedEigenaar(value as Eigenaar)}
                    disabled={isSubmitting}
                  >
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
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seizoen">Seizoenen (komma gescheiden)</Label>
                <Input
                  id="seizoen"
                  name="seizoen"
                  placeholder="Lente, Zomer, Herfst, Winter"
                  defaultValue="Lente, Zomer, Herfst, Winter"
                  disabled={isSubmitting}
                  style={{ backgroundColor: "white", border: "1px solid #d1d5db", color: "#286058" }}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 hover:border-green-500 transition-colors"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (komma gescheiden)</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="vegetarisch, snel, gezond"
                  disabled={isSubmitting}
                  style={{ backgroundColor: "white", border: "1px solid #d1d5db", color: "#286058" }}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 hover:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Afbeelding Upload */}
        <div
          style={{ backgroundColor: "#eee1d1", color: "#286058", border: "1px solid #d1d5db" }}
          className="rounded-lg overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Recept Afbeelding</h3>
            <p className="text-sm text-gray-500">Upload een afbeelding van je recept</p>
          </div>
          <div className="p-6 space-y-4">
            <ImageUpload currentImageUrl={imageUrl} onImageChange={setImageUrl} disabled={isSubmitting} />
          </div>
        </div>

        {/* Bereidingswijze */}
        <div
          style={{ backgroundColor: "#eee1d1", color: "#286058", border: "1px solid #d1d5db" }}
          className="rounded-lg overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Bereidingswijze</h3>
            <p className="text-sm text-gray-500">Voer elke stap op een nieuwe regel in</p>
          </div>
          <div className="p-6 space-y-4">
            <Textarea
              name="bereidingswijze"
              required
              placeholder="Stap 1: Was de groenten grondig&#10;Stap 2: Snijd alle ingrediënten in stukjes&#10;Stap 3: Verhit de olie in een pan"
              rows={8}
              disabled={isSubmitting}
              style={{ backgroundColor: "white", border: "1px solid #d1d5db", color: "#286058" }}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 hover:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* Ingrediënten */}
        <div
          style={{ backgroundColor: "#eee1d1", color: "#286058", border: "1px solid #d1d5db" }}
          className="rounded-lg overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Ingrediënten</h3>
            <p className="text-sm text-gray-500">
              Formaat per regel: hoeveelheid | eenheid | naam | notitie (optioneel)
              <br />
              Bijvoorbeeld: 500 | gram | spliterwten | gedroogd
            </p>
          </div>
          <div className="p-6 space-y-4">
            <Textarea
              name="ingredienten"
              required
              placeholder="500 | gram | spliterwten | gedroogd&#10;2 | stuks | uien | gesnipperd&#10;1 | liter | water"
              rows={8}
              disabled={isSubmitting}
              style={{ backgroundColor: "white", border: "1px solid #d1d5db", color: "#286058" }}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 hover:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* Bijgerechten */}
        <div
          style={{ backgroundColor: "#eee1d1", color: "#286058", border: "1px solid #d1d5db" }}
          className="rounded-lg overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Bijgerechten (optioneel)</h3>
            <p className="text-sm text-gray-500">
              Formaat per regel: naam | beschrijving
              <br />
              Bijvoorbeeld: Stokbrood | Knapperig vers stokbrood met kruidenboter
            </p>
          </div>
          <div className="p-6 space-y-4">
            <Textarea
              name="bijgerechten"
              placeholder="Stokbrood | Knapperig vers stokbrood met kruidenboter&#10;Salade | Frisse groene salade"
              rows={4}
              disabled={isSubmitting}
              style={{ backgroundColor: "white", border: "1px solid #d1d5db", color: "#286058" }}
              className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 hover:border-green-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: "#e75129", color: "white" }}
            className="px-6 py-3 rounded-md transition-all duration-200 disabled:opacity-50"
            onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#d63e1a")}
            onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#e75129")}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recept toevoegen...
              </>
            ) : (
              "Recept Toevoegen"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
