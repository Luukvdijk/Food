"use client"

import { useState, useEffect } from "react"
import { addRecept } from "../actions"
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

  // Style constants
  const styles = {
    container: {
      backgroundColor: "#eee1d1",
      color: "#286058",
      border: "1px solid #d1d5db",
      borderRadius: "0.5rem",
      overflow: "hidden",
      marginBottom: "1.5rem",
    },
    header: {
      padding: "1.5rem",
      borderBottom: "1px solid #d1d5db",
    },
    content: {
      padding: "1.5rem",
    },
    label: {
      display: "block",
      fontSize: "0.875rem",
      fontWeight: "500",
      marginBottom: "0.5rem",
      color: "#286058",
    },
    input: {
      backgroundColor: "white",
      color: "#286058",
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      padding: "0.5rem",
      width: "100%",
      transition: "border-color 0.2s ease",
    },
    textarea: {
      backgroundColor: "white",
      color: "#286058",
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      padding: "0.5rem",
      width: "100%",
      minHeight: "100px",
      transition: "border-color 0.2s ease",
      resize: "vertical" as const,
    },
    select: {
      backgroundColor: "white",
      color: "#286058",
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      padding: "0.5rem",
      width: "100%",
      cursor: "pointer",
      transition: "border-color 0.2s ease",
    },
    button: {
      backgroundColor: "#e75129",
      color: "white",
      border: "none",
      borderRadius: "0.375rem",
      padding: "0.75rem 1.5rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background-color 0.2s ease",
    },
    description: {
      fontSize: "0.875rem",
      color: "#6b7280",
      marginTop: "0.25rem",
    },
  }

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

      // Parse and format ingredients
      const ingredientenText = formData.get("ingredienten") as string
      if (ingredientenText) {
        const ingredientenLines = ingredientenText.split("\n").filter((line) => line.trim())
        const ingredienten = ingredientenLines.map((line) => {
          const parts = line.split("|").map((part) => part.trim())
          return {
            hoeveelheid: parts[0] || "",
            eenheid: parts[1] || "",
            naam: parts[2] || "",
            notitie: parts[3] || "",
          }
        })
        formData.set("ingredienten", JSON.stringify(ingredienten))
      }

      // Parse and format bijgerechten
      const bijgerechtenText = formData.get("bijgerechten") as string
      if (bijgerechtenText) {
        const bijgerechtenLines = bijgerechtenText.split("\n").filter((line) => line.trim())
        const bijgerechten = bijgerechtenLines.map((line) => {
          const parts = line.split("|").map((part) => part.trim())
          return {
            naam: parts[0] || "",
            beschrijving: parts[1] || "",
          }
        })
        formData.set("bijgerechten", JSON.stringify(bijgerechten))
      }

      const result = await addRecept(formData)

      if (!result.success) {
        throw new Error(result.error || "Unknown error occurred")
      }

      // If we reach here, something went wrong with the redirect
      toast({
        title: "Succes!",
        description: "Recept succesvol toegevoegd",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error: any) {
      // Check if this is a redirect (which is expected and means success)
      if (error?.digest?.includes("NEXT_REDIRECT") || error?.message === "NEXT_REDIRECT") {
        // This is actually success - the redirect happened
        return
      } else {
        // This is an actual error
        console.error("Form submission error:", error)
        toast({
          title: "Fout",
          description: error.message || "Er is een fout opgetreden bij het toevoegen van het recept",
          className: "bg-red-50 border-red-200 text-red-800",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <style jsx>{`
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .form-grid-3 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .form-grid-4 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 768px) {
          .form-grid-2 {
            grid-template-columns: repeat(2, 1fr);
          }
          .form-grid-3 {
            grid-template-columns: repeat(3, 1fr);
          }
          .form-grid-4 {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .form-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      `}</style>

      <div className="form-container">
        <form action={handleSubmit} className="form-container">
          {/* Basis informatie */}
          <div style={styles.container}>
            <div style={styles.header}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>Basis Informatie</h3>
            </div>
            <div style={styles.content}>
              <div className="form-section">
                <div className="form-grid-2">
                  <div>
                    <label style={styles.label} htmlFor="naam">
                      Recept Naam *
                    </label>
                    <input
                      id="naam"
                      name="naam"
                      required
                      placeholder="Bijv. Hollandse Erwtensoep"
                      disabled={isSubmitting}
                      style={styles.input}
                      onFocus={(e) => (e.target.style.borderColor = "#286058")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    />
                  </div>
                  <div>
                    <label style={styles.label} htmlFor="personen">
                      Aantal Personen *
                    </label>
                    <input
                      id="personen"
                      name="personen"
                      type="number"
                      required
                      defaultValue="4"
                      min="1"
                      max="20"
                      disabled={isSubmitting}
                      style={styles.input}
                      onFocus={(e) => (e.target.style.borderColor = "#286058")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    />
                  </div>
                </div>

                <div>
                  <label style={styles.label} htmlFor="beschrijving">
                    Beschrijving *
                  </label>
                  <textarea
                    id="beschrijving"
                    name="beschrijving"
                    required
                    placeholder="Een korte beschrijving van het recept..."
                    rows={3}
                    disabled={isSubmitting}
                    style={styles.textarea}
                    onFocus={(e) => (e.target.style.borderColor = "#286058")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                </div>

                <div className={hasEigenaarSupport ? "form-grid-4" : "form-grid-3"}>
                  <div>
                    <label style={styles.label} htmlFor="bereidingstijd">
                      Bereidingstijd (minuten) *
                    </label>
                    <input
                      id="bereidingstijd"
                      name="bereidingstijd"
                      type="number"
                      required
                      placeholder="30"
                      min="1"
                      disabled={isSubmitting}
                      style={styles.input}
                      onFocus={(e) => (e.target.style.borderColor = "#286058")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Type Gerecht *</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as GerechtsType)}
                      disabled={isSubmitting}
                      style={styles.select}
                      onFocus={(e) => (e.target.style.borderColor = "#286058")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    >
                      {gerechtsTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Moeilijkheidsgraad *</label>
                    <select
                      value={selectedMoeilijkheid}
                      onChange={(e) => setSelectedMoeilijkheid(e.target.value)}
                      disabled={isSubmitting}
                      style={styles.select}
                      onFocus={(e) => (e.target.style.borderColor = "#286058")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    >
                      {moeilijkheidsgraden.map((niveau) => (
                        <option key={niveau} value={niveau}>
                          {niveau}
                        </option>
                      ))}
                    </select>
                  </div>
                  {hasEigenaarSupport && (
                    <div>
                      <label style={styles.label}>Eigenaar *</label>
                      <select
                        value={selectedEigenaar}
                        onChange={(e) => setSelectedEigenaar(e.target.value as Eigenaar)}
                        disabled={isSubmitting}
                        style={styles.select}
                        onFocus={(e) => (e.target.style.borderColor = "#286058")}
                        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                      >
                        {eigenaren.map((eigenaar) => (
                          <option key={eigenaar.value} value={eigenaar.value}>
                            {eigenaar.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="form-grid-2">
                  <div>
                    <label style={styles.label} htmlFor="seizoen">
                      Seizoenen (komma gescheiden)
                    </label>
                    <input
                      id="seizoen"
                      name="seizoen"
                      placeholder="Lente, Zomer, Herfst, Winter"
                      defaultValue="Lente, Zomer, Herfst, Winter"
                      disabled={isSubmitting}
                      style={styles.input}
                      onFocus={(e) => (e.target.style.borderColor = "#286058")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    />
                  </div>
                  <div>
                    <label style={styles.label} htmlFor="tags">
                      Tags (komma gescheiden)
                    </label>
                    <input
                      id="tags"
                      name="tags"
                      placeholder="vegetarisch, snel, gezond"
                      disabled={isSubmitting}
                      style={styles.input}
                      onFocus={(e) => (e.target.style.borderColor = "#286058")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Afbeelding Upload */}
          <div style={styles.container}>
            <div style={styles.header}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>Recept Afbeelding</h3>
              <p style={styles.description}>Upload een afbeelding van je recept</p>
            </div>
            <div style={styles.content}>
              <ImageUpload currentImageUrl={imageUrl} onImageChange={setImageUrl} disabled={isSubmitting} />
            </div>
          </div>

          {/* Bereidingswijze */}
          <div style={styles.container}>
            <div style={styles.header}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>Bereidingswijze</h3>
              <p style={styles.description}>Voer elke stap op een nieuwe regel in</p>
            </div>
            <div style={styles.content}>
              <textarea
                name="bereidingswijze"
                required
                placeholder="Stap 1: Was de groenten grondig&#10;Stap 2: Snijd alle ingrediënten in stukjes&#10;Stap 3: Verhit de olie in een pan"
                rows={8}
                disabled={isSubmitting}
                style={styles.textarea}
                onFocus={(e) => (e.target.style.borderColor = "#286058")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>
          </div>

          {/* Ingrediënten */}
          <div style={styles.container}>
            <div style={styles.header}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>Ingrediënten</h3>
              <p style={styles.description}>
                Formaat per regel: hoeveelheid | eenheid | naam | notitie (optioneel)
                <br />
                Bijvoorbeeld: 500 | gram | spliterwten | gedroogd
              </p>
            </div>
            <div style={styles.content}>
              <textarea
                name="ingredienten"
                required
                placeholder="500 | gram | spliterwten | gedroogd&#10;2 | stuks | uien | gesnipperd&#10;1 | liter | water"
                rows={8}
                disabled={isSubmitting}
                style={styles.textarea}
                onFocus={(e) => (e.target.style.borderColor = "#286058")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>
          </div>

          {/* Bijgerechten */}
          <div style={styles.container}>
            <div style={styles.header}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>Bijgerechten (optioneel)</h3>
              <p style={styles.description}>
                Formaat per regel: naam | beschrijving
                <br />
                Bijvoorbeeld: Stokbrood | Knapperig vers stokbrood met kruidenboter
              </p>
            </div>
            <div style={styles.content}>
              <textarea
                name="bijgerechten"
                placeholder="Stokbrood | Knapperig vers stokbrood met kruidenboter&#10;Salade | Frisse groene salade"
                rows={4}
                disabled={isSubmitting}
                style={styles.textarea}
                onFocus={(e) => (e.target.style.borderColor = "#286058")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.button,
                opacity: isSubmitting ? 0.5 : 1,
              }}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#d63e1a")}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#e75129")}
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    style={{
                      marginRight: "0.5rem",
                      height: "1rem",
                      width: "1rem",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Recept toevoegen...
                </>
              ) : (
                "Recept Toevoegen"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
