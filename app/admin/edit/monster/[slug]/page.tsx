'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Skull, Eye, Edit, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import SmartImage from '@/components/ui/smart-image'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { useNameValidation } from '@/hooks/use-name-validation'
import { ImageUpload } from '@/components/ui/image-upload'
import { DeleteButton } from '@/components/ui/delete-button'
import { getCurrentCampaignId } from '@/lib/campaign-config'

export default function EditMonsterPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [slug, setSlug] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [htmlContent, setHtmlContent] = useState('')
  const [originalSlug, setOriginalSlug] = useState('')
  const [nameValidationError, setNameValidationError] = useState('')
  const [canSubmit, setCanSubmit] = useState(true)
  
  // Hook de validação de nome
  const { validateName, isValidating, validationMessage, isValid } = useNameValidation({
    type: 'monster',
    onValidation: (valid, message) => {
      setNameValidationError(valid ? '' : message)
      setCanSubmit(valid)
    }
  })
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'Monstro',
    challenge: '1',
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
        const response = await fetch(`/api/admin/get-content?type=monster&slug=${resolvedParams.slug}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            // Preservar mudanças locais do usuário (como imagens temporárias)
            setFormData(prevData => {
              const newData = result.data;
              
              // Se já temos uma imagem temporária ou salva, preservá-la
              if (prevData.image && 
                  prevData.image !== '' && 
                  !prevData.image.includes('placeholder.svg')) {
                newData.image = prevData.image;
              }
              
              return newData;
            })
          } else {
            toast.error('Erro ao carregar dados do monstro')
            router.push('/characters/monsters')
          }
        } else {
          toast.error('Monstro não encontrado')
          router.push('/characters/monsters')
        }
      } catch (error) {
        console.error('Error loading monster data:', error)
        toast.error('Erro ao carregar dados do monstro')
        router.push('/characters/monsters')
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
        // Fallback para renderização simples se remark falhar
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

  // Gerar slug automaticamente baseado no nome
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
    
    // Validar nome em tempo real
    validateName(name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar se o nome é válido
    if (!canSubmit || nameValidationError) {
      toast.error('Corrija os erros antes de salvar o monstro')
      return
    }
    
    setIsLoading(true)

    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      const response = await fetch('/api/admin/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'monster',
          slug: formData.slug,
          name: formData.name,
          content: formData.content,
          originalSlug: originalSlug,
          metadata: {
            type: formData.type,
            challenge: formData.challenge,
            tags,
            image: formData.image,
            description: formData.description
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Monstro atualizado com sucesso!')
        router.push(`/characters/monsters/${formData.slug}`)
      } else {
        toast.error(result.error || 'Erro ao atualizar monstro')
      }
    } catch (error) {
      console.error('Error updating monster:', error)
      toast.error('Erro ao atualizar monstro')
    } finally {
      setIsLoading(false)
    }
  }

  // Simular o frontmatter para o preview
  const mockFrontmatter = {
    name: formData.name || 'Nome do Monstro',
    type: formData.type,
    challenge: formData.challenge,
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
            <p className="text-muted-foreground">Carregando dados do monstro...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/characters/monsters">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Monstros
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Skull className="h-6 w-6 text-red-accent" />
          <h1 className="text-3xl font-bold">Editar Monstro: {formData.name}</h1>
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
              Edite os dados do monstro. Use Markdown para formatação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ex: Dragão Vermelho Ancião"
                      required
                      className={nameValidationError ? 'border-red-500 pr-10' : ''}
                    />
                    {isValidating && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {nameValidationError && !isValidating && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {nameValidationError && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {nameValidationError}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="dragao-vermelho-anciao"
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
                    placeholder="Ex: Dragão, Morto-vivo, Aberração"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="challenge">Nível de Desafio</Label>
                  <Input
                    id="challenge"
                    value={formData.challenge}
                    onChange={(e) => setFormData(prev => ({ ...prev, challenge: e.target.value }))}
                    placeholder="Ex: 20, 1/2, 1/4"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Ex: dragão, fogo, lendário (separadas por vírgula)"
                />
              </div>

              <div className="space-y-2">
                <ImageUpload
                  value={formData.image}
                  onChange={(value) => setFormData(prev => ({ ...prev, image: value }))}
                  type="monster"
                  slug={formData.slug || 'monstro'}
                  label="Imagem do Monstro"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Escreva a descrição do monstro..."
                  rows={4}
                  className="font-mono text-sm"
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
                <Button type="submit" disabled={isLoading || !canSubmit}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                
                <Button type="button" variant="outline" asChild>
                  <Link href="/characters/monsters">
                    Cancelar
                  </Link>
                </Button>

                <DeleteButton
                  type="monster"
                  slug={originalSlug}
                  name={formData.name}
                  campaignId={getCurrentCampaignId()}
                  className="ml-auto"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview Side - Replica exata da página real */}
        <Card className="h-fit sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview Real
            </CardTitle>
            <CardDescription>
              Visualização exata de como ficará a página do monstro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-background rounded-lg p-4 border min-h-[600px] overflow-auto">
              {/* Replica exata do DetailPageLayout */}
              <div className="max-w-3xl mx-auto">
                {/* Entity header com imagem - igual ao DetailPageLayout */}
                <div className="mb-8 fantasy-card p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image section */}
                    <div className="w-full md:w-1/3 flex-shrink-0">
                      <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gold-dark">
                        <SmartImage 
                          src={mockFrontmatter.image} 
                          alt={mockFrontmatter.name} 
                          fill 
                          className="object-cover" 
                          placeholder={<Skull className="h-24 w-24 text-red-accent/40" />}
                        />
                      </div>
                    </div>

                    {/* Title and metadata section */}
                    <div className="flex-1 flex flex-col">
                      {/* Title */}
                      <h1 className="fantasy-heading text-3xl mb-4">{mockFrontmatter.name}</h1>
                      
                      {/* Metadata - exatamente como na página oficial */}
                      <div className="text-lg mb-3 text-gold-light">
                        {mockFrontmatter.type && mockFrontmatter.challenge && (
                          `${mockFrontmatter.type} • Desafio ${mockFrontmatter.challenge}`
                        )}
                      </div>
                      
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

                {/* Main content com as mesmas classes da página real */}
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