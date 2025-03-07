"use client"

import { useEffect } from "react"

// Tipo unificado para qualquer item que pode ser rastreado
type ViewedItem = {
  slug: string
  name: string
  type: string
  category: string
  date?: string
  rarity?: string
  timestamp?: number
  description?: string
  image?: string
}

// Tipo para os itens que são passados para o componente
type TrackViewProps = {
  item: {
    slug: string
    name: string
    type: string
    category: string
    date?: string
    rarity?: string
  }
}

export default function TrackView({ item }: TrackViewProps) {
  useEffect(() => {
    // Track this view in localStorage
    if (typeof window !== "undefined") {
      const storageKey = "recentActivity"
      const existingItems = JSON.parse(localStorage.getItem(storageKey) || "[]")

      // Add timestamp to the item
      const itemWithTimestamp: ViewedItem = {
        ...item,
        timestamp: Date.now(),
      }

      // Remove this item if it already exists
      const filteredItems = existingItems.filter(
        (i: ViewedItem) => !(i.slug === item.slug && i.category === item.category),
      )

      // Add this item to the beginning
      const updatedItems = [itemWithTimestamp, ...filteredItems].slice(0, 10) // Keep only the 10 most recent

      localStorage.setItem(storageKey, JSON.stringify(updatedItems))
    }
  }, [item])

  // This component doesn't render anything
  return null
}

