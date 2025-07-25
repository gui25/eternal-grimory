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
import { Badge } from '@/components/ui/badge'
import SmartImage from '@/components/ui/smart-image'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { ImageUpload } from '@/components/ui/image-upload'
import { DeleteButton } from '@/components/ui/delete-button'
import { getCurrentCampaignId } from '@/lib/campaign-config'

export default function EditPlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [slug, setSlug] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [htmlContent, setHtmlContent] = useState('')
  const [originalSlug, setOriginalSlug] = useState('')
  const [moveImageToSaved, setMoveImageToSaved] = useState<(() => Promise<void>) | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    player: '',
    class: 'Guerreiro',
    race: 'Humano',
    level: 1,
    tags: '',
    image: '',
    description: '',
    content: ''
  })

  // Resolver params e carregar dados
  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      setOriginalSlug(resolvedParams.slug)
      
      try {
        const response = await fetch(`/api/admin/get-content?type=player&slug=${resolvedParams.slug}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            // Preservar a imagem se ela já foi modificada (evita sobrescrever uploads recentes)
            setFormData(prevData => {
              const newData = result.data
              
              // Se é a primeira carga (prevData vazio/inicial), sempre usar dados do servidor
              if (!prevData.name && !prevData.image) {
                return newData
              }
              
              // Se já temos uma imagem carregada (temp ou saved), preservá-la
              if (prevData.image && 
                  prevData.image !== '' && 
                  !prevData.image.includes('placeholder.svg')) {
                newData.image = prevData.image
                return newData
              }
              
              // Se foi removida explicitamente E o servidor ainda tem a imagem original, manter a remoção
              if (prevData.image === '' && 
                  newData.image && 
                  !newData.image.includes('placeholder.svg')) {
                newData.image = ''
                return newData
              }
              
              // Caso contrário, usar os dados do servidor (permite novos uploads após remoção)
              return newData
            })
          } else {
            toast.error('Erro ao carregar dados do personagem')
            router.push('/characters/players')
          }
        } else {
          toast.error('Personagem não encontrado')
          router.push('/characters/players')
        }
      } catch (error) {
        console.error('Error loading player data:', error)
        toast.error('Erro ao carregar dados do personagem')
        router.push('/characters/players')
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
      // Mover imagem temporária para pasta definitiva se necessário
      if (moveImageToSaved && typeof moveImageToSaved === 'function') {
        await moveImageToSaved()
      }

      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      const response = await fetch('/api/admin/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'player',
          slug: formData.slug,
          name: formData.name,
          content: formData.content,
          originalSlug: originalSlug,
          metadata: {
            player: formData.player,
            class: formData.class,
            race: formData.race,
            level: formData.level,
            tags,
            image: formData.image,
            description: formData.description
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Personagem atualizado com sucesso!')
        router.push(`/characters/players/${formData.slug}`)
      } else {
        toast.error(result.error || 'Erro ao atualizar personagem')
      }
    } catch (error) {
      console.error('Error updating player:', error)
      toast.error('Erro ao atualizar personagem')
    } finally {
      setIsLoading(false)
    }
  }

  const mockFrontmatter = {
    name: formData.name || 'Nome do Personagem',
    player: formData.player,
    class: formData.class,
    race: formData.race,
    level: formData.level,
    tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    image: formData.image,
    description: formData.description
  }



  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados do personagem...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/characters/players">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Personagens
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-blue-accent" />
          <h1 className="text-3xl font-bold">Editar Personagem: {formData.name}</h1>
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
              Edite os dados do personagem. Use Markdown para formatação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Personagem *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Aragorn, o Andarilho"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="aragorn-o-andarilho"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="player">Nome do Jogador</Label>
                <Input
                  id="player"
                  value={formData.player}
                  onChange={(e) => setFormData(prev => ({ ...prev, player: e.target.value }))}
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Classe</Label>
                  <Input
                    id="class"
                    value={formData.class}
                    onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                    placeholder="Ex: Guerreiro, Mago, Ladino"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="race">Raça</Label>
                  <Input
                    id="race"
                    value={formData.race}
                    onChange={(e) => setFormData(prev => ({ ...prev, race: e.target.value }))}
                    placeholder="Ex: Humano, Elfo, Anão"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Nível</Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Ex: herói, líder, combatente (separadas por vírgula)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição Breve (Opcional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Um paladino anão que jurou proteger a natureza"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Uma descrição curta que aparecerá destacada na página do personagem
                </p>
              </div>

              <div className="space-y-2">
                <ImageUpload
                  value={formData.image}
                  onChange={(value) => setFormData(prev => ({ ...prev, image: value }))}
                  type="player"
                  slug={formData.slug || 'player'}
                  label="Imagem do Personagem"
                  disabled={isLoading}
                  onTempImageReady={setMoveImageToSaved}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">História do Personagem (Markdown/MDX)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escreva a história do personagem em Markdown..."
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
                  <Link href="/characters/players">
                    Cancelar
                  </Link>
                </Button>

                <DeleteButton
                  type="player"
                  slug={originalSlug}
                  name={formData.name}
                  campaignId={getCurrentCampaignId()}
                  className="ml-auto"
                />
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
              Visualização exata de como ficará a página do personagem
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
                          placeholder={<User className="h-24 w-24 text-blue-accent/50" />}
                        />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                      {/* Title */}
                      <h1 className="fantasy-heading text-3xl mb-4">{mockFrontmatter.name}</h1>
                      
                      {/* Metadata - exatamente como na página oficial */}
                      <div className="text-lg mb-3 text-gold-light">
                        {`Nível ${mockFrontmatter.level} • ${mockFrontmatter.race} ${mockFrontmatter.class}`}
                      </div>
                      {mockFrontmatter.player && (
                        <div className="text-sm text-muted-foreground mb-3">
                          Jogado por: {mockFrontmatter.player}
                        </div>
                      )}
                      
                      {/* Description in italics */}
                      {mockFrontmatter.description && (
                        <div className="mb-3 italic text-gray-100">
                          "{mockFrontmatter.description}"
                        </div>
                      )}

                      {/* Tags section - igual à página oficial */}
                      {mockFrontmatter.tags.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm text-muted-foreground mb-1">Tags:</div>
                          <div className="flex flex-wrap gap-2">
                            {mockFrontmatter.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
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