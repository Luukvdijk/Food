"use client"

import { useState, useRef } from "react"
import { Upload, Camera, LinkIcon, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface ImageUploadProps {
  currentImageUrl?: string
  onImageChange: (imageUrl: string) => void
  disabled?: boolean
}

export function ImageUpload({ currentImageUrl, onImageChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || "")
  const [urlInput, setUrlInput] = useState("")
  const [activeTab, setActiveTab] = useState("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Style constants
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "1rem",
    },
    previewCard: {
      backgroundColor: "#eee1d1",
      border: "1px solid #d1d5db",
      borderRadius: "0.5rem",
      padding: "1rem",
      position: "relative" as const,
    },
    previewImage: {
      position: "relative" as const,
      height: "12rem",
      width: "100%",
      borderRadius: "0.5rem",
      overflow: "hidden",
    },
    removeButton: {
      position: "absolute" as const,
      top: "0.5rem",
      right: "0.5rem",
      backgroundColor: "#e75129",
      color: "white",
      border: "none",
      borderRadius: "0.25rem",
      padding: "0.25rem",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background-color 0.2s ease",
    },
    tabContainer: {
      width: "100%",
    },
    tabList: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      backgroundColor: "#f3f4f6",
      borderRadius: "0.375rem",
      padding: "0.25rem",
      marginBottom: "1rem",
    },
    tab: {
      backgroundColor: "transparent",
      color: "#6b7280",
      border: "none",
      borderRadius: "0.25rem",
      padding: "0.5rem 1rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    activeTab: {
      backgroundColor: "#eee1d1",
      color: "#286058",
      border: "none",
      borderRadius: "0.25rem",
      padding: "0.5rem 1rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    tabContent: {
      backgroundColor: "#eee1d1",
      border: "1px solid #d1d5db",
      borderRadius: "0.5rem",
      padding: "1rem",
    },
    button: {
      backgroundColor: "#e75129",
      color: "white",
      border: "none",
      borderRadius: "0.375rem",
      padding: "0.75rem 1rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      transition: "background-color 0.2s ease",
    },
    outlineButton: {
      backgroundColor: "white",
      color: "#286058",
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      padding: "0.75rem 1rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      transition: "all 0.2s ease",
    },
    input: {
      backgroundColor: "white",
      color: "#286058",
      border: "1px solid #d1d5db",
      borderRadius: "0.375rem",
      padding: "0.5rem",
      fontSize: "0.875rem",
      transition: "border-color 0.2s ease",
      flex: 1,
    },
    inputGroup: {
      display: "flex",
      gap: "0.5rem",
      alignItems: "center",
    },
    description: {
      fontSize: "0.875rem",
      color: "#6b7280",
      textAlign: "center" as const,
      marginTop: "0.5rem",
    },
    label: {
      display: "block",
      fontSize: "0.875rem",
      fontWeight: "500",
      marginBottom: "0.5rem",
      color: "#286058",
    },
  }

  const uploadToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `recipe-images/${fileName}`

    const formData = new FormData()
    formData.append("file", file)
    formData.append("path", filePath)

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Upload failed")
    }

    const { publicUrl } = await response.json()
    return publicUrl
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Fout",
        description: "Alleen afbeeldingen zijn toegestaan",
        className: "bg-red-50 border-red-200 text-red-800",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fout",
        description: "Afbeelding mag maximaal 5MB zijn",
        className: "bg-red-50 border-red-200 text-red-800",
      })
      return
    }

    setIsUploading(true)

    try {
      const imageUrl = await uploadToSupabase(file)
      setPreviewUrl(imageUrl)
      onImageChange(imageUrl)

      toast({
        title: "Succes!",
        description: "Afbeelding succesvol geüpload",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      console.error("Upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Fout bij uploaden van afbeelding"

      toast({
        title: "Upload Fout",
        description: errorMessage,
        className: "bg-red-50 border-red-200 text-red-800",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return

    // Basic URL validation
    try {
      new URL(urlInput)
      setPreviewUrl(urlInput)
      onImageChange(urlInput)
      setUrlInput("")

      toast({
        title: "Succes!",
        description: "Afbeelding URL toegevoegd",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch {
      toast({
        title: "Fout",
        description: "Ongeldige URL",
        className: "bg-red-50 border-red-200 text-red-800",
      })
    }
  }

  const removeImage = () => {
    setPreviewUrl("")
    onImageChange("")
    setUrlInput("")
  }

  return (
    <div style={styles.container}>
      <label style={styles.label}>Recept Afbeelding</label>

      {previewUrl && (
        <div style={styles.previewCard}>
          <div style={styles.previewImage}>
            <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill style={{ objectFit: "cover" }} />
          </div>
          <button
            type="button"
            style={styles.removeButton}
            onClick={removeImage}
            disabled={disabled || isUploading}
            onMouseEnter={(e) => !disabled && !isUploading && (e.currentTarget.style.backgroundColor = "#d63e1a")}
            onMouseLeave={(e) => !disabled && !isUploading && (e.currentTarget.style.backgroundColor = "#e75129")}
          >
            <X style={{ height: "1rem", width: "1rem" }} />
          </button>
        </div>
      )}

      <div style={styles.tabContainer}>
        <div style={styles.tabList}>
          <button
            type="button"
            style={activeTab === "upload" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("upload")}
            onMouseEnter={(e) => {
              if (activeTab !== "upload") {
                e.currentTarget.style.backgroundColor = "#f9fafb"
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "upload") {
                e.currentTarget.style.backgroundColor = "transparent"
              }
            }}
          >
            Upload
          </button>
          <button
            type="button"
            style={activeTab === "camera" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("camera")}
            onMouseEnter={(e) => {
              if (activeTab !== "camera") {
                e.currentTarget.style.backgroundColor = "#f9fafb"
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "camera") {
                e.currentTarget.style.backgroundColor = "transparent"
              }
            }}
          >
            Camera
          </button>
          <button
            type="button"
            style={activeTab === "url" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("url")}
            onMouseEnter={(e) => {
              if (activeTab !== "url") {
                e.currentTarget.style.backgroundColor = "#f9fafb"
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "url") {
                e.currentTarget.style.backgroundColor = "transparent"
              }
            }}
          >
            URL
          </button>
        </div>

        {activeTab === "upload" && (
          <div style={styles.tabContent}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                style={{ display: "none" }}
                disabled={disabled || isUploading}
              />
              <button
                type="button"
                style={{
                  ...styles.outlineButton,
                  opacity: disabled || isUploading ? 0.5 : 1,
                }}
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                onMouseEnter={(e) => !disabled && !isUploading && (e.currentTarget.style.borderColor = "#286058")}
                onMouseLeave={(e) => !disabled && !isUploading && (e.currentTarget.style.borderColor = "#d1d5db")}
              >
                {isUploading ? (
                  <>
                    <Loader2
                      style={{
                        marginRight: "0.5rem",
                        height: "1rem",
                        width: "1rem",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Uploaden...
                  </>
                ) : (
                  <>
                    <Upload style={{ marginRight: "0.5rem", height: "1rem", width: "1rem" }} />
                    Kies bestand
                  </>
                )}
              </button>
              <p style={styles.description}>Ondersteunde formaten: JPG, PNG, GIF (max 5MB)</p>
            </div>
          </div>
        )}

        {activeTab === "camera" && (
          <div style={styles.tabContent}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                style={{ display: "none" }}
                disabled={disabled || isUploading}
              />
              <button
                type="button"
                style={{
                  ...styles.outlineButton,
                  opacity: disabled || isUploading ? 0.5 : 1,
                }}
                onClick={() => cameraInputRef.current?.click()}
                disabled={disabled || isUploading}
                onMouseEnter={(e) => !disabled && !isUploading && (e.currentTarget.style.borderColor = "#286058")}
                onMouseLeave={(e) => !disabled && !isUploading && (e.currentTarget.style.borderColor = "#d1d5db")}
              >
                {isUploading ? (
                  <>
                    <Loader2
                      style={{
                        marginRight: "0.5rem",
                        height: "1rem",
                        width: "1rem",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Uploaden...
                  </>
                ) : (
                  <>
                    <Camera style={{ marginRight: "0.5rem", height: "1rem", width: "1rem" }} />
                    Foto maken
                  </>
                )}
              </button>
              <p style={styles.description}>Maak een foto met je camera</p>
            </div>
          </div>
        )}

        {activeTab === "url" && (
          <div style={styles.tabContent}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={styles.inputGroup}>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={disabled || isUploading}
                  style={styles.input}
                  onFocus={(e) => (e.target.style.borderColor = "#286058")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
                <button
                  type="button"
                  style={{
                    ...styles.button,
                    width: "auto",
                    padding: "0.5rem",
                    opacity: disabled || isUploading || !urlInput.trim() ? 0.5 : 1,
                  }}
                  onClick={handleUrlSubmit}
                  disabled={disabled || isUploading || !urlInput.trim()}
                  onMouseEnter={(e) =>
                    !disabled && !isUploading && urlInput.trim() && (e.currentTarget.style.backgroundColor = "#d63e1a")
                  }
                  onMouseLeave={(e) =>
                    !disabled && !isUploading && urlInput.trim() && (e.currentTarget.style.backgroundColor = "#e75129")
                  }
                >
                  <LinkIcon style={{ height: "1rem", width: "1rem" }} />
                </button>
              </div>
              <p style={styles.description}>Voer een directe link naar een afbeelding in</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
