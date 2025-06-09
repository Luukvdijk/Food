"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Camera, LinkIcon, X, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

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

    setUploadError("")

    // Validate file type
    if (!file.type.startsWith("image/")) {
      const error = "Alleen afbeeldingen zijn toegestaan"
      setUploadError(error)
      toast({
        title: "Fout",
        description: error,
        className: "bg-red-50 border-red-200 text-red-800",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const error = "Afbeelding mag maximaal 5MB zijn"
      setUploadError(error)
      toast({
        title: "Fout",
        description: error,
        className: "bg-red-50 border-red-200 text-red-800",
      })
      return
    }

    setIsUploading(true)

    try {
      const imageUrl = await uploadToSupabase(file)
      setPreviewUrl(imageUrl)
      onImageChange(imageUrl)
      setUploadError("")

      toast({
        title: "Succes!",
        description: "Afbeelding succesvol geüpload",
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      console.error("Upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Fout bij uploaden van afbeelding"
      setUploadError(errorMessage)

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

    setUploadError("")

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
      const error = "Ongeldige URL"
      setUploadError(error)
      toast({
        title: "Fout",
        description: error,
        className: "bg-red-50 border-red-200 text-red-800",
      })
    }
  }

  const removeImage = () => {
    setPreviewUrl("")
    onImageChange("")
    setUrlInput("")
    setUploadError("")
  }

  return (
    <div className="space-y-4">
      <Label>Recept Afbeelding</Label>

      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {previewUrl && (
        <Card>
          <CardContent className="pt-4">
            <div className="relative">
              <div className="relative h-48 w-full rounded-lg overflow-hidden">
                <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
                disabled={disabled || isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="camera">Camera</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="hidden"
                  disabled={disabled || isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploaden...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Kies bestand
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Ondersteunde formaten: JPG, PNG, GIF (max 5MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="camera" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="hidden"
                  disabled={disabled || isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={disabled || isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploaden...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Foto maken
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center">Maak een foto met je camera</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={disabled || isUploading}
                  />
                  <Button
                    type="button"
                    onClick={handleUrlSubmit}
                    disabled={disabled || isUploading || !urlInput.trim()}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Voer een directe link naar een afbeelding in</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
