"use client"

import { useState, useEffect, type ReactNode } from "react"
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const slideVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      type: "spring", 
      damping: 25, 
      stiffness: 200
    }
  },
  exit: { 
    opacity: 0, 
    x: -10,
    transition: { duration: 0.2 } 
  },
}

interface PageTransitionProps {
  children: ReactNode;
  mode?: "fade" | "slide";
  duration?: number;
}

export default function PageTransition({ 
  children, 
  mode = "fade", 
  duration = 0.25 
}: PageTransitionProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  // Only apply transitions after initial mount to avoid hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <>{children}</>
  
  // Use LazyMotion to dynamically load animations only when needed
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        <m.div
          key={pathname}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={mode === "fade" ? fadeVariants : slideVariants}
          transition={{ duration: mode === "fade" ? duration : undefined }}
          className="w-full"
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  )
}

