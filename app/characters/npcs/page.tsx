"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import LoadingSpinner from "@/components/loading-spinner"

interface NPC {
  name: string
  type: string
  affiliation: string
  tags: string[]
  slug: string
}

export default function NPCsPage() {
  const [npcs, setNPCs] = useState<NPC[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [affiliationFilter, setAffiliationFilter] = useState("")
  const [tagFilter, setTagFilter] = useState("")

  useEffect(() => {
    const fetchNPCs = async () => {
      try {
        const response = await fetch("/api/characters/npcs")
        const data = await response.json()
        setNPCs(data)
      } catch (error) {
        console.error("Erro ao buscar NPCs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNPCs()
  }, [])

  const filteredNPCs = npcs.filter((npc) => {
    const matchesSearch =
      search === "" ||
      npc.name.toLowerCase().includes(search.toLowerCase()) ||
      npc.type.toLowerCase().includes(search.toLowerCase())

    const matchesAffiliation =
      affiliationFilter === "" || npc.affiliation.toLowerCase() === affiliationFilter.toLowerCase()

    const matchesTag = tagFilter === "" || npc.tags.some((tag) => tag.toLowerCase() === tagFilter.toLowerCase())

    return matchesSearch && matchesAffiliation && matchesTag
  })

  const clearFilters = () => {
    setSearch("")
    setAffiliationFilter("")
    setTagFilter("")
  }

  const allAffiliations = Array.from(new Set(npcs.map((npc) => npc.affiliation)))
  const allTags = Array.from(new Set(npcs.flatMap((npc) => npc.tags)))

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <h1 className="fantasy-heading">NPCs</h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar NPCs..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="border rounded-md py-2 px-3 bg-background"
          value={affiliationFilter}
          onChange={(e) => setAffiliationFilter(e.target.value)}
        >
          <option value="">Todas as Afiliações</option>
          {allAffiliations.map((affiliation) => (
            <option key={affiliation} value={affiliation}>
              {affiliation}
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
        {filteredNPCs.map((npc) => (
          <Link key={npc.slug} href={`/characters/npcs/${npc.slug}`}>
            <Card>
              <CardContent className="pt-4">
                <h3 className="text-lg font-bold">{npc.name}</h3>
                <p className="text-sm text-gray-500">{npc.type}</p>
                <div className="mt-2">
                  <span className="font-medium">Afiliação:</span> {npc.affiliation}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {npc.tags.map((tag) => (
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

