'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, User, Eye, Edit } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import SmartImage from '@/components/ui/smart-image'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

export default function EditNPCPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [slug, setSlug] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [htmlContent, setHtmlContent] = useState('')
  const [originalSlug, setOriginalSlug] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'NPC',
    affiliation: '',
    tags: '',
    image: '',
    content: ''
  })

  // Resolver params e carregar dados
  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      setOriginalSlug(resolvedParams.slug)
      
      try {
        const response = await fetch(`/api/admin/get-content?type=npc&slug=${resolvedParams.slug}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setFormData(result.data)
          } else {
            toast.error('Erro ao carregar dados do NPC')
            router.push('/characters/npcs')
          }
        } else {
          toast.error('NPC não encontrado')
          router.push('/characters/npcs')
        }
      } catch (error) {
        console.error('Error loading NPC data:', error)
        toast.error('Erro ao carregar dados do NPC')
        router.push('/characters/npcs')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [params, router])

  // Processar markdown para HTML quando o conteúdo mudar
  useEffect(() => {
    const processContent = async () => {
      try {
        const result = await remark()
          .use(remarkHtml)
          .process(formData.content)
        setHtmlContent(result.toString())
      } catch (error) {
        console.error('Error processing markdown:', error)
        const simpleHtml = formData.content
          .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
          .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
          .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
          .replace(/\n\n/g, '</p><p class="mb-3">')
          .replace(/^(?!<[h|l])/gm, '<p class="mb-3">')
          .replace(/<\/p><p class="mb-3">(<[h|l])/g, '$1')
        setHtmlContent(simpleHtml)
      }
    }
    processContent()
  }, [formData.content])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      const response = await fetch('/api/admin/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'npc',
          slug: formData.slug,
          name: formData.name,
          content: formData.content,
          originalSlug: originalSlug,
          metadata: {
            type: formData.type,
            affiliation: formData.affiliation,
            tags,
            image: formData.image
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('NPC atualizado com sucesso!')
        router.push(`/characters/npcs/${formData.slug}`)
      } else {
        toast.error(result.error || 'Erro ao atualizar NPC')
      }
    } catch (error) {
      console.error('Error updating NPC:', error)
      toast.error('Erro ao atualizar NPC')
    } finally {
      setIsLoading(false)
    }
  }

  const mockFrontmatter = {
    name: formData.name || 'Nome do NPC',
    type: formData.type,
    affiliation: formData.affiliation,
    tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    image: formData.image
  }

  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados do NPC...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/characters/npcs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para NPCs
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-gold-light" />
          <h1 className="text-3xl font-bold">Editar NPC: {formData.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Side */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editor
            </CardTitle>
            <CardDescription>
              Edite os dados do NPC. Use Markdown para formatação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Elara, a Sábia"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="elara-a-sabia"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="Ex: Comerciante, Nobre, Guarda"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="affiliation">Afiliação</Label>
                  <Input
                    id="affiliation"
                    value={formData.affiliation}
                    onChange={(e) => setFormData(prev => ({ ...prev, affiliation: e.target.value }))}
                    placeholder="Ex: Guilda dos Magos, Reino de Aethermoor"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Ex: comerciante, aliado, informante (separadas por vírgula)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL da Imagem</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo (Markdown/MDX)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escreva o conteúdo em Markdown..."
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Use Markdown para formatação. O preview ao lado mostra exatamente como ficará na página final.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                
                <Button type="button" variant="outline" asChild>
                  <Link href="/characters/npcs">
                    Cancelar
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview Side */}
        <Card className="h-fit sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview Real
            </CardTitle>
            <CardDescription>
              Visualização exata de como ficará a página do NPC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-background rounded-lg p-4 border min-h-[600px] overflow-auto">
              <div className="max-w-3xl mx-auto">
                <div className="mb-8 fantasy-card p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 flex-shrink-0">
                      <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gold-dark">
                        <SmartImage 
                          src={mockFrontmatter.image} 
                          alt={mockFrontmatter.name} 
                          fill 
                          className="object-cover" 
                          placeholder={<User className="h-24 w-24 text-gold-light/40" />}
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <h1 className="fantasy-heading mb-2">{mockFrontmatter.name}</h1>
                      <div className="flex items-center text-lg mb-4 text-gold-light">
                        <span>{mockFrontmatter.type}</span>
                        {mockFrontmatter.affiliation && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{mockFrontmatter.affiliation}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {mockFrontmatter.tags.map((tag, index) => (
                          <span key={index} className="bg-secondary px-3 py-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <article 
                  className="prose prose-slate dark:prose-invert max-w-none mdx-content"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 