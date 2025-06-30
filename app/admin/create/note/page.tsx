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
import { formatDateBR, formatDateForInput, formatDateForMDX, inputDateToBR } from '@/utils/date-utils'
import { DateInputBR } from '@/components/ui/date-input-br'
import { ImageUpload } from '@/components/ui/image-upload'

export default function CreateNotePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
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
    content: `Uma anotação detalhada sobre algo importante na campanha.

## Visão Geral

Descreva aqui uma visão geral do que esta anotação aborda. Esta pode ser uma anotação sobre:
- Um local importante
- Um evento histórico
- Uma mecânica específica
- Lore e mitologia
- Informações secretas para o mestre

## Detalhes Específicos

### Características Principais
- **Aspecto 1:** Descrição detalhada do primeiro aspecto importante
- **Aspecto 2:** Descrição detalhada do segundo aspecto importante
- **Aspecto 3:** Descrição detalhada do terceiro aspecto importante

### Informações Técnicas
- **Categoria:** [Local/Evento/Mecânica/Lore/Outro]
- **Importância:** [Alta/Média/Baixa]
- **Status:** [Ativo/Inativo/Em desenvolvimento]

## Conexões com a Campanha

### Relacionado a Sessões
- **Sessão X:** Como esta anotação se relaciona com eventos específicos
- **Sessão Y:** Outras conexões relevantes

### Relacionado a Personagens
- **[Nome do NPC]:** Como este personagem se relaciona com a anotação
- **[Nome do Monstro]:** Conexões com criaturas relevantes
- **[Nome do Jogador]:** Como os personagens dos jogadores podem interagir

### Relacionado a Locais
- **[Nome do Local]:** Conexões geográficas ou espaciais
- **[Região]:** Área de influência ou localização

### Relacionado a Itens
- **[Nome do Item]:** Artefatos ou objetos relacionados

## Implicações para o Jogo

### Para os Jogadores
- Como esta informação pode afetar as decisões dos jogadores
- Oportunidades de roleplay que podem surgir
- Possíveis ganchos de aventura

### Para a História Principal
- Como esta anotação se encaixa na narrativa maior da campanha
- Conexões com arcos principais da história
- Possível impacto no desenvolvimento futuro

## Informações do Mestre

### Segredos e Mistérios
Informações que apenas o mestre deve saber, incluindo:
- Verdades ocultas sobre o tópico
- Consequências não aparentes
- Conexões secretas com outros elementos

### Como Introduzir no Jogo
- Formas naturais de apresentar esta informação aos jogadores
- NPCs que podem fornecer estas informações
- Situações onde isso pode se tornar relevante

### Possíveis Desenvolvimentos
- Como esta anotação pode evoluir durante a campanha
- Eventos futuros que podem ser conectados
- Oportunidades de expansão

## Referências e Fontes

### Material de Referência
- **Livro/Fonte 1:** [De onde esta informação foi adaptada]
- **Inspiração:** [Material que serviu de inspiração]

### Notas de Desenvolvimento
- **Data de Criação:** [Quando esta anotação foi criada]
- **Última Atualização:** [Quando foi modificada pela última vez]
- **Versão:** [Se aplicável]

## Tags e Categorização

Use as tags para organizar suas anotações:
- \`local\` - Para locais importantes
- \`npc\` - Para informações sobre personagens
- \`evento\` - Para eventos históricos ou futuros
- \`mecanica\` - Para regras ou mecânicas especiais
- \`lore\` - Para mitologia e história do mundo
- \`segredo\` - Para informações confidenciais do mestre`
  })

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
      toast.error('Corrija os erros antes de criar a anotação')
      return
    }
    
    setIsLoading(true)

    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'note',
          slug: formData.slug,
          name: formData.name,
          content: formData.content,
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
        toast.success('Anotação criada com sucesso!')
        router.push(`/notes/${formData.slug}`)
      } else {
        toast.error(result.error || 'Erro ao criar anotação')
      }
    } catch (error) {
      console.error('Error creating note:', error)
      toast.error('Erro ao criar anotação')
    } finally {
      setIsLoading(false)
    }
  }

  // Processar markdown para preview
  useEffect(() => {
    const processContent = async () => {
      if (formData.content) {
        try {
          const processed = await remark().use(remarkHtml).process(formData.content)
          setHtmlContent(processed.toString())
        } catch (error) {
          console.error('Error processing markdown:', error)
        }
      }
    }
    processContent()
  }, [formData.content])

  const mockFrontmatter = {
    name: formData.name,
    date: formData.date || '',
    tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    image: formData.image,
    description: formData.description
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/notes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Anotações
          </Link>
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8 text-gold" />
          <h1 className="text-3xl font-bold text-gold">Criar Nova Anotação</h1>
        </div>
        <p className="text-gold-light/70">
          Crie uma nova anotação para registrar informações importantes da campanha.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-gold">Informações Básicas</CardTitle>
                <CardDescription>
                  Defina as informações principais da anotação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Anotação *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Torre do Mago Sombrio"
                    className={nameValidationError ? 'border-red-500' : ''}
                  />
                  {isValidating && (
                    <div className="flex items-center text-sm text-blue-400 mt-1">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Verificando disponibilidade...
                    </div>
                  )}
                  {nameValidationError && (
                    <div className="flex items-center text-sm text-red-400 mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {nameValidationError}
                    </div>
                  )}
                  {!nameValidationError && !isValidating && formData.name && (
                    <div className="text-sm text-green-400 mt-1">✓ Nome disponível</div>
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
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Anotação
                  </>
                )}
              </Button>
              
              <Button type="button" variant="outline" asChild>
                <Link href="/notes">
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
                      
                      {/* Metadata */}
                      {formData.date && (
                        <div className="text-lg mb-4 text-gold-light">
                          <Calendar className="inline-block mr-2 h-5 w-5" />
                          {formatDateBR(formData.date)}
                        </div>
                      )}

                      {formData.tags && (
                        <div className="mb-3">
                          <div className="text-sm text-muted-foreground mb-1">Tags:</div>
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.split(',').map((tag, index) => (
                              tag.trim() && (
                                <span key={index} className="bg-secondary px-3 py-1 rounded-full text-xs text-foreground">
                                  {tag.trim()}
                                </span>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Optional description */}
                  {formData.description && (
                    <div className="mt-4 italic text-gray-300">
                      "{formData.description}"
                    </div>
                  )}
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
  )
} 