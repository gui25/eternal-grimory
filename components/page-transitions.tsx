"use client"

import { ReactNode, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion"
import { EnhancedLoading } from "@/components/ui/enhanced-loading"

interface PageTransitionsProps {
  children: ReactNode
  mode?: "fade" | "slide" | "scale" | "flip"
  duration?: number
  loadingDelay?: number
  disabled?: boolean
}

const transitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slide: {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 }
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 }
  },
  flip: {
    initial: { rotateY: -90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: 90, opacity: 0 }
  }
}

export function PageTransitions({ 
  children, 
  mode = "fade", 
  duration = 0.3,
  loadingDelay = 150,
  disabled = false
}: PageTransitionsProps) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // If disabled, just return children
  if (disabled) {
    return <>{children}</>
  }
  
  // Determine context based on pathname
  const getContext = (path: string) => {
    if (path.includes('/characters')) return 'characters'
    if (path.includes('/items')) return 'items'
    if (path.includes('/sessions')) return 'sessions'
    return 'general'
  }
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (!mounted) return
    
    setIsLoading(true)
    
    // Use a much shorter delay and ensure it always resolves
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, Math.min(loadingDelay, 300)) // Cap at 300ms max
    
    // Fallback to ensure loading never gets stuck
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false)
    }, 1000) // Force resolve after 1 second
    
    return () => {
      clearTimeout(timer)
      clearTimeout(fallbackTimer)
    }
  }, [pathname, loadingDelay, mounted])
  
  // Don't show anything until mounted to prevent hydration issues
  if (!mounted) {
    return <>{children}</>
  }
  
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <EnhancedLoading 
              context={getContext(pathname)}
              size="sm"
              delay={0}
            />
          </motion.div>
        ) : (
          <motion.div
            key={pathname}
            initial={transitions[mode].initial}
            animate={transitions[mode].animate}
            exit={transitions[mode].exit}
            transition={{ 
              duration,
              ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart
            }}
            className="w-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  )
} 