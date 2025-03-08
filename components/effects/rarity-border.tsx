"use client"

import { cn } from "@/lib/utils"

type RarityType = "common" | "uncommon" | "rare" | "epic" | "legendary"

interface RarityBorderProps {
  children: React.ReactNode
  rarity: RarityType
  className?: string
  pulseIntensity?: "subtle" | "medium" | "strong"
  interactive?: boolean
}

export default function RarityBorder({
  children,
  rarity,
  className,
  pulseIntensity = "medium",
  interactive = true
}: RarityBorderProps) {
  // Define rarity colors and animations
  const rarityConfig = {
    common: {
      borderColor: "border-gray-400",
      shadowColor: "shadow-gray-400/20",
      glowColor: "after:bg-gray-400/10",
      animationClass: "animate-pulse-slow"
    },
    uncommon: {
      borderColor: "border-green-400",
      shadowColor: "shadow-green-400/20",
      glowColor: "after:bg-green-400/10",
      animationClass: "animate-pulse-slow"
    },
    rare: {
      borderColor: "border-blue-400",
      shadowColor: "shadow-blue-400/20",
      glowColor: "after:bg-blue-400/10",
      animationClass: "animate-pulse-slow"
    },
    epic: {
      borderColor: "border-purple-400",
      shadowColor: "shadow-purple-400/30",
      glowColor: "after:bg-purple-400/15",
      animationClass: "animate-pulse-slow"
    },
    legendary: {
      borderColor: "border-gold",
      shadowColor: "shadow-gold/30",
      glowColor: "after:bg-gold/15",
      animationClass: "animate-pulse-slow"
    }
  }

  // Intensity modifiers
  const intensityClasses = {
    subtle: {
      borderWidth: "border",
      shadowSize: "shadow-sm",
      glowOpacity: "opacity-30",
      animation: ""
    },
    medium: {
      borderWidth: "border-2",
      shadowSize: "shadow-md",
      glowOpacity: "opacity-50",
      animation: rarityConfig[rarity].animationClass
    },
    strong: {
      borderWidth: "border-2",
      shadowSize: "shadow-lg",
      glowOpacity: "opacity-70",
      animation: rarityConfig[rarity].animationClass
    }
  }

  // Interactive hover states
  const interactiveClasses = interactive 
    ? "transition-all duration-300 hover:shadow-lg hover:scale-[1.01]" 
    : "";

  return (
    <div 
      className={cn(
        "relative rounded-md overflow-hidden", 
        intensityClasses[pulseIntensity].borderWidth,
        rarityConfig[rarity].borderColor,
        intensityClasses[pulseIntensity].shadowSize,
        rarityConfig[rarity].shadowColor,
        interactiveClasses,
        className
      )}
    >
      {/* Glow effect */}
      <div 
        className={cn(
          "absolute inset-0 z-0 after:absolute after:inset-0 after:blur-xl",
          rarityConfig[rarity].glowColor,
          intensityClasses[pulseIntensity].glowOpacity,
          intensityClasses[pulseIntensity].animation
        )}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
} 