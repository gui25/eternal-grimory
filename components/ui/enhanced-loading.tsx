"use client"

import { useState, useEffect } from "react"
import { Sparkles, Flame, BookOpen, Users, Sword, Scroll } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedLoadingProps {
  context?: "characters" | "items" | "sessions" | "general"
  message?: string
  size?: "sm" | "md" | "lg"
  skeleton?: boolean
  delay?: number
}

const contextIcons = {
  characters: Users,
  items: Sword,
  sessions: Scroll,
  general: BookOpen
}

const contextMessages = {
  characters: "Invocando personagens...",
  items: "Forjar itens mágicos...",
  sessions: "Preparando pergaminhos...",
  general: "Carregando grimório..."
}

export function EnhancedLoading({ 
  context = "general", 
  message, 
  size = "md", 
  skeleton = false,
  delay = 0
}: EnhancedLoadingProps) {
  const [show, setShow] = useState(delay === 0)
  const [phase, setPhase] = useState(0)
  
  const Icon = contextIcons[context]
  const defaultMessage = message || contextMessages[context]
  
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShow(true), delay)
      return () => clearTimeout(timer)
    }
  }, [delay])
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(prev => (prev + 1) % 3)
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  if (!show) return null
  
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10", 
    lg: "w-16 h-16"
  }
  
  const containerClasses = {
    sm: "py-4",
    md: "py-8",
    lg: "py-16"
  }
  
  if (skeleton) {
    return (
      <div className={cn("animate-pulse space-y-4", containerClasses[size])}>
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-gold/20 h-12 w-12"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gold/20 rounded w-3/4"></div>
            <div className="h-4 bg-gold/20 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gold/10 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      containerClasses[size]
    )}>
      {/* Main loading indicator */}
      <div className="relative">
        {/* Outer ring */}
        <div className={cn(
          "rounded-full border-4 border-gold/20 border-t-gold animate-spin",
          sizeClasses[size]
        )}></div>
        
        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className={cn(
            "text-gold animate-pulse",
            size === "sm" ? "w-3 h-3" : size === "md" ? "w-5 h-5" : "w-8 h-8"
          )} />
        </div>
      </div>
      
      {/* Animated message */}
      <div className={cn(
        "mt-4 text-gold-light font-heading text-center",
        size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"
      )}>
        {defaultMessage}
        <span className="inline-block ml-1">
          {Array.from({ length: phase + 1 }).map((_, i) => (
            <span key={i} className="animate-pulse">.</span>
          ))}
        </span>
      </div>
      
      {/* Progress indicator */}
      <div className="mt-2 w-24 h-1 bg-gold/20 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full animate-pulse"
          style={{ 
            width: `${30 + (phase * 20)}%`,
            transition: 'width 1s ease-in-out'
          }}
        />
      </div>
    </div>
  )
} 