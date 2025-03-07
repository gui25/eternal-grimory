"use client"

import { useState, useCallback } from "react"
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

// Tipos para melhorar a documentação e prevenir erros
type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Usando useCallback para evitar recriação da função em cada renderização
  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  // Verificar se um link está ativo
  const isActive = useCallback((path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }, [pathname])

  // Lista de itens de navegação para fácil manutenção
  const navItems: NavItem[] = [
    { href: "/", label: "Início", icon: <Home className="h-5 w-5" /> },
    { href: "/characters/players", label: "Personagens", icon: <User className="h-5 w-5" /> },
    { href: "/characters/npcs", label: "NPCs", icon: <Users className="h-5 w-5" /> },
    { href: "/characters/monsters", label: "Monstros", icon: <Shield className="h-5 w-5" /> },
    { href: "/items", label: "Itens", icon: <Sword className="h-5 w-5" /> },
    { href: "/sessions", label: "Sessões", icon: <Scroll className="h-5 w-5" /> },
  ]

  return (
    <>
      {/* Toggle button - visível apenas quando fechado e em telas menores */}
      {!isOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-wine-darker p-2 rounded-md"
          onClick={toggleSidebar}
          aria-label="Abrir menu lateral"
          aria-expanded={isOpen}
          aria-controls="sidebar"
        >
          <Menu aria-hidden="true" />
        </button>
      )}

      {/* Overlay para fechar a sidebar em dispositivos móveis */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
          role="presentation"
        />
      )}

      {/* Sidebar principal */}
      <aside
        id="sidebar"
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-wine-darker border-r border-gold/20 z-40",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label="Navegação principal"
      >
        {/* Header da Sidebar */}
        <div className="p-6 flex items-center justify-between">
          <Link href="/" prefetch={true} className="flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-gold" aria-hidden="true" />
            <span className="font-heading text-xl font-bold text-gold">
              Grimório Eterno
            </span>
          </Link>

          {/* Botão para fechar em dispositivos móveis */}
          <button
            className="md:hidden text-gold-light/80 hover:text-gold transition-colors"
            onClick={toggleSidebar}
            aria-label="Fechar menu lateral"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Menu de navegação */}
        <nav className="px-4 py-2" aria-label="Menu principal">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  active={isActive(item.href)}
                  onClick={toggleSidebar}
                  icon={item.icon}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}

// Componente extraído para reutilização e limpeza do código
function NavLink({
  href,
  active,
  onClick,
  icon,
  children,
}: {
  href: string
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        "hover:bg-wine-dark focus:bg-wine-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-gold",
        active ? "bg-wine-dark text-gold" : "text-gold-light/80"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}

