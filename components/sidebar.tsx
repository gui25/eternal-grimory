"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BookMarked,
  Menu,
  X,
  Scroll,
  Sword,
  Users,
  Shield,
  User,
  Home,
} from "lucide-react"

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-wine-darker p-2 rounded-md"
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-wine-darker border-r border-gold/20 z-40 transition-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6">
          <Link href="/" prefetch={true} className="flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-gold" />
            <span className="font-heading text-xl font-bold text-gold">
              Grimório Eterno
            </span>
          </Link>
        </div>

        <nav className="px-4 py-2">
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-wine-dark transition-colors",
                  isActive("/") ? "bg-wine-dark text-gold" : "text-gold-light/80"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Início</span>
              </Link>
            </li>
            <li>
              <Link
                href="/characters/players"
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-wine-dark transition-colors",
                  isActive("/characters/players")
                    ? "bg-wine-dark text-gold"
                    : "text-gold-light/80"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Personagens</span>
              </Link>
            </li>
            <li>
              <Link
                href="/characters/npcs"
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-wine-dark transition-colors",
                  isActive("/characters/npcs")
                    ? "bg-wine-dark text-gold"
                    : "text-gold-light/80"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span>NPCs</span>
              </Link>
            </li>
            <li>
              <Link
                href="/characters/monsters"
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-wine-dark transition-colors",
                  isActive("/characters/monsters")
                    ? "bg-wine-dark text-gold"
                    : "text-gold-light/80"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Shield className="h-5 w-5" />
                <span>Monstros</span>
              </Link>
            </li>
            <li>
              <Link
                href="/items"
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-wine-dark transition-colors",
                  isActive("/items")
                    ? "bg-wine-dark text-gold"
                    : "text-gold-light/80"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Sword className="h-5 w-5" />
                <span>Itens</span>
              </Link>
            </li>
            <li>
              <Link
                href="/sessions"
                prefetch={true}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-wine-dark transition-colors",
                  isActive("/sessions")
                    ? "bg-wine-dark text-gold"
                    : "text-gold-light/80"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Scroll className="h-5 w-5" />
                <span>Sessões</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  )
}

