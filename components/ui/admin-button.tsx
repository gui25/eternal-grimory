'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { isAdminMode } from '@/lib/dev-utils'
import { Plus, Settings } from 'lucide-react'
import Link from 'next/link'

interface AdminButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

/**
 * Botão que só aparece em modo de desenvolvimento local
 */
export function AdminButton({ href, children, variant = 'outline', size = 'sm', className }: AdminButtonProps) {
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    // Verificar se estamos em modo admin apenas no cliente
    setShowAdmin(isAdminMode())
  }, [])

  if (!showAdmin) {
    return null
  }

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={href}>
        {children}
      </Link>
    </Button>
  )
}

/**
 * Botão flutuante de admin para criar novo conteúdo
 */
export function AdminFloatingButton({ href, children, className }: Omit<AdminButtonProps, 'variant' | 'size'>) {
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    setShowAdmin(isAdminMode())
  }, [])

  if (!showAdmin) {
    return null
  }

  return (
    <Button 
      asChild 
      className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gold-primary hover:bg-gold-dark text-wine-darker z-50 ${className}`}
      size="icon"
    >
      <Link href={href}>
        {children}
      </Link>
    </Button>
  )
}

/**
 * Seção de botões de admin para páginas de listagem
 */
export function AdminSection({ children, className }: { children: React.ReactNode, className?: string }) {
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    setShowAdmin(isAdminMode())
  }, [])

  if (!showAdmin) {
    return null
  }

  return (
    <div className={`border-2 border-dashed border-gold-primary/50 rounded-lg p-4 mb-6 bg-gold-primary/5 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Settings className="h-4 w-4 text-gold-primary" />
        <span className="text-sm font-medium text-gold-primary">Modo Desenvolvimento</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  )
} 