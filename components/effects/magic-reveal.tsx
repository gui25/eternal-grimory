"use client"

import { useRef, useEffect } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

interface MagicRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  type?: "fade" | "reveal" | "materialize" | "scroll"
}

export default function MagicReveal({
  children,
  className,
  delay = 0,
  duration = 0.5,
  type = "materialize"
}: MagicRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  // Different animation variants
  const variants = {
    fade: {
      hidden: { opacity: 0, scale: 0.96 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { 
          duration, 
          delay,
          ease: [0.22, 1, 0.36, 1]
        }
      }
    },
    reveal: {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration, 
          delay,
          ease: [0.22, 1, 0.36, 1]
        }
      }
    },
    materialize: {
      hidden: { 
        opacity: 0, 
        scale: 0.7,
        filter: "blur(10px)",
        y: 10
      },
      visible: { 
        opacity: 1, 
        scale: 1,
        filter: "blur(0px)",
        y: 0,
        transition: { 
          duration, 
          delay,
          scale: {
            type: "spring",
            damping: 15,
            stiffness: 300,
          },
          opacity: { duration },
          filter: { duration: duration * 1.2 },
        }
      }
    },
    scroll: {
      hidden: { 
        opacity: 0, 
        y: 50,
        rotateX: 10,
      },
      visible: { 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        transition: { 
          duration, 
          delay,
          type: "spring",
          stiffness: 100,
          damping: 20
        }
      }
    }
  }

  // Particles animation for materialize effect
  const particleVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: delay
      }
    }
  }

  const particleItem = {
    hidden: { 
      opacity: 0,
      y: Math.random() * 20 - 10,
      x: Math.random() * 20 - 10,
      scale: 0
    },
    visible: {
      opacity: [0, 1, 0],
      y: [0, -20 - Math.random() * 30],
      x: [0, (Math.random() - 0.5) * 30],
      scale: [0, 0.5 + Math.random() * 0.5, 0],
      transition: {
        duration: 1 + Math.random(),
        ease: "easeOut"
      }
    }
  }

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        variants={variants[type]}
        initial="hidden"
        animate={controls}
        exit="hidden"
        className="w-full h-full"
      >
        {children}
      </motion.div>

      {/* Magical particles that appear when the item materializes */}
      {type === "materialize" && isInView && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          variants={particleVariants}
          initial="hidden"
          animate="visible"
        >
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold/50"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`
              }}
              variants={particleItem}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
} 