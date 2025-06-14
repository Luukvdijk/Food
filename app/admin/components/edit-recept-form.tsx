"use client"

import { useState } from "react"
import { updateRecept } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/image-upload"
import type { GerechtsType, Eigenaar, Recept } from "@/types"

const gerechtsTypes: GerechtsType[] = ["Ontbijt", "Lunch", "Diner", "Dessert", "Snack"]
const moeilijkheidsgraden = ["Makkelijk", "Gemiddeld", "Moeilijk"]
const eigenaren: { value: Eigenaar; label: string }[] = [
  { value: "henk", label: "Henk" },
  { value: "pepie en luulie", label: "Pepie & Luulie" },
]

interface EditReceptFormProps {
  recept: Recept
  ingredienten: any[]
  bijgerechten: any[]
}

export function EditReceptForm({ recept, ingredienten, bijgerechten }: EditReceptFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState<GerechtsType>(recept.type)
  const [selectedMoeilijkheid, setSelectedMoeilijkheid] = useState(recept.moeilijkheidsgraad)
  const [selectedEigenaar, setSelectedEigenaar] = useState<Eigenaar>((recept.eigenaar as Eigenaar) || "henk")
  const [imageUrl, setImageUrl] = useState(recept.afbeelding_url || "")
  const { toast } = useToast()

  // Check if eigenaar exists in the recept object
  const hasEigenaarSupport = "eigenaar" in recept

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      formData.set("id", recept.id.toString())
      formData.set("type", selectedType)
      formData.set("moeilijkheidsgraad", selectedMoeilijkheid)
      formData.set("afbeelding_url", imageUrl)
      if (hasEigenaarSupport) {
        formData.set("eigenaar", selectedEigenaar)
      }
      await updateRecept(formData)
    } catch (error: any) {
      // Check if this is a redirect (which is expected and means success)
      if (error?.digest?.includes("NEXT_REDIRECT") || error?.message === "NEXT_REDIRECT") {
        // This is actually success - the redirect happened
        toast({
          title: "Succes!",
          description: "Recept succesvol bijgewerkt",
          className: "bg-green-50 border-green-200 text-green-800",
        })
      } else {
        // This is an actual error
        console.error("Form submission error:", error)
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het bijwerken van het recept",
          className: "bg-red-50 border-red-200 text-red-800",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format ingrediënten voor textarea
  const ingredientenText = ingredienten
    .map((ing) => `${ing.hoeveelheid} | ${ing.eenheid} | ${ing.naam}${ing.notitie ? ` | ${ing.notitie}` : ""}`)
    .join("\n")

  // Format bijgerechten voor textarea
  const bijgerechtenText = bijgerechten.map((bij) => `${bij.naam} | ${bij.beschrijving}`).join("\n")

  const inputStyle = {
    backgroundColor: "white",
    color: "#286058",
    borderColor: "#286058",
  }

  const focusStyle = `
    .custom-input:focus {
      outline: none !important;
      border-color: #e75129 !important;
      box-shadow: 0 0 0 2px rgba(231, 81, 41, 0.2) !important;
      background-color: white !important;
    }
    .custom-textarea:focus {
      outline: none !important;
      border-color: #e75129 !important;
      box-shadow: 0 0 0 2px rgba(231, 81, 41, 0.2) !important;
      background-color: white !important;
    }
    .custom-select:focus {
      outline: none !important;
      border-color: #e75129 !important;
      box-shadow: 0 0 0 2px rgba(231, 81, 41, 0.2) !important;
      background-color: white !important;
    }
    .admin-select-content {
      background-color: white !important;
      border-color: #286058 !important;
    }
    .admin-select-item {
      color: #286058 !important;
    }
    .admin-select-item:hover {
      background-color: #eee1d1 !important;
      color: #286058 !important;
    }
    .admin-select-item[data-state="checked"] {
      background-color: #e75129 !important;
      color: white !important;
    }
  `

  return (
    <div style={{ backgroundColor: "#286058", minHeight: "100vh" }} className="text-white">
      <style dangerouslySetInnerHTML={{ __html: focusStyle }} />
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              disabled={isSubmitting}
              style={{
                backgroundColor: "#eee1d1",
                color: "#286058",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d1c7b8")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#eee1d1")}
            >
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug naar overzicht
              </Link>
            </Button>
            <h2 className="text-2xl font-bold">Recept Bewerken: {recept.naam}</h2>
          </div>

          <form action={handleSubmit} className="space-y-6">
            {/* Basis informatie */}
            <Card style={{ backgroundColor: "#eee1d1", color: "#286058" }}>
              <CardHeader>
                <CardTitle className="text-lg">Basis Informatie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="naam">Recept Naam *</Label>
                    <Input
                      id="naam"
                      name="naam"
                      required
                      defaultValue={recept.naam}
                      disabled={isSubmitting}
                      className="custom-input"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <Label htmlFor="personen">Aantal Personen *</Label>
                    <Input
                      id="personen"
                      name="personen"
                      type="number"
                      required
                      defaultValue={recept.personen}
                      min="1"
                      max="20"
                      disabled={isSubmitting}
                      className="custom-input"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="beschrijving">Beschrijving *</Label>
                  <Textarea
                    id="beschrijving"
                    name="beschrijving"
                    required
                    defaultValue={recept.beschrijving}
                    rows={3}
                    disabled={isSubmitting}
                    className="custom-textarea"
                    style={inputStyle}
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
                      defaultValue={recept.bereidingstijd}
                      min="1"
                      disabled={isSubmitting}
                      className="custom-input"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <Label>Type Gerecht *</Label>
                    <Select
                      value={selectedType}
                      onValueChange={(value) => setSelectedType(value as GerechtsType)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="custom-select" style={inputStyle}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="admin-select-content">
                        {gerechtsTypes.map((type) => (
                          <SelectItem key={type} value={type} className="admin-select-item">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Moeilijkheidsgraad *</Label>
                    <Select
                      value={selectedMoeilijkheid}
                      onValueChange={setSelectedMoeilijkheid}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="custom-select" style={inputStyle}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="admin-select-content">
                        {moeilijkheidsgraden.map((niveau) => (
                          <SelectItem key={niveau} value={niveau} className="admin-select-item">
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
                        <SelectTrigger className="custom-select" style={inputStyle}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="admin-select-content">
                          {eigenaren.map((eigenaar) => (
                            <SelectItem key={eigenaar.value} value={eigenaar.value} className="admin-select-item">
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
                      defaultValue={recept.seizoen.join(", ")}
                      disabled={isSubmitting}
                      className="custom-input"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (komma gescheiden)</Label>
                    <Input
                      id="tags"
                      name="tags"
                      defaultValue={recept.tags.join(", ")}
                      disabled={isSubmitting}
                      className="custom-input"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Afbeelding Upload */}
            <Card style={{ backgroundColor: "#eee1d1", color: "#286058" }}>
              <CardHeader>
                <CardTitle className="text-lg">Recept Afbeelding</CardTitle>
                <CardDescription>Upload een afbeelding van je recept</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload currentImageUrl={imageUrl} onImageChange={setImageUrl} disabled={isSubmitting} />
              </CardContent>
            </Card>

            {/* Bereidingswijze */}
            <Card style={{ backgroundColor: "#eee1d1", color: "#286058" }}>
              <CardHeader>
                <CardTitle className="text-lg">Bereidingswijze</CardTitle>
                <CardDescription>Voer elke stap op een nieuwe regel in</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  name="bereidingswijze"
                  required
                  defaultValue={recept.bereidingswijze.join("\n")}
                  rows={8}
                  disabled={isSubmitting}
                  className="custom-textarea"
                  style={inputStyle}
                />
              </CardContent>
            </Card>

            {/* Ingrediënten */}
            <Card style={{ backgroundColor: "#eee1d1", color: "#286058" }}>
              <CardHeader>
                <CardTitle className="text-lg">Ingrediënten</CardTitle>
                <CardDescription>Formaat per regel: hoeveelheid | eenheid | naam | notitie (optioneel)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  name="ingredienten"
                  required
                  defaultValue={ingredientenText}
                  rows={8}
                  disabled={isSubmitting}
                  className="custom-textarea"
                  style={inputStyle}
                />
              </CardContent>
            </Card>

            {/* Bijgerechten */}
            <Card style={{ backgroundColor: "#eee1d1", color: "#286058" }}>
              <CardHeader>
                <CardTitle className="text-lg">Bijgerechten (optioneel)</CardTitle>
                <CardDescription>Formaat per regel: naam | beschrijving</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  name="bijgerechten"
                  defaultValue={bijgerechtenText}
                  rows={4}
                  disabled={isSubmitting}
                  className="custom-textarea"
                  style={inputStyle}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" asChild disabled={isSubmitting}>
                <Link href="/admin">Annuleren</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                style={{
                  backgroundColor: "#e75129",
                  color: "white",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d63e1a")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e75129")}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recept bijwerken...
                  </>
                ) : (
                  "Recept Bijwerken"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
