"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

export default function LoadingSpinner({ message = "Carregando..." }: { message?: string }) {
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."))
    }, 400)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-gold-primary border-r-gold-light border-b-gold-dark animate-spin-slow"></div>

        {/* Inner spinning ring (opposite direction) */}
        <div className="absolute top-2 left-2 w-20 h-20 rounded-full border-4 border-transparent border-t-gold-dark border-r-gold-primary border-b-gold-light animate-spin-reverse"></div>

        {/* Center emblem */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-wine-darker rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className="h-6 w-6 text-gold-primary animate-pulse" />
        </div>

        {/* Glowing effect */}
        <div className="absolute -inset-2 bg-gold-primary/20 rounded-full blur-md animate-pulse-slow"></div>
      </div>

      {/* Loading text */}
      <div className="mt-8 text-gold-light font-heading text-xl">
        {message}
        <span className="inline-block w-8">{dots}</span>
      </div>

      {/* Decorative runes */}
      <div className="mt-4 flex space-x-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-gold-primary rounded-full animate-float"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </div>
  )
}

