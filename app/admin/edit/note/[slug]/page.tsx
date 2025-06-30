'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, FileText, Eye, Edit, AlertCircle, Loader2, Calendar } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import SmartImage from '@/components/ui/smart-image'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { useNameValidation } from '@/hooks/use-name-validation'
import { formatDateBR, formatDateForInput, formatDateForMDX, inputDateToBR, parseBRDate } from '@/utils/date-utils'
import { DateInputBR } from '@/components/ui/date-input-br'
import { ImageUpload } from '@/components/ui/image-upload'
import { DeleteButton } from '@/components/ui/delete-button'
import { getCurrentCampaignId } from '@/lib/campaign-config'
import { Badge } from '@/components/ui/badge'

export default function EditNotePage({ params }: { params: Promise<{ slug: string }> }) {
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
    type: 'note',
    onValidation: (valid, message) => {
      setNameValidationError(valid ? '' : message)
      setCanSubmit(valid)
    }
  })
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    date: '',
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
        const response = await fetch(`/api/admin/get-content?type=note&slug=${resolvedParams.slug}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            const noteData = result.data
            
            // Converter tags para string se for array, ou manter como string se já for
            let tagsString = ''
            if (Array.isArray(noteData.tags)) {
              tagsString = noteData.tags.join(', ')
            } else if (typeof noteData.tags === 'string') {
              tagsString = noteData.tags
            }
            
            setFormData({
              ...noteData,
              tags: tagsString
            })
          } else {
            toast.error('Erro ao carregar dados da anotação')
            router.push('/notes')
          }
        } else {
          toast.error('Anotação não encontrada')
          router.push('/notes')
        }
      } catch (error) {
        console.error('Error loading note data:', error)
        toast.error('Erro ao carregar dados da anotação')
        router.push('/notes')
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
    
    // Validar nome em tempo real
    validateName(name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar se o nome é válido
    if (!canSubmit || nameValidationError) {
      toast.error('Corrija os erros antes de salvar a anotação')
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
          type: 'note',
          slug: formData.slug,
          name: formData.name,
          content: formData.content,
          originalSlug: originalSlug,
          metadata: {
            date: formData.date || '',
            tags,
            image: formData.image,
            description: formData.description
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Anotação atualizada com sucesso!')
        router.push(`/notes/${formData.slug}`)
      } else {
        toast.error(result.error || 'Erro ao atualizar anotação')
      }
    } catch (error) {
      console.error('Error updating note:', error)
      toast.error('Erro ao atualizar anotação')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados da anotação...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/notes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Anotações
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Editar Anotação</h1>
          </div>
          
          <DeleteButton
            type="note"
            slug={originalSlug}
            name={formData.name}
            campaignId={getCurrentCampaignId()}
            redirectPath="/notes"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gold">Informações Básicas</CardTitle>
                  <CardDescription>
                    Configure os dados principais da anotação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Anotação *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Torre do Mago Sombrio"
                      className={nameValidationError ? 'border-red-500' : ''}
                    />
                    {nameValidationError && (
                      <div className="flex items-center mt-2 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {nameValidationError}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="torre-do-mago-sombrio"
                    />
                    <p className="text-sm text-gold-light/60 mt-1">
                      Gerado automaticamente a partir do nome
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Uma breve descrição do que é esta anotação"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">Data (opcional)</Label>
                    <DateInputBR
                      id="date"
                      value={formData.date}
                      onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
                      placeholder="Selecione uma data"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="local, importante, segredo"
                    />
                    <p className="text-sm text-gold-light/60 mt-1">
                      Separe as tags com vírgulas
                    </p>
                  </div>

                  <div>
                    <Label>Imagem (opcional)</Label>
                    <ImageUpload
                      value={formData.image}
                      onChange={(url: string) => setFormData(prev => ({ ...prev, image: url }))}
                      type="note"
                      slug={formData.slug}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-gold">Conteúdo</CardTitle>
                  <CardDescription>
                    Escreva o conteúdo da anotação em Markdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Escreva o conteúdo da anotação..."
                    rows={20}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>

              <div className="flex gap-4 sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg border">
                <Button
                  type="submit"
                  disabled={isLoading || !canSubmit}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
                
                <Button type="button" variant="outline" asChild>
                  <Link href={`/notes/${originalSlug}`}>
                    Cancelar
                  </Link>
                </Button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-gold" />
                  <CardTitle className="text-gold">Preview</CardTitle>
                </div>
                <CardDescription>
                  Visualização de como a anotação aparecerá
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Preview usando o mesmo layout da DetailPageLayout */}
                  <div className="mb-8 fantasy-card p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image section */}
                      <div className="w-full md:w-1/3 flex-shrink-0">
                        <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gold-dark">
                          {formData.image ? (
                            <SmartImage
                              src={formData.image}
                              alt={formData.name || 'Preview'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-wine-darker">
                              <FileText className="h-24 w-24 text-gold-light/50" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title and metadata section */}
                      <div className="flex-1">
                        <h1 className="fantasy-heading mb-2">
                          {formData.name || 'Nome da Anotação'}
                        </h1>
                        
                        {/* Tags */}
                        {formData.tags && (
                          <div className="mb-3">
                            <div className="text-sm text-muted-foreground mb-1">Tags:</div>
                            <div className="flex flex-wrap gap-2">
                              {formData.tags.split(',').map((tag, index) => (
                                tag.trim() && (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag.trim()}
                                  </Badge>
                                )
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {formData.description && (
                          <div className="mb-3 italic text-gray-100">
                            "{formData.description}"
                          </div>
                        )}

                        {/* Date */}
                        {formData.date && (
                          <div className="text-lg text-gold-light">
                            <Calendar className="inline-block mr-2 h-5 w-5" />
                            {parseBRDate(formData.date) ? formatDateForMDX(parseBRDate(formData.date)!) : formData.date}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main content preview */}
                  <article className="prose prose-slate dark:prose-invert max-w-none mdx-content">
                    <div 
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                  </article>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 