import { User2 } from "lucide-react"
import { cn, truncateWithEllipsis } from "@/lib/utils"

interface CharacterCardProps {
  name: string
  level: number
  race: string
  class: string
  player: string
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary"
}

export function CharacterCard({
  name,
  level,
  race,
  class: characterClass,
  player,
  rarity = "common",
}: CharacterCardProps) {
  return (
    <div className={cn("character-card", `rarity-${rarity}`, "animate-fadeIn")}>
      <div className="character-card-header">
        <div className="character-avatar">
          <User2 className="w-full h-full p-2 text-card-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-heading font-bold">{truncateWithEllipsis(name, 18)}</h3>
          <p className="text-sm text-muted-foreground">
            Level {level} {race} {characterClass}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="stat-label">Player</span>
          <span className="stat-value">{player}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="stat-label">Level</span>
          <span className="stat-value magical-glow">{level}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="stat-label">Class</span>
          <span className="stat-value">{characterClass}</span>
        </div>
      </div>
    </div>
  )
}

