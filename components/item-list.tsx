"use client"

import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import type { ItemMeta } from "@/lib/mdx"
import { Shield, FlaskRoundIcon as Flask, Sword, Sparkles } from "lucide-react"

export default function ItemList({ items }: { items: ItemMeta[] }) {
  const getRarityClass = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "rarity-common"
      case "uncommon":
        return "rarity-uncommon"
      case "rare":
        return "rarity-rare"
      case "epic":
        return "rarity-epic"
      case "legendary":
        return "rarity-legendary"
      default:
        return "rarity-common"
    }
  }

  const getRarityBadgeClass = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "common-badge"
      case "uncommon":
        return "uncommon-badge"
      case "rare":
        return "rare-badge"
      case "epic":
        return "epic-badge"
      case "legendary":
        return "legendary-badge"
      default:
        return "common-badge"
    }
  }

  const getRarityTextClass = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "text-gray-300"
      case "uncommon":
        return "text-green-400"
      case "rare":
        return "text-blue-400"
      case "epic":
        return "text-purple-400"
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

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Link key={item.slug} href={`/items/${item.slug}`}>
          <Card className={`cursor-pointer hover:shadow-md transition-all duration-300 ${getRarityClass(item.rarity)} hover:scale-[1.01]`}>
            <CardContent className="p-4 flex justify-between items-center min-h-[90px]">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg line-clamp-1 overflow-hidden">{item.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRarityBadgeClass(item.rarity)}`}>
                    {item.rarity}
                  </span>
                </div>
                <div className={`text-sm flex items-center ${getRarityTextClass(item.rarity)} font-medium`}>
                  {getTypeIcon(item.type)}
                  <span>{item.type}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 justify-end max-w-xs overflow-hidden">
                {item.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="bg-wine-dark/80 px-2 py-1 rounded-md text-xs text-gold-light/90 whitespace-nowrap border border-gold/20">
                    {tag}
                  </span>
                ))}
                {item.tags.length > 4 && (
                  <span className="bg-wine-dark/80 px-2 py-1 rounded-md text-xs text-gold-light/90 whitespace-nowrap border border-gold/20">
                    +{item.tags.length - 4}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

