"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RoutePreloader() {
  const router = useRouter()
  
  useEffect(() => {
    const routes = [
      '/',
      '/characters/players',
      '/characters/npcs',
      '/characters/monsters',
      '/items',
      '/sessions',
    ]
    
    routes.forEach(route => {
      router.prefetch(route)
    })
  }, [router])

  return null
}
