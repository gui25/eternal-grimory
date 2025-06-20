"use client"

import { useEffect, useState, useMemo, memo } from "react"
import Link from "next/link"
import { Dice1Icon as Dice, Sword, Users, Scroll } from "lucide-react"
import { getCurrentCampaignId } from "@/lib/campaign-config"

type ActivityItem = {
  slug: string
  name: string
  type: string
  category: string
  date?: string
  rarity?: string
  timestamp: number
  campaignId?: string
}

// Memoized activity item component to prevent unnecessary re-renders
const ActivityItemComponent = memo(function ActivityItemComponent({ 
  item, 
  icon, 
  formattedTime 
}: { 
  item: ActivityItem, 
  icon: React.ReactNode, 
  formattedTime: string 
}) {
  const url = useMemo(() => {
    switch (item.category) {
      case "item":
        return `/items/${item.slug}`
      case "session":
        return `/sessions/${item.slug}`
      case "player":
        return `/characters/players/${item.slug}`
      case "npc":
        return `/characters/npcs/${item.slug}`
      case "monster":
        return `/characters/monsters/${item.slug}`
      default:
        return "/"
    }
  }, [item.category, item.slug])

  return (
    <Link href={url} prefetch={false}>
      <div className="activity-item group hover:border-gold-primary transition-colors">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-gold group-hover:text-gold-light transition-colors truncate">
            {item.name}
          </h3>
          <div className="flex justify-between items-center gap-2">
            <p className="text-sm text-gold-light/80 truncate min-w-0">
              {item.type || item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </p>
            <p className="text-xs text-gold-light/60 whitespace-nowrap flex-shrink-0">
              {formattedTime}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
})

export default function RecentActivity() {
  const [recentItems, setRecentItems] = useState<ActivityItem[]>([])
  const [currentCampaign, setCurrentCampaign] = useState<string>("")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Only run once on client-side
    if (typeof window === 'undefined') return;
    
    // Get current campaign ID
    const campaignId = getCurrentCampaignId();
    setCurrentCampaign(campaignId);
    
    try {
      const storedItems = localStorage.getItem("recentActivity")
      if (storedItems) {
        setRecentItems(JSON.parse(storedItems))
      }
    } catch (e) {
      console.error("Failed to parse recent activity", e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Filter items by current campaign and sort by timestamp
  const filteredAndSortedActivity = useMemo(() => {
    return [...recentItems]
      .filter(item => {
        // If no campaignId in item (old data), don't show
        if (!item.campaignId) return false;
        
        // Only show items from current campaign
        return item.campaignId === currentCampaign;
      })
      .sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp in descending order
      .slice(0, 5); // Take only the 5 most recent items
  }, [recentItems, currentCampaign]);

  // If we haven't loaded yet or there are no items for current campaign, don't render
  if (!isLoaded || filteredAndSortedActivity.length === 0) return null

  return (
    <section>
      <div className="section-title">
        <h2 className="fantasy-subheading"><Dice className="section-title-icon" />Atividade Recente</h2>
        <div className="text-xs text-gold-light/70 ml-2">Encontre seus últimos acessos por aqui</div>
      </div>
      <div className="flex flex-col gap-6">
        {filteredAndSortedActivity.map((item, index) => (
          <ActivityItemComponent 
            key={`${item.category}-${item.slug}-${index}`}
            item={item}
            icon={getCategoryIcon(item.category)}
            formattedTime={formatTimestamp(item.timestamp)}
          />
        ))}
      </div>
    </section>
  )
}

// Helper functions moved outside the component for better performance
function getCategoryIcon(category: string) {
  switch (category) {
    case "item":
      return <Sword className="activity-icon" />
    case "session":
      return <Scroll className="activity-icon" />
    case "player":
    case "npc":
    case "monster":
      return <Users className="activity-icon" />
    default:
      return <Dice className="activity-icon" />
  }
}

function formatTimestamp(timestamp: number) {
  const now = Date.now()
  const diff = now - timestamp

  // Less than a minute
  if (diff < 60 * 1000) {
    return "Agora mesmo"
  }

  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes} minuto${minutes !== 1 ? "s" : ""} atrás`
  }

  // Less than a day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours} hora${hours !== 1 ? "s" : ""} atrás`
  }

  // Less than a week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days} dia${days !== 1 ? "s" : ""} atrás`
  }

  // Format as Brazilian date
  return new Date(timestamp).toLocaleDateString('pt-BR')
}

