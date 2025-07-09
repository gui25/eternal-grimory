'use client'

import React, { useState, useEffect } from 'react'
import { Input } from './input'
import { Button } from './button'
import { Lock, Unlock } from 'lucide-react'

interface SpoilerVaultProps {
  children: React.ReactNode
  hash: string
}

export function SpoilerVault({ children, hash }: SpoilerVaultProps) {
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [currentHash, setCurrentHash] = useState('')

  // Generate hash in real-time as user types
  useEffect(() => {
    const generateHash = async () => {
      if (!input.trim()) {
        setCurrentHash('')
        return
      }

      try {
        const encoder = new TextEncoder()
        const data = encoder.encode(input.trim())
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        setCurrentHash(hashHex)
      } catch (err) {
        console.error('Erro ao gerar hash:', err)
        setCurrentHash('erro')
      }
    }

    generateHash()
  }, [input])

  const handleUnlock = async () => {
    if (!input.trim()) {
      setError('Digite a senha')
      return
    }

    try {
      if (currentHash === hash) {
        setUnlocked(true)
        setError('')
      } else {
        setError('Senha incorreta')
      }
    } catch (err) {
      console.error('Erro ao processar hash:', err)
      setError('Erro ao processar senha')
    }
  }

  const handleLock = () => {
    setUnlocked(false)
    setInput('')
    setError('')
    setCurrentHash('')
  }

  if (unlocked) {
    return (
      <div className="spoiler-content border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-r-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <span className="text-sm font-medium">Conteúdo Confidencial Desbloqueado</span>
          </div>
          <Button 
            onClick={handleLock}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200"
            title="Bloquear novamente"
          >
            <Unlock className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="spoiler-vault border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-r-lg">
      <div className="flex items-center gap-2 mb-3 text-red-700 dark:text-red-300">
        <Lock className="h-4 w-4" />
        <span className="text-sm font-medium">Conteúdo Protegido por Senha</span>
      </div>
      
      <div className="space-y-3">
        <div className="text-xs text-muted-foreground">
          Digite a senha para desbloquear este conteúdo confidencial:
        </div>
        
        <div className="flex gap-2">
          <Input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite a senha..."
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUnlock()
              }
            }}
          />
          <Button 
            onClick={handleUnlock} 
            size="sm"
            variant="secondary"
          >
            <Unlock className="h-3 w-3" />
          </Button>
        </div>
        
        {error && (
          <div className="text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 