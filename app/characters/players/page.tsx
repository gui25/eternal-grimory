"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, Edit, User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select"
import { PageContainer } from "@/components/ui/page-container"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AdminSection, AdminButton } from "@/components/ui/admin-button"
import { Badge } from "@/components/ui/badge"
import { isAdminMode } from "@/lib/dev-utils"

interface Player {
  name: string
  player?: string
  class?: string
  race?: string
  level: number
  slug: string
  tags: string[]
  image?: string
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("")
  const [raceFilter, setRaceFilter] = useState("")
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    setShowAdmin(isAdminMode())
    
    const fetchPlayers = async () => {
      try {
        const response = await fetch("/api/characters/players")
        const result = await response.json()
        setPlayers(result)
      } catch (error) {
        console.error("Erro ao buscar jogadores:", error)
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
      (player.player && player.player.toLowerCase().includes(search.toLowerCase())) ||
      (player.class && player.class.toLowerCase().includes(search.toLowerCase()))

    const matchesClass = classFilter === "" || (player.class && player.class.toLowerCase() === classFilter.toLowerCase())
    const matchesRace = raceFilter === "" || (player.race && player.race.toLowerCase() === raceFilter.toLowerCase())

    return matchesSearch && matchesClass && matchesRace
  })

  const clearFilters = () => {
    setSearch("")
    setClassFilter("")
    setRaceFilter("")
  }

  const allClasses = Array.from(new Set(players.map((player) => player.class).filter(Boolean)))
  const allRaces = Array.from(new Set(players.map((player) => player.race).filter(Boolean)))

  const classOptions: FilterOption[] = allClasses.map((playerClass) => ({
    value: playerClass!,
    label: playerClass!,
  }))

  const raceOptions: FilterOption[] = allRaces.map((race) => ({
    value: race!,
    label: race!,
  }))

  return (
    <PageContainer>
      <h1 className="fantasy-heading">Personagens dos Jogadores</h1>

      <AdminSection>
        <AdminButton href="/admin/create/player">
          <Plus className="h-4 w-4 mr-2" />
          Criar Personagem
        </AdminButton>
      </AdminSection>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar personagens..."
            className="pl-8"
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

      {isLoading ? (
        <LoadingSpinner message="Carregando personagens..." />
      ) : filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <Card key={player.slug} className="relative group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105">
              <CardContent className="p-0">
                {showAdmin && (
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link href={`/admin/edit/player/${player.slug}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
                
                <Link href={`/characters/players/${player.slug}`} prefetch={true} className="block">
                  {/* Image/Icon Section */}
                  <div className="aspect-video relative overflow-hidden rounded-t-lg bg-background border-b border-gold-dark">
                    {player.image ? (
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-wine-darker/50">
                        <User className="h-12 w-12 text-gold/50" />
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4 space-y-3">
                    <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-gold-light transition-colors">
                      {player.name}
                    </h3>
                    
                    <div className="space-y-1 text-sm">
                      {player.player && (
                        <p className="text-xs text-muted-foreground">Jogado por: {player.player}</p>
                      )}
                      
                      <div className="text-xs">
                        <span className="text-gold font-medium">Nível {player.level}</span>
                        {player.race && player.class && (
                          <span className="text-muted-foreground"> • {player.race} {player.class}</span>
                        )}
                      </div>
                    </div>
                    
                    {player.tags && player.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {player.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {player.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{player.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gold-light text-lg">Nenhum personagem corresponde aos seus filtros.</p>
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

