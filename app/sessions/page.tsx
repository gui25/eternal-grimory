import { getSessions } from "@/lib/mdx"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Calendar } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default async function SessionsPage() {
  // Get all sessions from MDX files
  const sessions = await getSessions()

  return <SessionsClient initialSessions={sessions} />
}
// Client component for interactivity
;("use client")
function SessionsClient({ initialSessions }) {
  const [sessions] = useState(initialSessions)
  const [search, setSearch] = useState("")
  const [playerFilter, setPlayerFilter] = useState("")

  const filteredSessions = sessions.filter((session) => {
    // Extract title from session_number (this would be in the MDX content)
    const title = `Session ${session.session_number}`

    const matchesSearch = search === "" || title.toLowerCase().includes(search.toLowerCase())

    const matchesPlayer =
      playerFilter === "" || session.players.some((player) => player.toLowerCase() === playerFilter.toLowerCase())

    return matchesSearch && matchesPlayer
  })

  const clearFilters = () => {
    setSearch("")
    setPlayerFilter("")
  }

  const allPlayers = Array.from(new Set(sessions.flatMap((session) => session.players)))

  return (
    <div className="space-y-6">
      <h1 className="fantasy-heading">Relatórios de Sessão</h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sessões..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="border rounded-md py-2 px-3 bg-background"
          value={playerFilter}
          onChange={(e) => setPlayerFilter(e.target.value)}
        >
          <option value="">Todos os Jogadores</option>
          {allPlayers.map((player) => (
            <option key={player} value={player}>
              {player}
            </option>
          ))}
        </select>

        <Button variant="outline" onClick={clearFilters}>
          Limpar Filtros
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {filteredSessions.map((session) => (
          <Link key={session.slug} href={`/sessions/${session.slug}`}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{`Session ${session.session_number}`}</h3>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">{session.date}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {session.players.map((player) => (
                      <span key={player} className="bg-secondary px-3 py-1 rounded-full text-xs">
                        {player}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

