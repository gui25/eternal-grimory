"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type RecentItem = {
  slug: string
  name: string
  type: string
  category: string
  date?: string
  rarity?: string
}

export default function RecentlyViewed() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  const [recentSessions, setRecentSessions] = useState<RecentItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load from localStorage
    const storedItems = localStorage.getItem("recentItems")
    const storedSessions = localStorage.getItem("recentSessions")

    if (storedItems) {
      try {
        setRecentItems(JSON.parse(storedItems))
      } catch (e) {
        console.error("Failed to parse recent items", e)
      }
    }

    if (storedSessions) {
      try {
        setRecentSessions(JSON.parse(storedSessions))
      } catch (e) {
        console.error("Failed to parse recent sessions", e)
      }
    }

    setIsLoaded(true)
  }, [])

  // Don't render anything until we've loaded from localStorage
  if (!isLoaded) return null

  // If we don't have any recent items or sessions, don't render the section
  if (recentItems.length === 0 && recentSessions.length === 0) return null

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {recentItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Recent Items</CardTitle>
            <CardDescription>Recently viewed items</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentItems.slice(0, 3).map((item) => (
                <li
                  key={item.slug}
                  className="flex justify-between items-center p-2 border-b border-[hsl(var(--rpg-border))] last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className={`text-sm ${getRarityTextClass(item.rarity || "Common")}`}>
                      {item.rarity} {item.type}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/items/${item.slug}`}>View</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Recent Sessions</CardTitle>
            <CardDescription>Recently viewed sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentSessions.slice(0, 3).map((session) => (
                <li
                  key={session.slug}
                  className="flex justify-between items-center p-2 border-b border-[hsl(var(--rpg-border))] last:border-0"
                >
                  <div>
                    <p className="font-medium">{session.name}</p>
                    <p className="text-sm opacity-70">{session.date}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/sessions/${session.slug}`}>View</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper function to get the appropriate text color class for item rarity
function getRarityTextClass(rarity: string) {
  switch (rarity.toLowerCase()) {
    case "comum":
    case "common":
      return "text-gray-700 dark:text-gray-300"
    case "incomum":
    case "uncommon":
      return "text-green-600 dark:text-green-400"
    case "raro":
    case "rare":
      return "text-blue-600 dark:text-blue-400"
    case "épico":
    case "epic":
      return "text-purple-600 dark:text-purple-400"
    case "lendário":
    case "legendary":
      return "text-amber-600 dark:text-amber-400"
    default:
      return "text-gray-700 dark:text-gray-300"
  }
}

