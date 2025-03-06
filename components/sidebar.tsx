"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, Sword, Users, Scroll, Menu, BirdIcon as Dragon } from "lucide-react"

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navigation = [
    { name: "Painel", href: "/", icon: BookOpen },
    { name: "Itens", href: "/items", icon: Sword },
    { name: "Sessões", href: "/sessions", icon: Scroll },
    { name: "Personagens", href: "/characters", icon: Users },
  ]

  return (
    <>
      {/* Mobile menu button - only visible when sidebar is closed */}
      {!isMobileMenuOpen && (
        <button
          className="fixed z-50 top-4 left-4 p-2 rounded-md bg-wine-darker border border-gold-dark text-gold md:hidden hover:bg-wine-dark hover:border-gold transition-colors"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Sidebar - different styles for mobile and desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-wine-darker border-r border-gold-dark shadow-lg transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0", // Hide by default on mobile, always show on desktop
        )}
      >
        <div className="flex items-center justify-center p-4 border-b border-gold-dark">
          <Dragon className="h-8 w-8 text-gold mr-2" />
          <h1 className="text-2xl font-heading font-bold text-gold">Grimório Eterno</h1>
        </div>

        <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
          <nav className="px-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-base font-medium rounded-md group transition-colors",
                  pathname === item.href
                    ? "bg-wine-dark text-gold border-l-2 border-gold"
                    : "text-gold-light hover:bg-wine-dark hover:text-gold",
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile backdrop - only visible when sidebar is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}

