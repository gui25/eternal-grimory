"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

interface ConfettiButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function ConfettiButton({ children, className, onClick }: ConfettiButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    const createConfetti = (event: MouseEvent) => {
      const rect = button.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Cores dos confetes: dourado, vermelho e preto
      const colors = [
        "#FFD700", // Dourado
        "#FFC107", // Dourado mais claro
        "#E6B800", // Dourado mais escuro
        "#FF0000", // Vermelho
        "#D32F2F", // Vermelho mais escuro
        "#FF5252", // Vermelho mais claro
        "#000000", // Preto
        "#212121", // Preto mais claro
      ]

      // Criar 100 confetes
      for (let i = 0; i < 100; i++) {
        const confetti = document.createElement("div")
        confetti.className = "confetti"

        // Tamanho aleatório entre 5px e 10px
        const size = Math.random() * 5 + 5
        confetti.style.width = `${size}px`
        confetti.style.height = `${size}px`

        // Cor aleatória da nossa paleta
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]

        // Posição inicial no centro do botão
        confetti.style.position = "fixed"
        confetti.style.left = `${centerX}px`
        confetti.style.top = `${centerY}px`
        confetti.style.zIndex = "9999"
        confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0"
        confetti.style.opacity = "1"

        document.body.appendChild(confetti)

        // Animação
        const angle = Math.random() * Math.PI * 2 // Ângulo aleatório
        const velocity = Math.random() * 5 + 5 // Velocidade aleatória
        const vx = Math.cos(angle) * velocity
        const vy = Math.sin(angle) * velocity

        // Rotação aleatória
        const rotation = Math.random() * 360
        confetti.style.transform = `rotate(${rotation}deg)`

        let x = centerX
        let y = centerY
        let opacity = 1
        let scale = 1

        const animate = () => {
          x += vx
          y += vy + 0.5 // Adiciona gravidade
          opacity -= 0.01
          scale -= 0.005

          confetti.style.left = `${x}px`
          confetti.style.top = `${y}px`
          confetti.style.opacity = `${opacity}`
          confetti.style.transform = `rotate(${rotation}deg) scale(${scale})`

          if (opacity > 0) {
            requestAnimationFrame(animate)
          } else {
            confetti.remove()
          }
        }

        requestAnimationFrame(animate)
      }
    }

    const handleClick = (e: MouseEvent) => {
      createConfetti(e)
      if (onClick) onClick()
    }

    button.addEventListener("click", handleClick)
    return () => {
      button.removeEventListener("click", handleClick)
    }
  }, [onClick])

  return (
    <Button ref={buttonRef} variant="rpg" className={`adventure-button ${className || ""}`}>
      {children}
    </Button>
  )
}

