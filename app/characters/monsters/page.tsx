"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, Edit, Shield } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select"
import { PageContainer } from "@/components/ui/page-container"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AdminSection, AdminButton } from "@/components/ui/admin-button"
import { Badge } from "@/components/ui/badge"
import { isAdminMode } from "@/lib/dev-utils"

interface Monster {
  name: string;
  type: string;
  challenge: string;
  tags: string[];
  slug: string;
  image?: string;
}

export default function MonstersPage() {
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [challengeFilter, setChallengeFilter] = useState("")
  const [tagFilter, setTagFilter] = useState("")
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    setShowAdmin(isAdminMode())
    
    const fetchMonsters = async () => {
      try {
        const response = await fetch("/api/characters/monsters")
        const result = await response.json()
        setMonsters(result)
      } catch (error) {
        console.error("Erro ao buscar monstros:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMonsters()
  }, [])
  
  const filteredMonsters = monsters.filter((monster) => {
    const matchesSearch =
      search === "" ||
      monster.name.toLowerCase().includes(search.toLowerCase()) ||
      monster.type.toLowerCase().includes(search.toLowerCase())

    const matchesChallenge = challengeFilter === "" || monster.challenge.toLowerCase() === challengeFilter.toLowerCase()

    const matchesTag = tagFilter === "" || monster.tags.some((tag: string) => tag.toLowerCase() === tagFilter.toLowerCase())

    return matchesSearch && matchesChallenge && matchesTag
  })

  const clearFilters = () => {
    setSearch("")
    setChallengeFilter("")
    setTagFilter("")
  }

  const allChallenges = Array.from(new Set(monsters.map((monster) => monster.challenge)))
  const allTags = Array.from(new Set(monsters.flatMap((monster) => monster.tags)))

  const challengeOptions: FilterOption[] = allChallenges.map((challenge) => ({
    value: challenge,
    label: challenge,
  }))

  const tagOptions: FilterOption[] = allTags.map((tag) => ({
    value: tag,
    label: tag,
  }))

  return (
    <PageContainer>
      <h1 className="fantasy-heading">Monstros</h1>

      <AdminSection>
        <AdminButton href="/admin/create/monster">
          <Plus className="h-4 w-4 mr-2" />
          Criar Monstro
        </AdminButton>
      </AdminSection>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar monstros..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <FilterSelect
          options={challengeOptions}
          value={challengeFilter}
          onChange={(e) => setChallengeFilter(e.target.value)}
          placeholder="Todos os Desafios"
          className="min-w-[180px]"
        />

        <FilterSelect
          options={tagOptions}
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          placeholder="Todas as Tags"
          className="min-w-[180px]"
        />

        <Button variant="outline" onClick={clearFilters}>
          Limpar Filtros
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Carregando monstros..." />
      ) : filteredMonsters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMonsters.map((monster) => (
            <Card key={monster.slug} className="relative group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105">
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
                      <Link href={`/admin/edit/monster/${monster.slug}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
                
                <Link href={`/characters/monsters/${monster.slug}`} prefetch={true} className="block">
                  {/* Image/Icon Section */}
                  <div className="aspect-video relative overflow-hidden rounded-t-lg bg-background border-b border-gold-dark">
                    {monster.image ? (
                      <img
                        src={monster.image}
                        alt={monster.name}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-wine-darker/50">
                        <Shield className="h-12 w-12 text-gold/50" />
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4 space-y-3">
                    <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-gold-light transition-colors">
                      {monster.name}
                    </h3>
                    
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">{monster.type}</p>
                      
                      <p className="text-xs">
                        <span className="text-gold font-medium">Desafio:</span> {monster.challenge}
                      </p>
                    </div>
                    
                    {monster.tags && monster.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {monster.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {monster.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{monster.tags.length - 3}
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
          <p className="text-gold-light text-lg">Nenhum monstro corresponde aos seus filtros.</p>
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

