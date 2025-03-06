import { getCharacters } from "@/lib/mdx"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default async function PlayersPage() {
  // Get all player characters from MD files
  const players = await getCharacters("player")

  return <PlayersClient initialPlayers={players} />
}
// Client component for interactivity
;("use client")
function PlayersClient({ initialPlayers }) {
  const [players] = useState(initialPlayers)
  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("")
  const [raceFilter, setRaceFilter] = useState("")

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

        <select
          className="border rounded-md py-2 px-3 bg-background"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="">Todas as Classes</option>
          {allClasses.map((className) => (
            <option key={className} value={className}>
              {className}
            </option>
          ))}
        </select>

        <select
          className="border rounded-md py-2 px-3 bg-background"
          value={raceFilter}
          onChange={(e) => setRaceFilter(e.target.value)}
        >
          <option value="">Todas as Raças</option>
          {allRaces.map((race) => (
            <option key={race} value={race}>
              {race}
            </option>
          ))}
        </select>

        <Button variant="outline" onClick={clearFilters}>
          Limpar Filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredPlayers.map((player) => (
          <Link key={player.slug} href={`/characters/players/${player.slug}`} className="h-full">
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

