'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Calendar, Eye, Edit, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import SmartImage from '@/components/ui/smart-image'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { useNameValidation } from '@/hooks/use-name-validation'
import { formatDateBR, formatDateForInput, formatDateForMDX, inputDateToBR, parseBRDate } from '@/utils/date-utils'
import { DateInputBR } from '@/components/ui/date-input-br'
import { ImageUpload } from '@/components/ui/image-upload'

export default function EditSessionPage({ params }: { params: Promise<{ slug: string }> }) {
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
    type: 'session',
    onValidation: (valid, message) => {
      setNameValidationError(valid ? '' : message)
      setCanSubmit(valid)
    }
  })
  
  const [formData, setFormData] = useState({
    session_number: 1,
    slug: '',
    date: '',
    players: '',
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
        const response = await fetch(`/api/admin/get-content?type=session&slug=${resolvedParams.slug}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            const sessionData = result.data
            setFormData({
              ...sessionData,
              // Manter o formato brasileiro para o novo componente
              date: sessionData.date
            })
          } else {
            toast.error('Erro ao carregar dados da sessão')
            router.push('/sessions')
          }
        } else {
          toast.error('Sessão não encontrada')
          router.push('/sessions')
        }
      } catch (error) {
        console.error('Error loading session data:', error)
        toast.error('Erro ao carregar dados da sessão')
        router.push('/sessions')
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

  const generateSlug = (sessionNumber: number) => {
    return `sessao-${sessionNumber.toString().padStart(2, '0')}`
  }

  const handleSessionNumberChange = (sessionNumber: number) => {
    const sessionName = `Sessão ${sessionNumber}`
    setFormData(prev => ({
      ...prev,
      session_number: sessionNumber,
      slug: generateSlug(sessionNumber)
    }))
    
    // Validar nome em tempo real
    validateName(sessionName)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar se o nome é válido
    if (!canSubmit || nameValidationError) {
      toast.error('Corrija os erros antes de salvar a sessão')
      return
    }
    
    setIsLoading(true)

    try {
      const players = formData.players.split(',').map(player => player.trim()).filter(Boolean)
      
      const response = await fetch('/api/admin/edit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'session',
          slug: formData.slug,
          name: `Sessão ${formData.session_number}`,
          content: formData.content,
          originalSlug: originalSlug,
          metadata: {
            session_number: formData.session_number,
            date: formData.date, // Já está no formato brasileiro correto
            players,
            image: formData.image,
            description: formData.description
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Sessão atualizada com sucesso!')
        router.push(`/sessions/${formData.slug}`)
      } else {
        toast.error(result.error || 'Erro ao atualizar sessão')
      }
    } catch (error) {
      console.error('Error updating session:', error)
      toast.error('Erro ao atualizar sessão')
    } finally {
      setIsLoading(false)
    }
  }

  const mockFrontmatter = {
    session_number: formData.session_number,
    date: formData.date || '',
    players: formData.players.split(',').map(player => player.trim()).filter(Boolean),
    image: formData.image,
    description: formData.description
  }

  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados da sessão...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/sessions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Sessões
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-accent" />
          <h1 className="text-3xl font-bold">Editar Sessão {formData.session_number}</h1>
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
              Edite os dados da sessão. Use Markdown para formatação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session_number">Número da Sessão *</Label>
                  <div className="relative">
                    <Input
                      id="session_number"
                      type="number"
                      min="1"
                      value={formData.session_number}
                      onChange={(e) => handleSessionNumberChange(parseInt(e.target.value) || 1)}
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
                    placeholder="sessao-01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data da Sessão *</Label>
                <DateInputBR
                  id="date"
                  value={formData.date}
                  onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
                  placeholder="Clique para selecionar uma data"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="players">Jogadores Presentes</Label>
                <Input
                  id="players"
                  value={formData.players}
                  onChange={(e) => setFormData(prev => ({ ...prev, players: e.target.value }))}
                  placeholder="Ex: João, Maria, Pedro (separados por vírgula)"
                />
              </div>

              <div className="space-y-2">
                <ImageUpload
                  value={formData.image}
                  onChange={(value) => setFormData(prev => ({ ...prev, image: value }))}
                  type="session"
                  slug={formData.slug || 'sessao'}
                  label="Imagem da Sessão"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Escreva uma descrição para a sessão..."
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Relatório da Sessão (Markdown/MDX)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escreva o relatório da sessão em Markdown..."
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
                  <Link href="/sessions">
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
              Visualização exata de como ficará a página da sessão
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
                          alt={`Sessão ${mockFrontmatter.session_number}`} 
                          fill 
                          className="object-cover" 
                          placeholder={<Calendar className="h-24 w-24 text-blue-accent/40" />}
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <h1 className="fantasy-heading mb-2">Sessão {mockFrontmatter.session_number}</h1>
                      
                      <div className="text-lg mb-4 text-gold-light">
                        <Calendar className="inline-block mr-2 h-5 w-5" />
                        {mockFrontmatter.date}
                      </div>

                      {mockFrontmatter.players && mockFrontmatter.players.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm text-muted-foreground mb-1">Jogadores presentes:</div>
                          <div className="flex flex-wrap gap-2">
                            {mockFrontmatter.players.map((player, index) => (
                              <span key={index} className="bg-secondary px-3 py-1 rounded-full text-xs text-foreground">
                                {player}
                              </span>
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