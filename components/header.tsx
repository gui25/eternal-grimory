"use client"

import { usePathname } from "next/navigation"
import { BirdIcon as Dragon, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function Header() {
  const pathname = usePathname()

  // Get the current page title based on the pathname
  const getPageTitle = () => {
    if (pathname === "/") return "Painel da Campanha"
    if (pathname === "/items") return "Itens & Equipamentos"
    if (pathname === "/sessions") return "Sessões da Campanha"
    if (pathname === "/characters") return "Personagens dos Jogadores"

    // Default title
    return "Rastreador de Campanha D&D"
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-brown-800 border-b border-brown-700 shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <Dragon className="h-6 w-6 text-amber-700 mr-2 hidden md:block" />
          <h1 className="text-xl md:text-2xl font-heading font-bold text-brown-100">{getPageTitle()}</h1>
        </div>

        <div className="w-full md:w-auto flex items-center space-x-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-brown-400" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full pl-9 bg-brown-900 border-brown-700 text-brown-100 placeholder:text-brown-400 focus:border-amber-700 focus:ring-amber-700"
            />
          </div>
          <button className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-brown-100 rounded-md font-medium transition-colors">
            A Aventura Aguarda!
          </button>
        </div>
      </div>
    </header>
  )
}

