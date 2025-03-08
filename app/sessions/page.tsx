"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Calendar, Filter } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { PageContainer } from "@/components/ui/page-container"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Session {
  session_number: number;
  players: string[];
  slug: string;
  date: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [playerFilter, setPlayerFilter] = useState("")

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/sessions")
        const data = await response.json()
        setSessions(data)
      } catch (error) {
        console.error("Erro ao buscar sessões:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSessions()
  }, [])
  
  const filteredSessions = sessions.filter((session) => {
    // Extract title from session_number (this would be in the MDX content)
    const title = `Session ${session.session_number}`

    const matchesSearch = search === "" || title.toLowerCase().includes(search.toLowerCase())

    const matchesPlayer =
      playerFilter === "" || session.players.some((player: string) => player.toLowerCase() === playerFilter.toLowerCase())

    return matchesSearch && matchesPlayer
  })

  const allPlayers = Array.from(new Set(sessions.flatMap((session: Session) => session.players)))

  const clearFilters = () => {
    setSearch("")
    setPlayerFilter("")
  }

  return (
    <PageContainer>
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

        <div className="relative">
          <select
            className="border border-gold-dark rounded-md py-2 px-3 bg-wine-darker text-gold-light appearance-none pr-8 w-full"
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
          <Filter className="absolute right-2 top-2.5 h-4 w-4 text-gold-light pointer-events-none" />
        </ div>

        <Button variant="outline" onClick={clearFilters}>
          Limpar Filtros
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Carregando sessões..." />
      ) : filteredSessions.length > 0 ? (
        <div className="flex flex-col gap-6">
          {filteredSessions.map((session) => (
            <Link key={session.slug} href={`/sessions/${session.slug}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">Session {session.session_number}</h2>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {session.date}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {session.players.map((player: string) => (
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
      ) : (
        <div className="text-center py-12">
          <p className="text-gold-light text-lg">Nenhuma sessão corresponde aos seus filtros.</p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="mt-4 border-gold-dark text-gold-light hover:bg-wine-dark hover:text-gold"
          >
            Limpar Filtros
          </Button>
        </div>
      )}
    </PageContainer>
  )
}

