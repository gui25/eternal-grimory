"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// Define route priorities for more strategic loading
interface RouteConfig {
  path: string;
  priority: number; // 1 = highest, 3 = lowest
  dependencies?: string[]; // Routes that should be loaded together
}

export default function RoutePreloader() {
  const router = useRouter()
  const pathname = usePathname()
  const [loadedRoutes, setLoadedRoutes] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    // Define routes with priorities
    const routeConfigs: RouteConfig[] = [
      { path: '/', priority: 1 },
      { path: '/characters/players', priority: 2, dependencies: ['/characters'] },
      { path: '/characters/npcs', priority: 2, dependencies: ['/characters'] },
      { path: '/characters/monsters', priority: 3, dependencies: ['/characters'] },
      { path: '/items', priority: 1 },
      { path: '/sessions', priority: 2 },
    ]
    
    // Sort routes by priority
    const sortedRoutes = [...routeConfigs].sort((a, b) => a.priority - b.priority)
    
    // Create a queue for batch loading
    const loadRoutes = async () => {
      // First load highest priority routes
      for (const routeConfig of sortedRoutes) {
        // Skip already loaded routes
        if (loadedRoutes.has(routeConfig.path)) continue
        
        // Skip current path - we're already on it
        if (routeConfig.path === pathname) continue
        
        // Prefetch the route
        router.prefetch(routeConfig.path)
        
        // Also prefetch any dependencies
        if (routeConfig.dependencies) {
          routeConfig.dependencies.forEach(dep => {
            if (!loadedRoutes.has(dep)) {
              router.prefetch(dep)
              setLoadedRoutes(prev => new Set([...prev, dep]))
            }
          })
        }
        
        // Mark as loaded
        setLoadedRoutes(prev => new Set([...prev, routeConfig.path]))
        
        // Add a small delay between prefetches to avoid overwhelming the browser
        if (routeConfig.priority > 1) {
          await new Promise(resolve => setTimeout(resolve, 100 * routeConfig.priority))
        }
      }
    }
    
    // Load routes with a small delay after component mounts
    const timer = setTimeout(loadRoutes, 300)
    
    return () => clearTimeout(timer)
  }, [router, pathname, loadedRoutes])

  return null
}
