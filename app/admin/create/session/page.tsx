'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Calendar, Eye, Edit } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import SmartImage from '@/components/ui/smart-image'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

export default function CreateSessionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    date: '',
    tags: '',
    image: '',
    content: `Um resumo da sessão, incluindo os principais eventos, decisões dos jogadores e momentos marcantes.

## Participantes

### Jogadores Presentes
- **Ana (Elara, a Clériga):** Presente
- **Bruno (Thorin, o Guerreiro):** Presente  
- **Carlos (Zara, a Ladina):** Ausente
- **Diana (Mago Aldric):** Presente

### NPCs Importantes
- **Capitão Marcus:** Comandante da guarda da cidade
- **Velha Sábia Morgana:** Oráculo que forneceu a profecia

## Resumo da Sessão

### Início da Aventura
A sessão começou na taverna "O Javali Dourado", onde os aventureiros receberam uma missão urgente do Capitão Marcus para investigar estranhos acontecimentos na floresta próxima.

### Eventos Principais

#### 1. Investigação na Floresta
- Os jogadores descobriram pegadas estranhas
- Encontraram um acampamento abandonado de bandidos
- Zara (ausente) foi interpretada pelo mestre como scout

#### 2. Encontro com os Goblins
- Combate contra 6 goblins e 1 hobgoblin
- Thorin quase morreu, mas foi salvo pela cura de Elara
- Capturaram um goblin para interrogatório

#### 3. A Revelação
- O goblin revelou a localização do covil principal
- Descobriram que os bandidos estão trabalhando com orcs

## Combates e Encontros

### Combate 1: Emboscada dos Goblins
- **Participantes:** 4 jogadores vs 6 goblins + 1 hobgoblin
- **Duração:** 6 rodadas
- **Resultado:** Vitória dos jogadores
- **XP Concedido:** 450 XP (dividido entre os presentes)

### Encontro Social: Interrogatório
- **Teste de Intimidação (Thorin):** 18 (sucesso)
- **Teste de Persuasão (Elara):** 15 (sucesso)
- **Informações obtidas:** Localização do covil, número aproximado de inimigos

## Decisões dos Jogadores

### Decisões Importantes
1. **Poupar o goblin:** Decidiram não matá-lo após o interrogatório
2. **Estratégia de aproximação:** Optaram por atacar o covil durante a noite
3. **Divisão de recursos:** Compartilharam poções de cura encontradas

### Consequências
- O goblin poupado pode alertar seus aliados (será usado na próxima sessão)
- A estratégia noturna dará vantagem de surpresa

## Tesouro e Recompensas

### Itens Encontrados
- **150 po** em moedas diversas
- **2 Poções de Cura** (2d4+2 PV cada)
- **Adaga +1** (encontrada com o hobgoblin)

### Experiência
- **XP Total da Sessão:** 600 XP
- **XP por Jogador Presente:** 200 XP
- **Novo Nível:** Elara subiu para nível 4

## Ganchos para Próxima Sessão

### Missão Principal
- Atacar o covil dos bandidos/orcs
- Resgatar os mercadores sequestrados

### Missões Secundárias
- Investigar a conexão entre bandidos e orcs
- Descobrir quem está por trás da organização

## Notas do Mestre

### O que Funcionou Bem
- Combate balanceado e desafiador
- Roleplay excelente durante o interrogatório
- Boa cooperação entre os jogadores

### Pontos de Melhoria
- Preciso preparar mais descrições ambientais
- Considerar consequências das ações dos jogadores

### Preparação para Próxima Sessão
- Mapear o covil dos bandidos
- Preparar estatísticas dos orcs
- Desenvolver a personalidade do líder bandido`
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'session',
          slug: formData.slug,
          name: formData.name,
          content: formData.content,
          metadata: {
            date: formData.date,
            tags,
            image: formData.image
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Sessão criada com sucesso!')
        router.push(`/sessions/${formData.slug}`)
      } else {
        toast.error(result.error || 'Erro ao criar sessão')
      }
    } catch (error) {
      console.error('Error creating session:', error)
      toast.error('Erro ao criar sessão')
    } finally {
      setIsLoading(false)
    }
  }

  const mockFrontmatter = {
    name: formData.name || 'Nome da Sessão',
    date: formData.date,
    tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    image: formData.image
  }

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
          <Calendar className="h-6 w-6 text-wine-primary" />
          <h1 className="text-3xl font-bold">Criar Nova Sessão</h1>
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
              Preencha os dados da nova sessão. Use Markdown para formatação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Sessão *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Sessão 5: O Covil dos Bandidos"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="sessao-5-covil-dos-bandidos"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data da Sessão</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Ex: combate, roleplay, investigação (separadas por vírgula)"
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
                <Label htmlFor="content">Conteúdo da Sessão (Markdown/MDX)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escreva o resumo da sessão em Markdown..."
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Use Markdown para formatação. O preview ao lado mostra exatamente como ficará na página final.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Criando...' : 'Criar Sessão'}
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

        {/* Preview Side - Replica exata da página real */}
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
                          placeholder={<Calendar className="h-24 w-24 text-wine-primary/40" />}
                        />
                      </div>
                    </div>

                    {/* Title and metadata section */}
                    <div className="flex-1">
                      <h1 className="fantasy-heading mb-2">{mockFrontmatter.name}</h1>
                      <div className="flex items-center text-lg mb-4 text-gold-light">
                        {mockFrontmatter.date && (
                          <span>{new Date(mockFrontmatter.date).toLocaleDateString('pt-BR')}</span>
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