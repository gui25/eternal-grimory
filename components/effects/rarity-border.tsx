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
      shadowColor: "shadow-gold/50",
      glowColor: "after:bg-gradient-to-r after:from-gold/30 after:via-yellow-300/40 after:to-gold/30",
      animationClass: "animate-glow"
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

  // Adicionar classes especiais para itens lendários
  const legendaryClasses = rarity === "legendary" 
    ? "legendary-item before:absolute before:inset-0 before:bg-gradient-to-r before:from-gold/10 before:via-amber-400/20 before:to-gold/10 before:animate-legendary-pulse" 
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
        legendaryClasses,
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
      
      {/* Sparkle effect for legendary items */}
      {rarity === "legendary" && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute w-1 h-10 bg-gold/80 blur-sm top-0 left-1/4 transform -rotate-45 animate-legendary-sparkle-1"></div>
          <div className="absolute w-1 h-6 bg-amber-300/80 blur-sm bottom-8 right-1/4 transform rotate-45 animate-legendary-sparkle-2"></div>
          <div className="absolute w-8 h-1 bg-gold/80 blur-sm top-1/3 right-0 animate-legendary-sparkle-3"></div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
} 

// Add these animations to your globals.css
// @keyframes legendary-pulse {
//   0%, 100% { opacity: 0.2; }
//   50% { opacity: 0.5; }
// }
// 
// @keyframes legendary-sparkle-1 {
//   0% { transform: translateX(-100%) translateY(-100%) rotate(-45deg); }
//   100% { transform: translateX(200%) translateY(200%) rotate(-45deg); }
// }
// 
// @keyframes legendary-sparkle-2 {
//   0% { transform: translateX(200%) translateY(200%) rotate(45deg); }
//   100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
// }
// 
// @keyframes legendary-sparkle-3 {
//   0% { transform: translateX(-100%) rotate(0); }
//   100% { transform: translateX(200%) rotate(0); }
// } 