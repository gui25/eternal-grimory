'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Users, Eye, Edit, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import SmartImage from '@/components/ui/smart-image'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { useNameValidation } from '@/hooks/use-name-validation'
import { ImageUpload } from '@/components/ui/image-upload'

export default function CreateNPCPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const [nameValidationError, setNameValidationError] = useState('')
  const [canSubmit, setCanSubmit] = useState(true)
  
  // Hook de validação de nome
  const { validateName, isValidating, validationMessage, isValid } = useNameValidation({
    type: 'npc',
    onValidation: (valid, message) => {
      setNameValidationError(valid ? '' : message)
      setCanSubmit(valid)
    }
  })
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'NPC',
    affiliation: '',
    tags: '',
    image: '',
    description: '',
    content: `Uma descrição detalhada do NPC, incluindo aparência física, personalidade e maneirismos distintivos.

## Informações Básicas

**Ocupação:** Comerciante de artefatos mágicos  
**Localização:** Taverna do Javali Dourado  
**Afiliação:** Guilda dos Mercadores  
**Atitude Inicial:** Amigável

## Personalidade

### Traços de Personalidade
- Sempre fala com as mãos, gesticulando dramaticamente
- Tem o hábito de polir suas joias enquanto conversa

### Ideais
- Acredita que todo conhecimento tem um preço justo

### Vínculos
- Sua filha desapareceu há dois anos em uma expedição

### Defeitos
- Extremamente ganancioso, às vezes coloca lucro acima da segurança

## História Pessoal

Nasceu em uma família de comerciantes e herdou o negócio do pai. Viajou por todo o reino coletando artefatos raros e construindo uma rede de contatos.

## Relacionamentos

### Família e Amigos
- **Lyanna (filha):** Desaparecida, era sua aprendiz

### Aliados Profissionais
- **Guilda dos Mercadores:** Membro respeitado há 20 anos

### Rivais ou Inimigos
- **Marcus, o Trapaceiro:** Comerciante rival que usa métodos desonestos

## Encontros com os Jogadores

### Sessão 3: Primeiro Contato
O grupo conheceu o NPC na taverna, onde ele ofereceu informações sobre artefatos antigos em troca de uma pequena tarefa.

## Informações e Serviços

### O que o NPC Sabe
- Localização de ruínas antigas na região
- Preços atuais de gemas e metais preciosos
- Rumores sobre atividades suspeitas na floresta

### Serviços Oferecidos
- **Identificação de itens mágicos:** 50 po por item
- **Compra/venda de artefatos:** Preços justos de mercado

## Notas do Mestre

Use este NPC como fonte de informações e ganchos de aventura. Ele pode fornecer missões secundárias relacionadas à busca por sua filha.`
  })

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
      toast.error('Corrija os erros antes de criar o NPC')
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
          type: 'npc',
          slug: formData.slug,
          name: formData.name,
          content: formData.content,
          metadata: {
            type: formData.type,
            affiliation: formData.affiliation,
            tags,
            image: formData.image,
            description: formData.description
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('NPC criado com sucesso!')
        router.push(`/characters/npcs/${formData.slug}`)
      } else {
        toast.error(result.error || 'Erro ao criar NPC')
      }
    } catch (error) {
      console.error('Error creating NPC:', error)
      toast.error('Erro ao criar NPC')
    } finally {
      setIsLoading(false)
    }
  }

  const mockFrontmatter = {
    name: formData.name || 'Nome do NPC',
    type: formData.type,
    affiliation: formData.affiliation,
    tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    image: formData.image,
    description: formData.description
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
          <Users className="h-6 w-6 text-gold-light" />
          <h1 className="text-3xl font-bold">Criar Novo NPC</h1>
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
              Preencha os dados do novo NPC. Use Markdown para formatação.
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
                      placeholder="Ex: Elara, a Sábia"
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
                  placeholder="Ex: aliado, comerciante, informante (separadas por vírgula)"
                />
              </div>

              <div className="space-y-2">
                <ImageUpload
                  value={formData.image}
                  onChange={(value) => setFormData(prev => ({ ...prev, image: value }))}
                  type="npc"
                  slug={formData.slug || 'novo-npc'}
                  label="Imagem do NPC"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Escreva a descrição do NPC..."
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

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading || !canSubmit}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Criando...' : 'Criar NPC'}
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

        {/* Preview Side - Replica exata da página real */}
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
          <CardContent className="p-2">
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
                          placeholder={<Users className="h-24 w-24 text-gold-light/40" />}
                        />
                      </div>
                    </div>

                    {/* Title and metadata section */}
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