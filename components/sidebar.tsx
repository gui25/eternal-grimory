"use client"

import React, { useState, useCallback, useMemo, memo, useEffect } from "react"
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
  Settings,
  FileText,
} from "lucide-react"
import CampaignSwitcher from "./campaign-switcher"
import { isAdminMode } from "@/lib/dev-utils"

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
}

// Memoized NavLink component to prevent unnecessary re-renders
const NavLink = memo(function NavLink({
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
})

// Define navigation items outside the component to prevent recreating on each render
const NAVIGATION_ITEMS: NavItem[] = [
  { href: "/", label: "Início", icon: <Home className="h-5 w-5" /> },
  { href: "/characters/players", label: "Personagens", icon: <User className="h-5 w-5" /> },
  { href: "/characters/npcs", label: "NPCs", icon: <Users className="h-5 w-5" /> },
  { href: "/characters/monsters", label: "Monstros", icon: <Shield className="h-5 w-5" /> },
  { href: "/items", label: "Itens", icon: <Sword className="h-5 w-5" /> },
  { href: "/sessions", label: "Sessões", icon: <Scroll className="h-5 w-5" /> },
  { href: "/notes", label: "Anotações", icon: <FileText className="h-5 w-5" /> },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setShowAdmin(isAdminMode())
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setIsOpen(false)
  }, [])

  const isActive = useCallback((path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }, [pathname])

  // Memoize the sidebar content to prevent unnecessary re-renders
  const sidebarContent = useMemo(() => (
    <div className="flex-1 overflow-y-auto pt-8 pb-4">
      <nav className="px-4 space-y-2" aria-label="Menu principal">
        <ul className="space-y-2">
          {NAVIGATION_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink
                href={item.href}
                active={isActive(item.href)}
                onClick={closeSidebar}
                icon={item.icon}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
          
          {/* Admin Panel - only show in development mode */}
          {showAdmin && (
            <li className="pt-2">
              <NavLink
                href="/admin"
                active={isActive("/admin")}
                onClick={closeSidebar}
                icon={<Settings className="h-5 w-5" />}
              >
                <span className="flex items-center">
                  Admin
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gold-primary/20 text-gold-primary rounded-full">
                    DEV
                  </span>
                </span>
              </NavLink>
            </li>
          )}
          
          {/* Campaign Switcher logo após as Sessões */}
          <li className="pt-2">
            <CampaignSwitcher />
          </li>
        </ul>
      </nav>
    </div>
  ), [isActive, closeSidebar, showAdmin])

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
          "fixed inset-y-0 left-0 z-40 w-64 bg-wine-darker border-r border-gold-dark shadow-lg flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label="Navegação principal"
      >
        {/* Cabeçalho inspirado na referência, com ícone + texto */}
        <div className="py-4 px-5 border-b border-gold shrink-0">
          <Link 
            href="/" 
            prefetch={true} 
            className="flex items-center gap-3 group" 
            onClick={closeSidebar}
          >
            {/* Ícone de grimório com 2rem */}
            <div className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <BookMarked 
                className="w-8 h-8 text-gold transition-transform duration-200 group-hover:scale-105" 
                strokeWidth={1.5}
                aria-hidden="true" 
              />
            </div>
            
            {/* Nome do aplicativo em estilo clean */}
            <h1 className="text-lg font-heading font-semibold text-gold tracking-wide">
              Grimório Eterno
            </h1>
          </Link>
        </div>

        {/* Conteúdo principal do sidebar, com flex-1 para preencher o espaço */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {sidebarContent}
        </div>
      </aside>
    </>
  )
}

