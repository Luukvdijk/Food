"use client"

import type React from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/status")
        if (response.ok) {
          const data = await response.json()
          if (data.isAuthenticated) {
            router.push("/admin")
          }
        }
      } catch (error) {
        // Ignore errors, user is not authenticated
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Successful login, redirect to admin
        router.push("/admin")
        router.refresh()
      } else {
        setError(data.error || "Inloggen mislukt")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Er is een fout opgetreden bij het inloggen")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#286058" }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <button
            className="mb-4 inline-flex items-center px-4 py-2 text-white hover:text-white/80 transition-colors"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar website
          </button>
        </div>

        <div className="rounded-lg border shadow-lg p-8" style={{ backgroundColor: "#eee1d1" }}>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "#286058" }}>
              Admin Inloggen
            </h1>
            <p className="text-sm mt-2" style={{ color: "#286058", opacity: 0.7 }}>
              Log in met je Supabase account om toegang te krijgen tot het admin paneel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="p-3 rounded-md border"
                style={{ backgroundColor: "#fee2e2", borderColor: "#fecaca", color: "#dc2626" }}
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: "#286058" }}>
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = "#eee1d1"
                  e.target.style.boxShadow = "0 0 0 3px rgba(238, 225, 209, 0.3)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#286058"
                  e.target.style.boxShadow = "none"
                }}
                required
                placeholder="je@email.com"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #286058",
                  borderRadius: "6px",
                  backgroundColor: "#ffffff",
                  color: "#286058",
                  fontSize: "14px",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: "#286058" }}>
                Wachtwoord
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = "#eee1d1"
                  e.target.style.boxShadow = "0 0 0 3px rgba(238, 225, 209, 0.3)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#286058"
                  e.target.style.boxShadow = "none"
                }}
                required
                placeholder="••••••••"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #286058",
                  borderRadius: "6px",
                  backgroundColor: "#ffffff",
                  color: "#286058",
                  fontSize: "14px",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "#e75129",
                color: "#ffffff",
              }}
            >
              {isLoading ? "Inloggen..." : "Inloggen"}
            </button>
          </form>

          <div className="mt-4 text-sm text-center" style={{ color: "#286058", opacity: 0.7 }}>
            <p>Accounts worden beheerd via Supabase Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  )
}
