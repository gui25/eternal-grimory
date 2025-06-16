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

export default function CreatePlayerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    player: '',
    class: 'Guerreiro',
    race: 'Humano',
    level: '1',
    tags: '',
    image: '',
    content: `Uma descrição detalhada do personagem, incluindo aparência física, personalidade e história pessoal.

## Informações Básicas

**Jogador:** Nome do Jogador  
**Classe:** Guerreiro  
**Raça:** Humano  
**Nível:** 1  
**Antecedente:** Soldado

## Atributos

**Força:** 16 (+3)  
**Destreza:** 14 (+2)  
**Constituição:** 15 (+2)  
**Inteligência:** 12 (+1)  
**Sabedoria:** 13 (+1)  
**Carisma:** 10 (+0)

## Personalidade

### Traços de Personalidade
- Sempre mantém a palavra dada
- Prefere ação direta a estratégias complexas

### Ideais
- **Coragem:** Nunca recua diante do perigo quando vidas inocentes estão em risco

### Vínculos
- Jurou proteger sua cidade natal de qualquer ameaça

### Defeitos
- Às vezes age sem pensar, colocando-se em perigo desnecessário

## História Pessoal

Nasceu em uma pequena vila nas fronteiras do reino. Desde jovem mostrou aptidão para o combate e senso de justiça. Treinou com a guarda local antes de partir em aventuras.

### Família e Origens
- **Pais:** Fazendeiros respeitados na comunidade
- **Irmãos:** Uma irmã mais nova que admira suas aventuras

## Equipamentos Principais

### Armas
- **Espada Longa:** Arma principal, herança familiar
- **Arco Longo:** Para combate à distância

### Armadura
- **Cota de Malha:** Proteção confiável sem sacrificar mobilidade

### Itens Especiais
- **Medalhão da Família:** Traz sorte em momentos difíceis

## Objetivos e Motivações

### Objetivos de Curto Prazo
- Ganhar experiência e se tornar um guerreiro mais hábil
- Encontrar companheiros confiáveis para formar um grupo

### Objetivos de Longo Prazo
- Proteger o reino de ameaças sobrenaturais
- Estabelecer sua própria ordem de cavaleiros

## Relacionamentos no Grupo

### Aliados
- Confia em companheiros que demonstram honra e coragem

### Dinâmica de Grupo
- Frequentemente assume papel de líder em situações de combate
- Oferece proteção aos membros mais frágeis do grupo

## Notas do Jogador

Prefere soluções diretas e honestas. Não gosta de subterfúgios, mas respeita a necessidade tática quando explicada claramente.`
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
          type: 'player',
          slug: formData.slug,
          name: formData.name,
          content: formData.content,
          metadata: {
            player: formData.player,
            class: formData.class,
            race: formData.race,
            level: parseInt(formData.level),
            tags,
            image: formData.image
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Player criado com sucesso!')
        router.push(`/characters/players/${formData.slug}`)
      } else {
        toast.error(result.error || 'Erro ao criar player')
      }
    } catch (error) {
      console.error('Error creating player:', error)
      toast.error('Erro ao criar player')
    } finally {
      setIsLoading(false)
    }
  }

  const mockFrontmatter = {
    name: formData.name || 'Nome do Personagem',
    player: formData.player,
    class: formData.class,
    race: formData.race,
    level: parseInt(formData.level) || 1,
    tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    image: formData.image
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/characters/players">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Players
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-gold-light" />
          <h1 className="text-3xl font-bold">Criar Novo Player</h1>
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
              Preencha os dados do novo personagem jogador. Use Markdown para formatação.
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
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Ex: tanque, líder, protetor (separadas por vírgula)"
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

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Criando...' : 'Criar Player'}
                </Button>
                
                <Button type="button" variant="outline" asChild>
                  <Link href="/characters/players">
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
              Visualização exata de como ficará a página do player
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
                          placeholder={<User className="h-24 w-24 text-gold-light/40" />}
                        />
                      </div>
                    </div>

                    {/* Title and metadata section */}
                    <div className="flex-1">
                      <h1 className="fantasy-heading mb-2">{mockFrontmatter.name}</h1>
                      <div className="flex items-center text-lg mb-4 text-gold-light">
                        <span>{mockFrontmatter.race} {mockFrontmatter.class}</span>
                        <span className="mx-2">•</span>
                        <span>Nível {mockFrontmatter.level}</span>
                      </div>
                      {mockFrontmatter.player && (
                        <div className="text-sm mb-4 text-muted-foreground">
                          <span className="font-medium">Jogador:</span> {mockFrontmatter.player}
                        </div>
                      )}
                      
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