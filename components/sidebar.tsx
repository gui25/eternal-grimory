"use client"

import React, { useState, useCallback } from "react"
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

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const isActive = useCallback((path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }, [pathname])

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
      {!isOpen && (
        <button
          className="fixed z-50 top-4 left-4 p-2 rounded-md bg-wine-darker border border-gold-dark text-gold md:hidden hover:bg-wine-dark hover:border-gold transition-colors"
          onClick={toggleSidebar}
          aria-label="Abrir menu lateral"
          aria-expanded={isOpen}
          aria-controls="sidebar"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
          role="presentation"
        />
      )}

      <aside
        id="sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-wine-darker border-r border-gold-dark shadow-lg",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label="Navegação principal"
      >
        <div className="flex items-center justify-between p-4 border-b border-gold-dark">
          <Link href="/" prefetch={true} className="flex items-center gap-2">
            <BookMarked className="h-7 w-7 text-gold" aria-hidden="true" />
            <h1 className="text-2xl font-heading font-bold text-gold">
              Grimório Eterno
            </h1>
          </Link>

          <button
            className="md:hidden text-gold hover:text-gold-light transition-colors"
            onClick={toggleSidebar}
            aria-label="Fechar menu lateral"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
          <nav className="px-4 space-y-2" aria-label="Menu principal">
            <ul className="space-y-2">
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
        </div>
      </aside>
    </>
  )
}

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
        "flex items-center px-4 py-3 text-base font-medium rounded-md transition-colors",
        active
          ? "bg-wine-dark text-gold border-l-2 border-gold"
          : "text-gold-light hover:bg-wine-dark hover:text-gold"
      )}
      onClick={onClick}
    >
      <span className="mr-3 flex-shrink-0">{icon}</span>
      <span>{children}</span>
    </Link>
  )
}

