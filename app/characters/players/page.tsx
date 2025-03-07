"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select"

interface Player {
  name: string
  player?: string
  class?: string
  race?: string
  level: number
  slug: string
  tags: string[]
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("")
  const [raceFilter, setRaceFilter] = useState("")

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("/api/characters/players")
        const data = await response.json()
        setPlayers(data)
      } catch (error) {
        console.error("Erro ao buscar personagens:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      search === "" ||
      player.name.toLowerCase().includes(search.toLowerCase()) ||
      (player.player && player.player.toLowerCase().includes(search.toLowerCase()))

    const matchesClass =
      classFilter === "" || (player.class && player.class.toLowerCase() === classFilter.toLowerCase())

    const matchesRace = raceFilter === "" || (player.race && player.race.toLowerCase() === raceFilter.toLowerCase())

    return matchesSearch && matchesClass && matchesRace
  })

  const clearFilters = () => {
    setSearch("")
    setClassFilter("")
    setRaceFilter("")
  }

  const allClasses = Array.from(new Set(players.filter((p) => p.class).map((player) => player.class)))
  const allRaces = Array.from(new Set(players.filter((p) => p.race).map((player) => player.race)))

  // Converter para o formato de opções do FilterSelect
  const classOptions: FilterOption[] = allClasses.map((className) => ({
    value: className || "",
    label: className || "",
  }))

  const raceOptions: FilterOption[] = allRaces.map((race) => ({
    value: race || "",
    label: race || "",
  }))

  return (
    <div className="space-y-6">
      <h1 className="fantasy-heading">Personagens dos Jogadores</h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar personagens..."
            className="pl-8 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <FilterSelect
          options={classOptions}
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          placeholder="Todas as Classes"
          className="min-w-[180px]"
        />

        <FilterSelect
          options={raceOptions}
          value={raceFilter}
          onChange={(e) => setRaceFilter(e.target.value)}
          placeholder="Todas as Raças"
          className="min-w-[180px]"
        />

        <Button variant="outline" onClick={clearFilters}>
          Limpar Filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredPlayers.map((player) => (
          <Link key={player.slug} href={`/characters/players/${player.slug}`} className="h-full" prefetch={true}>
            <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 h-full flex flex-col">
                <h3 className="font-bold text-lg mb-1">{player.name}</h3>
                <div className="text-sm text-muted-foreground mb-2">
                  {player.race} {player.class} (Level {player.level})
                </div>
                {player.player && (
                  <div className="text-sm mb-3">
                    <span className="font-medium">Jogador:</span> {player.player}
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-auto">
                  {player.tags.map((tag) => (
                    <span key={tag} className="bg-secondary px-2 py-1 rounded-md text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

