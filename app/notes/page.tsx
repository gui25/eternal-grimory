"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Calendar, Filter, Plus, Edit, FileText } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { PageContainer } from "@/components/ui/page-container"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AdminSection, AdminButton } from "@/components/ui/admin-button"
import { isAdminMode } from "@/lib/dev-utils"
import { formatDateBR, formatDateForMDX, parseBRDate } from "@/utils/date-utils"
import { Badge } from "@/components/ui/badge"

interface Note {
  slug: string;
  name: string;
  date?: string;
  description: string;
  tags: string[];
  image?: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tagFilter, setTagFilter] = useState("")
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    setShowAdmin(isAdminMode())
    
    const fetchNotes = async () => {
      try {
        const response = await fetch("/api/notes")
        const data = await response.json()
        setNotes(data)
      } catch (error) {
        console.error("Erro ao buscar anotações:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchNotes()
  }, [])
  
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = search === "" || 
      note.name.toLowerCase().includes(search.toLowerCase()) ||
      note.description.toLowerCase().includes(search.toLowerCase())

    const matchesTag = tagFilter === "" || 
      note.tags.some((tag: string) => tag.toLowerCase() === tagFilter.toLowerCase())

    return matchesSearch && matchesTag
  })

  const allTags = Array.from(new Set(notes.flatMap((note: Note) => note.tags)))

  const clearFilters = () => {
    setSearch("")
    setTagFilter("")
  }

  const handleEditClick = (e: React.MouseEvent, noteSlug: string) => {
    e.preventDefault()
    e.stopPropagation()
    window.location.href = `/admin/edit/note/${noteSlug}`
  }

  return (
    <PageContainer>
      <h1 className="fantasy-heading">Anotações da Campanha</h1>

      <AdminSection>
        <AdminButton href="/admin/create/note">
          <Plus className="h-4 w-4 mr-2" />
          Criar Anotação
        </AdminButton>
      </AdminSection>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar anotações..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative">
          <select
            className="border border-gold-dark rounded-md py-2 px-3 bg-wine-darker text-gold-light appearance-none pr-8 w-full"
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
          <Filter className="absolute right-2 top-2.5 h-4 w-4 text-gold-light pointer-events-none" />
        </div>

        <Button variant="outline" onClick={clearFilters}>
          Limpar Filtros
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Carregando anotações..." />
      ) : filteredNotes.length > 0 ? (
        <div className="flex flex-col gap-6">
          {filteredNotes.map((note) => (
            <div key={note.slug} className="relative group">
              <Link href={`/notes/${note.slug}`}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="h-5 w-5 text-gold-light mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-gold mb-1">{note.name}</h2>
                          <p className="text-sm text-muted-foreground mb-2">{note.description}</p>
                          {note.date && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                              <Calendar className="h-3 w-3" />
                              {parseBRDate(note.date) ? formatDateForMDX(parseBRDate(note.date)!) : note.date}
                            </div>
                          )}
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {note.tags.slice(0, 5).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {note.tags.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{note.tags.length - 5}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        {showAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 ml-2"
                            onClick={(e) => handleEditClick(e, note.slug)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gold/50 mx-auto mb-4" />
          <p className="text-gold-light text-lg mb-2">Nenhuma anotação corresponde aos seus filtros.</p>
          <p className="text-gold-light/70 mb-6">
            Comece criando sua primeira anotação para registrar informações importantes da campanha.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-gold-dark text-gold-light hover:bg-wine-dark hover:text-gold"
            >
              Limpar Filtros
            </Button>
            {showAdmin && (
              <AdminButton href="/admin/create/note">
                <Plus className="h-4 w-4 mr-2" />
                Criar Anotação
              </AdminButton>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  )
} 