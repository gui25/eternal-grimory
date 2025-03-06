"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

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

  if (isLoading) {
    return <div className="text-center py-12">Carregando monstros...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="fantasy-heading">Monstros</h1>

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

        <select
          className="border rounded-md py-2 px-3 bg-background"
          value={challengeFilter}
          onChange={(e) => setChallengeFilter(e.target.value)}
        >
          <option value="">Todos os Desafios</option>
          {allChallenges.map((challenge) => (
            <option key={challenge} value={challenge}>
              {challenge}
            </option>
          ))}
        </select>

        <select
          className="border rounded-md py-2 px-3 bg-background"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        >
          <option value="">Todas as Tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        <Button variant="outline" onClick={clearFilters}>
          Limpar Filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredMonsters.map((monster) => (
          <Link key={monster.slug} href={`/characters/monsters/${monster.slug}`}>
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
    </div>
  )
}

