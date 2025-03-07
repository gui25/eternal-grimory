"use client"

import { useEffect, useState } from "react"
import { Sparkles, Flame } from "lucide-react"

export default function LoadingSpinner({ message = "Carregando..." }: { message?: string }) {
  // Estado para controlar a animação das letras
  const [charIndices, setCharIndices] = useState<number[]>([])

  useEffect(() => {
    // Inicializa o array de índices com -1 (não animado)
    setCharIndices(Array(message.length).fill(-1))

    // Função para animar as letras uma a uma
    const animateLetters = () => {
      let currentIndex = 0

      const interval = setInterval(() => {
        if (currentIndex >= message.length) {
          // Reinicia a animação quando todas as letras foram animadas
          setCharIndices(Array(message.length).fill(-1))
          currentIndex = 0
          return
        }

        setCharIndices((prev) => {
          const newIndices = [...prev]
          newIndices[currentIndex] = currentIndex
          return newIndices
        })

        currentIndex++
      }, 150) // Velocidade da animação das letras

      return () => clearInterval(interval)
    }

    return animateLetters()
  }, [message])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-16">
      {/* Container principal com efeito de brilho */}
      <div className="relative">
        {/* Efeito de brilho de fundo */}
        <div className="absolute -inset-8 bg-gold-primary/10 rounded-full blur-xl animate-pulse-slow"></div>

        {/* Círculo externo decorativo */}
        <div className="absolute -inset-4 rounded-full border border-gold-primary/30"></div>

        {/* Anel externo girando */}
        <div className="w-40 h-40 rounded-full border-4 border-transparent border-t-gold-primary border-r-gold-light border-b-gold-dark animate-spin-slow"></div>

        {/* Anel médio girando na direção oposta */}
        <div className="absolute top-4 left-4 w-32 h-32 rounded-full border-4 border-transparent border-t-gold-dark border-r-gold-primary border-b-gold-light animate-spin-reverse"></div>

        {/* Anel interno girando mais rápido */}
        <div className="absolute top-8 left-8 w-24 h-24 rounded-full border-4 border-transparent border-t-red-accent border-r-gold-primary border-b-red-accent animate-spin-fast"></div>

        {/* Círculo central com emblema */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-wine-darker rounded-full flex items-center justify-center shadow-lg overflow-hidden">
          {/* Efeito de brilho interno */}
          <div className="absolute inset-0 bg-gradient-to-br from-gold-primary/20 to-red-accent/20 animate-pulse-slow"></div>

          {/* Ícone central */}
          <div className="relative">
            <Sparkles className="h-10 w-10 text-gold-primary animate-pulse" />
            <Flame className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-red-accent animate-pulse-slow" />
          </div>
        </div>

        {/* Partículas orbitando */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-gold-primary shadow-lg shadow-gold-primary/50"
            style={{
              transform: `rotate(${i * 45}deg) translateX(80px)`,
              animation: `orbit ${3 + i * 0.5}s linear infinite`,
            }}
          ></div>
        ))}

        {/* Runas mágicas flutuantes */}
        {["✧", "⚝", "⚜", "✦", "⚘"].map((rune, i) => (
          <div
            key={i}
            className="absolute text-gold-primary text-xl font-bold"
            style={{
              top: `${20 + Math.sin(i * 72) * 100}px`,
              left: `${20 + Math.cos(i * 72) * 100}px`,
              animation: `float ${2 + i * 0.3}s ease-in-out infinite alternate, 
                          glow ${3 + i * 0.5}s ease-in-out infinite alternate`,
            }}
          >
            {rune}
          </div>
        ))}
      </div>

      {/* Texto de carregamento com animação de salto */}
      <div className="mt-12 text-gold-light font-heading text-2xl tracking-wider">
        {message.split("").map((char, index) => (
          <span
            key={index}
            className={`inline-block transition-transform duration-200 ${
              charIndices[index] === index ? "animate-bounce" : ""
            }`}
            style={{
              animationDuration: "0.5s",
              animationDelay: `${index * 0.05}s`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>

      {/* Texto decorativo */}
      <div className="mt-4 text-gold-light/50 font-heading text-sm">Preparando magia ancestral...</div>
    </div>
  )
}

