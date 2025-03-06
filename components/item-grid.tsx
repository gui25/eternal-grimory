"use client"

import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import type { ItemMeta } from "@/lib/mdx"
import { Shield, FlaskRoundIcon as Flask, Sword, Sparkles } from "lucide-react"

export default function ItemGrid({ items }: { items: ItemMeta[] }) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <Link key={item.slug} href={`/items/${item.slug}`}>
          <Card className={`h-full cursor-pointer hover:shadow-md transition-shadow ${getRarityClass(item.rarity)}`}>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">{item.name}</h3>
              <div className={`text-sm font-medium mb-2 flex items-center ${getRarityTextClass(item.rarity)}`}>
                {getTypeIcon(item.type)}
                <span>
                  {item.rarity} {item.type}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <span key={tag} className="bg-wine-dark px-2 py-1 rounded-md text-xs text-gold-light">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

