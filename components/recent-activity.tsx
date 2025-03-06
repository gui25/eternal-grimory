"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Dice1Icon as Dice, Sword, Users, Scroll } from "lucide-react"

type ActivityItem = {
  slug: string
  name: string
  type: string
  category: string
  date?: string
  rarity?: string
  timestamp: number
}

export default function RecentActivity() {
  const [recentItems, setRecentItems] = useState<ActivityItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load from localStorage
    const storedItems = localStorage.getItem("recentActivity")

    if (storedItems) {
      try {
        setRecentItems(JSON.parse(storedItems))
      } catch (e) {
        console.error("Failed to parse recent activity", e)
      }
    }

    setIsLoaded(true)
  }, [])

  // Don't render anything until we've loaded from localStorage
  if (!isLoaded || recentItems.length === 0) return null

  // Get the 5 most recent items
  const recentActivity = recentItems.slice(0, 5)

  const getCategoryIcon = (category: string) => {
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

  const getCategoryUrl = (item: ActivityItem) => {
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
  }

  const formatTimestamp = (timestamp: number) => {
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

    // Format as date
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <section>
      <div className="section-title">
        <Dice className="section-title-icon" />
        <h2 className="fantasy-subheading">Recent Activity</h2>
        <div className="text-xs text-gold-light/70 ml-2">Latest updates in your campaign</div>
      </div>
      <div className="flex flex-col gap-6">
        {recentActivity.map((item, index) => (
          <Link href={getCategoryUrl(item)} key={`${item.category}-${item.slug}-${index}`}>
            <div className="activity-item group hover:border-gold-primary transition-colors">
              {getCategoryIcon(item.category)}
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-gold group-hover:text-gold-light transition-colors">
                  {item.name}
                </h3>
                <div className="flex justify-between">
                  <p className="text-sm text-gold-light/80">
                    {item.type || item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </p>
                  <p className="text-xs text-gold-light/60">{formatTimestamp(item.timestamp)}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

