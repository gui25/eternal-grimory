"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, Edit } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { FilterSelect, type FilterOption } from "@/components/ui/filter-select"
import { PageContainer } from "@/components/ui/page-container"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AdminSection, AdminButton } from "@/components/ui/admin-button"
import { isAdminMode } from "@/lib/dev-utils"

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
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    setShowAdmin(isAdminMode())
    
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

    const matchesTag = tagFilter === "" || npc.tags.some((tag: string) => tag.toLowerCase() === tagFilter.toLowerCase())

    return matchesSearch && matchesAffiliation && matchesTag
  })

  const clearFilters = () => {
    setSearch("")
    setAffiliationFilter("")
    setTagFilter("")
  }

  const allAffiliations = Array.from(new Set(npcs.map((npc) => npc.affiliation)))
  const allTags = Array.from(new Set(npcs.flatMap((npc) => npc.tags)))

  const affiliationOptions: FilterOption[] = allAffiliations.map((affiliation) => ({
    value: affiliation,
    label: affiliation,
  }))

  const tagOptions: FilterOption[] = allTags.map((tag) => ({
    value: tag,
    label: tag,
  }))

  return (
    <PageContainer>
      <h1 className="fantasy-heading">NPCs</h1>

      <AdminSection>
        <AdminButton href="/admin/create/npc">
          <Plus className="h-4 w-4 mr-2" />
          Criar NPC
        </AdminButton>
      </AdminSection>

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

        <FilterSelect
          options={affiliationOptions}
          value={affiliationFilter}
          onChange={(e) => setAffiliationFilter(e.target.value)}
          placeholder="Todas as Afiliações"
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
        <LoadingSpinner message="Carregando NPCs..." />
      ) : filteredNPCs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredNPCs.map((npc) => (
            <Card key={npc.slug} className="relative group">
              <CardContent className="p-6">
                {showAdmin && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link href={`/admin/edit/npc/${npc.slug}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
                
                <Link href={`/characters/npcs/${npc.slug}`} prefetch={true} className="block">
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
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gold-light text-lg">Nenhum NPC corresponde aos seus filtros.</p>
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
