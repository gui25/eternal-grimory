"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select"
import { PageContainer } from "@/components/ui/page-container"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AdminSection, AdminButton } from "@/components/ui/admin-button"

interface Monster {
  name: string;
  type: string;
  challenge: string;
  tags: string[];
  slug: string;
}

export default function MonstersPage() {
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [challengeFilter, setChallengeFilter] = useState("")
  const [tagFilter, setTagFilter] = useState("")

  useEffect(() => {
    const fetchMonsters = async () => {
      try {
        const response = await fetch("/api/characters/monsters")
        const data = await response.json()
        setMonsters(data)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredMonsters.map((monster) => (
            <Link key={monster.slug} href={`/characters/monsters/${monster.slug}`} prefetch={true}>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-1">{monster.name}</h3>
                  <div className="text-sm text-muted-foreground mb-2">{monster.type}</div>
                  <div className="text-sm mb-3">
                    <span className="font-medium">Desafio:</span> {monster.challenge}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {monster.tags.map((tag) => (
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

