"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router"

const ModernHeader = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(`/recepten?q=${searchQuery}`)
    }
  }

  return (
    <header
      style={{
        backgroundColor: "#f9fafb",
        padding: "1rem 0",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 1rem",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#286058",
            textDecoration: "none",
          }}
        >
          Receptenboek
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              marginRight: "1rem",
              width: "200px",
            }}
          >
            <input
              type="text"
              placeholder="Zoek recepten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "white",
                color: "#286058",
                outline: "none",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#286058"
                e.target.style.boxShadow = "0 0 0 2px rgba(40, 96, 88, 0.2)"
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db"
                e.target.style.boxShadow = "none"
              }}
            />
          </div>
          <Link
            href="/recept-toevoegen"
            style={{
              backgroundColor: "#286058",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "0.875rem",
              lineHeight: "1.25rem",
              fontWeight: "500",
              transition: "background-color 0.2s ease",
              "&:hover": {
                backgroundColor: "#1e403a",
              },
            }}
          >
            Recept Toevoegen
          </Link>
        </div>
      </div>
    </header>
  )
}

export default ModernHeader
