import type React from "react"
import type { Metadata } from "next"
import { Cinzel, Lora } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import Sidebar from "@/components/sidebar"

const headingFont = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-heading",
})

const bodyFont = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
})

export const metadata: Metadata = {
  title: "Grimório Eterno",
  description: "Seu compêndio mágico para campanhas de RPG, itens, NPCs, monstros e relatórios de sessão",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable} dark`}>
      <body className="font-body bg-wine-dark text-foreground">
        <div className="flex min-h-screen">
          <Analytics />
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 md:ml-64">{children}</main>
        </div>
      </body>
    </html>
  )
}
