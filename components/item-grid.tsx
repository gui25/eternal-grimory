"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { ItemMeta } from "@/lib/mdx"
import { Shield, FlaskRoundIcon as Flask, Sword, Sparkles, Edit } from "lucide-react"
import RunicGlow from "./effects/runic-glow"
import RarityBorder from "./effects/rarity-border"
import MagicReveal from "./effects/magic-reveal"
import { AdminButton } from "./ui/admin-button"
import { isAdminMode } from "@/lib/dev-utils"
import { useState, useEffect } from "react"

export default function ItemGrid({ items }: { items: ItemMeta[] }) {
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    setShowAdmin(isAdminMode())
  }, [])

  const getRarityTextClass = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "comum":
      case "common":
        return "text-gray-300"
      case "incomum":
      case "uncommon":
        return "text-green-400"
      case "raro":
      case "rare":
        return "text-blue-400"
      case "épico":
      case "epic":
        return "text-purple-400"
      case "lendário":
      case "legendary":
        return "text-amber-400"
      default:
        return "text-gray-300"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "weapon":
        return <Sword className="h-4 w-4 mr-1" />
      case "armor":
        return <Shield className="h-4 w-4 mr-1" />
      case "potion":
        return <Flask className="h-4 w-4 mr-1" />
      case "artifact":
        return <Sparkles className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }
  
  // Map rarity string to component prop type
  const getRarityType = (rarity: string): "common" | "uncommon" | "rare" | "epic" | "legendary" => {
    const normalized = rarity.toLowerCase();
    if (["common", "uncommon", "rare", "epic", "legendary"].includes(normalized)) {
      return normalized as "common" | "uncommon" | "rare" | "epic" | "legendary";
    }
    return "common";
  }
  
  // Configure runic glow based on item type
  const getRunicConfig = (type: string, rarity: string) => {
    // More magical items get more intense runes
    const isMagical = ["artifact", "magic item", "wand", "staff", "scroll"].includes(type.toLowerCase());
    const isLegendary = rarity.toLowerCase() === "legendary";
    
    return {
      color: isLegendary ? "gold" : (
        type.toLowerCase() === "potion" ? "purple" : 
        type.toLowerCase() === "scroll" ? "blue" : "gold"
      ) as "gold" | "blue" | "green" | "purple" | "red",
      intensity: isLegendary ? "strong" : (isMagical ? "medium" : "subtle") as "subtle" | "medium" | "strong",
      runeCount: isLegendary ? 8 : (isMagical ? 6 : 4)
    };
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <MagicReveal 
          key={item.slug} 
          delay={index * 0.05} 
          type="materialize"
        >
          <div className="relative group h-full">
            {showAdmin && (
              <div className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <AdminButton
                  href={`/admin/edit/item/${item.slug}`}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </AdminButton>
              </div>
            )}
            
            <Link href={`/items/${item.slug}`} className="block h-full">
              <RarityBorder 
                rarity={getRarityType(item.rarity)}
                pulseIntensity={item.rarity.toLowerCase() === "legendary" ? "strong" : "medium"}
              >
                <RunicGlow
                  {...getRunicConfig(item.type, item.rarity)}
                  className="h-full"
                >
                  <Card className="h-full bg-wine-darker/80 border-0 shadow-none">
                    <CardContent className="p-6 min-h-[164px] flex flex-col">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.name}</h3>
                      <div className={`text-sm font-medium mb-2 flex items-center ${getRarityTextClass(item.rarity)}`}>
                        {getTypeIcon(item.type)}
                        <span>
                          {item.rarity} {item.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-auto">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="bg-wine-dark px-2 py-1 rounded-md text-xs text-gold-light whitespace-nowrap mb-1">
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="bg-wine-dark px-2 py-1 rounded-md text-xs text-gold-light whitespace-nowrap mb-1">
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </RunicGlow>
              </RarityBorder>
            </Link>
          </div>
        </MagicReveal>
      ))}
    </div>
  )
}

