import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lekkere Recepten",
  description: "Ontdek heerlijke recepten voor elk seizoen en elke gelegenheid",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' fontSize='90'>🍽️</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          <main className="container mx-auto py-8 px-4">{children}</main>
          <footer className="border-t py-6 mt-12">
            <div className="container mx-auto text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Lekkere Recepten - Alle rechten voorbehouden
            </div>
          </footer>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
