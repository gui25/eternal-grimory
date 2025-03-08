import type { ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { Cinzel, Lora } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import Sidebar from "@/components/sidebar"
import RoutePreloader from "@/components/route-preloader"

// Load fonts
const headingFont = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-heading",
  display: "swap", // Use 'swap' to ensure text remains visible during font loading
})

const bodyFont = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap", // Use 'swap' to ensure text remains visible during font loading
})

// Metadata properly typed and expanded for better SEO
export const metadata: Metadata = {
  title: {
    template: "%s | Grimório Eterno",
    default: "Grimório Eterno",
  },
  description: "Seu compêndio mágico para campanhas de RPG, itens, NPCs, monstros e relatórios de sessão",
  keywords: ["RPG", "D&D", "compêndio", "campanha", "mestre", "jogador"],
  authors: [
    {
      name: "Grimório Eterno",
      url: "https://grimorio-eterno.com",
    },
  ],
  creator: "Grimório Eterno",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Grimório Eterno",
    description: "Seu compêndio mágico para campanhas de RPG",
    siteName: "Grimório Eterno",
  },
}

// Viewport configuration
export const viewport: Viewport = {
  themeColor: "#5E1320", // wine-dark color as theme
  width: "device-width",
  initialScale: 1,
}

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" className={`${headingFont.variable} ${bodyFont.variable} dark`}>
      <body className="font-body bg-wine-dark text-foreground">
        <div className="flex min-h-screen">
          {/* Analytics components */}
          <Analytics />
          <SpeedInsights />
          
          {/* Preload key routes */}
          <RoutePreloader />
          
          {/* Navigation sidebar */}
          <Sidebar />
          
          {/* Main content area */}
          <main className="flex-1 p-4 md:p-8 md:ml-64 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
