'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Package, Eye, Edit } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import SmartImage from '@/components/ui/smart-image'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

export default function CreateItemPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'Item',
    rarity: 'Comum',
    tags: '',
    image: '',
    description: '',
    content: `Uma descrição detalhada do item, incluindo sua aparência, materiais e características distintivas.

## Propriedades do Item

**Tipo:** Arma Mágica  
**Raridade:** Raro  
**Requer Sintonia:** Sim  
**Peso:** 1,5 kg  
**Valor:** 2.500 po (estimado)

## Efeitos Mágicos

### Propriedade Principal
Esta lâmina élfica brilha com uma luz suave quando orcs estão a 36 metros. Você ganha +1 de bônus nas jogadas de ataque e dano feitas com esta arma mágica.

### Propriedades Secundárias
- **Luz Élfica:** A espada emite luz fraca num raio de 3 metros
- **Detecção de Orcs:** Brilha quando orcs estão próximos

### Limitações
- **Sintonia Necessária:** Requer sintonia com um elfo ou meio-elfo
- **Fragilidade:** Perde suas propriedades se danificada por ácido

## História do Item

### Origem
Forjada pelos elfos de Rivendell durante a Segunda Era, esta espada foi criada especificamente para combater as hordas de orcs que ameaçavam as terras élficas.

### Proprietários Anteriores
- **Legolas Folha-Verde:** Primeiro portador, herói da Guerra dos Anéis
- **Capitão Arathorn:** Ranger que a empunhou por 30 anos

## Encontros com os Jogadores

### Sessão 7: Descoberta na Tumba
Os aventureiros encontraram a espada em uma tumba élfica antiga, guardada por espíritos ancestrais que testaram sua dignidade.

### Usos Notáveis
- **Sessão 12:** Usada para derrotar o Chefe Orc Grishnak

## Lore e Lendas

Diz-se que esta espada nunca falhou em proteger seu portador de emboscadas de orcs, sempre alertando sobre sua presença com tempo suficiente para preparar uma defesa.

## Variações

### Versão Menor
Uma adaga com propriedades similares, mas com alcance de detecção reduzido para 18 metros.

## Notas do Mestre

Use este item para criar tensão em encontros com orcs. A luz de aviso pode tanto ajudar quanto atrapalhar, dependendo da situação tática.`
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
          type: 'item',
          slug: formData.slug,
          name: formData.name,
          content: formData.content,
          metadata: {
            type: formData.type,
            rarity: formData.rarity,
            tags,
            image: formData.image,
            description: formData.description
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Item criado com sucesso!')
        router.push(`/items/${formData.slug}`)
      } else {
        toast.error(result.error || 'Erro ao criar item')
      }
    } catch (error) {
      console.error('Error creating item:', error)
      toast.error('Erro ao criar item')
    } finally {
      setIsLoading(false)
    }
  }

  const mockFrontmatter = {
    name: formData.name || 'Nome do Item',
    type: formData.type,
    rarity: formData.rarity,
    tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    image: formData.image,
    description: formData.description
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

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'comum': 
      case 'common': 
        return 'bg-gray-100 text-gray-800'
      case 'incomum': 
      case 'uncommon': 
        return 'bg-green-100 text-green-800'
      case 'raro': 
      case 'rare': 
        return 'bg-blue-100 text-blue-800'
      case 'épico': 
      case 'epic': 
        return 'bg-purple-100 text-purple-800'
      case 'lendário': 
      case 'legendary': 
        return 'bg-orange-100 text-orange-800'
      default: 
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/items">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Itens
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-gold-primary" />
          <h1 className="text-3xl font-bold">Criar Novo Item</h1>
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
              Preencha os dados do novo item. Use Markdown para formatação.
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
                    placeholder="Ex: Espada Flamejante"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="espada-flamejante"
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
                    placeholder="Ex: Arma, Armadura, Poção, Acessório"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rarity">Raridade</Label>
                  <Select value={formData.rarity} onValueChange={(value) => setFormData(prev => ({ ...prev, rarity: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a raridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comum">Comum</SelectItem>
                      <SelectItem value="Incomum">Incomum</SelectItem>
                      <SelectItem value="Raro">Raro</SelectItem>
                      <SelectItem value="Épico">Épico</SelectItem>
                      <SelectItem value="Lendário">Lendário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Ex: mágico, arma, fogo (separadas por vírgula)"
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
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Escreva a descrição do item..."
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
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Criando...' : 'Criar Item'}
                </Button>
                
                <Button type="button" variant="outline" asChild>
                  <Link href="/items">
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
              Visualização exata de como ficará a página do item
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
                          placeholder={<Package className="h-24 w-24 text-gold-primary/40" />}
                        />
                      </div>
                    </div>

                    {/* Title and metadata section */}
                    <div className="flex-1">
                      <h1 className="fantasy-heading mb-2">{mockFrontmatter.name}</h1>
                      <div className="flex items-center text-lg mb-4 text-gold-light">
                        <span>{mockFrontmatter.type}</span>
                        <span className="mx-2">•</span>
                        <span className={`px-2 py-1 rounded text-xs ${getRarityColor(mockFrontmatter.rarity)}`}>
                          {mockFrontmatter.rarity}
                        </span>
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