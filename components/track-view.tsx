"use client"

import { useEffect, useCallback } from "react"
import { getCurrentCampaignId } from "@/lib/campaign-config"

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
  campaignId?: string
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

// Throttle function to limit execution frequency
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

export default function TrackView({ item }: TrackViewProps) {
  // Memoize the track function to avoid recreating it on every render
  const trackItem = useCallback(
    throttle((itemToTrack: TrackViewProps['item']) => {
      if (typeof window === "undefined") return;
      
      const storageKey = "recentActivity"
      try {
        const existingItems = JSON.parse(localStorage.getItem(storageKey) || "[]")
  
        // Get current campaign
        const currentCampaignId = getCurrentCampaignId();
        
        // Add timestamp and campaign ID to the item
        const itemWithTimestamp: ViewedItem = {
          ...itemToTrack,
          timestamp: Date.now(),
          campaignId: currentCampaignId
        }
  
        // Check if this item already exists in the same campaign (avoid duplicating)
        const existingItemIndex = existingItems.findIndex(
          (i: ViewedItem) => i.slug === itemToTrack.slug && 
                            i.category === itemToTrack.category && 
                            i.campaignId === currentCampaignId
        )
  
        let updatedItems;
        
        if (existingItemIndex >= 0) {
          // If the item exists, just update its timestamp
          const newItems = [...existingItems];
          newItems[existingItemIndex] = itemWithTimestamp;
          updatedItems = newItems;
        } else {
          // If the item doesn't exist, add it to the beginning
          updatedItems = [itemWithTimestamp, ...existingItems];
        }
        
        // Keep only the 20 most recent (increased from 10 to accommodate multiple campaigns)
        localStorage.setItem(storageKey, JSON.stringify(updatedItems.slice(0, 20)))
      } catch (err) {
        console.error("Error tracking view:", err)
      }
    }, 1000), // Throttle to once per second
    []
  )

  useEffect(() => {
    trackItem(item)
  }, [item, trackItem])

  // This component doesn't render anything
  return null
}

