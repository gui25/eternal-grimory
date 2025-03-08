"use client"

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type RunePosition = {
  top: string;
  left: string;
  rotate: string;
  delay: string;
  size: string;
}

const RUNE_SYMBOLS = [
  '᛫', '᛬', 'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 
  'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ',
  'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ', 'ᚦ', 'ᚱ', 'ᚺ', 'ᛒ'
];

interface RunicGlowProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  color?: 'gold' | 'blue' | 'green' | 'purple' | 'red';
  runeCount?: number;
  children: React.ReactNode;
}

export default function RunicGlow({
  className,
  intensity = 'subtle',
  color = 'gold',
  runeCount = 6,
  children
}: RunicGlowProps) {
  const [runePositions, setRunePositions] = useState<RunePosition[]>([]);
  const [runes, setRunes] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Generate random positions for runes
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Select random rune symbols
    const selectedRunes = Array(runeCount).fill(0).map(() => 
      RUNE_SYMBOLS[Math.floor(Math.random() * RUNE_SYMBOLS.length)]
    );
    setRunes(selectedRunes);
    
    // Generate positions around the container
    const positions: RunePosition[] = [];
    for (let i = 0; i < runeCount; i++) {
      const position: RunePosition = {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        rotate: `${Math.random() * 360}deg`,
        delay: `${Math.random() * 3}s`,
        size: `${0.8 + Math.random() * 0.5}rem`
      };
      positions.push(position);
    }
    setRunePositions(positions);
  }, [runeCount]);

  // Map intensity to opacity and animation duration
  const intensityConfig = {
    subtle: { opacity: '0.4', duration: '4s' },
    medium: { opacity: '0.6', duration: '3s' },
    strong: { opacity: '0.8', duration: '2s' }
  };
  
  // Map color to CSS
  const colorMap = {
    gold: 'text-gold',
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    red: 'text-red-400'
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative group", className)}
    >
      {children}
      
      {/* Runes that appear on hover */}
      {runePositions.map((position, index) => (
        <div 
          key={index}
          className={cn(
            "absolute opacity-0 pointer-events-none font-runes transition-opacity",
            colorMap[color],
            "group-hover:animate-pulse",
          )}
          style={{
            top: position.top,
            left: position.left,
            transform: `rotate(${position.rotate})`,
            fontSize: position.size,
            animationDelay: position.delay,
            animationDuration: intensityConfig[intensity].duration,
            opacity: 0,
          }}
        >
          <span 
            className="group-hover:opacity-100 transition-opacity duration-500"
            style={{ opacity: intensityConfig[intensity].opacity }}
          >
            {runes[index]}
          </span>
        </div>
      ))}
    </div>
  );
} 