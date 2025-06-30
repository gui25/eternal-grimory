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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredNotes.map((note) => (
            <Card key={note.slug} className="relative group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105">
              <CardContent className="p-0">
                {showAdmin && (
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={(e) => handleEditClick(e, note.slug)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <Link href={`/notes/${note.slug}`} className="block">
                  {/* Image/Icon Section */}
                  <div className="aspect-video relative overflow-hidden rounded-t-lg bg-background border-b border-gold-dark">
                    {note.image ? (
                      <img
                        src={note.image}
                        alt={note.name}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-wine-darker/50">
                        <FileText className="h-12 w-12 text-gold/50" />
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-gold-light transition-colors">
                        {note.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {note.description}
                      </p>
                    </div>

                    {note.date && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {parseBRDate(note.date) ? formatDateForMDX(parseBRDate(note.date)!) : note.date}
                      </div>
                    )}

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{note.tags.length - 3}
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