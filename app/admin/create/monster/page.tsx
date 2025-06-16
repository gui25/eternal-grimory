'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Skull, Eye, Edit } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import SmartImage from '@/components/ui/smart-image'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

export default function CreateMonsterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'Monstro',
    challenge: '1',
    tags: '',
    image: '',
    content: `Uma descrição detalhada da criatura, sua aparência, comportamento e origem.

## Estatísticas

**Classe de Armadura:** 15 (Armadura Natural)  
**Pontos de Vida:** 120 (16d10 + 32)  
**Deslocamento:** 9m, voo 18m  
**Nível de Desafio:** 8

### Atributos
- **Força:** 18 (+4)
- **Destreza:** 14 (+2)
- **Constituição:** 15 (+2)
- **Inteligência:** 12 (+1)
- **Sabedoria:** 13 (+1)
- **Carisma:** 16 (+3)

### Resistências e Imunidades
- **Resistências a Dano:** Frio, Necrótico
- **Imunidades a Dano:** Veneno
- **Imunidades a Condições:** Envenenado, Amedrontado

## Habilidades

### Sopro Devastador
A criatura pode usar sua ação para exalar energia destrutiva em um cone de 4,5m. Cada criatura na área deve fazer um teste de resistência de Destreza CD 15, sofrendo 22 (4d10) de dano em caso de falha, ou metade em caso de sucesso.

### Presença Aterrorizante
Cada criatura à escolha da criatura num raio de 18m deve ser bem-sucedida num teste de resistência de Sabedoria CD 14 ou ficará amedrontada por 1 minuto.

## Encontros Notáveis

### Sessão 5: O Covil Sombrio
A criatura foi encontrada pelos aventureiros em seu covil nas montanhas geladas, guardando um antigo artefato mágico.

## História e Lore

Esta criatura é uma das últimas de sua espécie, tendo sobrevivido às Guerras Arcanas há séculos. Ela possui conhecimento sobre magias antigas e segredos perdidos.

### Relacionamentos
- **Aliados:** Cultistas sombrios, elementais de gelo
- **Inimigos:** Ordem dos Paladinos da Luz
- **Território:** Picos gelados das Montanhas do Norte

## Tesouro

- 2.500 po em gemas preciosas
- Pergaminho de *Bola de Fogo*
- Amuleto da Proteção Contra o Mal

## Notas do Mestre

Esta criatura é inteligente e prefere negociar antes de lutar. Use sua presença aterrorizante para controlar o campo de batalha e force os jogadores a tomar decisões táticas.`
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
          type: 'monster',
          slug: formData.slug,
          name: formData.name,
          content: formData.content,
          metadata: {
            type: formData.type,
            challenge: formData.challenge,
            tags,
            image: formData.image
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Monstro criado com sucesso!')
        router.push(`/characters/monsters/${formData.slug}`)
      } else {
        toast.error(result.error || 'Erro ao criar monstro')
      }
    } catch (error) {
      console.error('Error creating monster:', error)
      toast.error('Erro ao criar monstro')
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
    image: formData.image
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
          <h1 className="text-3xl font-bold">Criar Novo Monstro</h1>
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
              Preencha os dados do novo monstro. Use Markdown para formatação.
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
                    placeholder="Ex: Dragão Vermelho Ancião"
                    required
                  />
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
                  {isLoading ? 'Criando...' : 'Criar Monstro'}
                </Button>
                
                <Button type="button" variant="outline" asChild>
                  <Link href="/characters/monsters">
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
              Visualização exata de como ficará a página do monstro
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
                          placeholder={<Skull className="h-24 w-24 text-red-accent/40" />}
                        />
                      </div>
                    </div>

                    {/* Title and metadata section */}
                    <div className="flex-1">
                      <h1 className="fantasy-heading mb-2">{mockFrontmatter.name}</h1>
                      <div className="flex items-center text-lg mb-4 text-gold-light">
                        <span>{mockFrontmatter.type}</span>
                        <span className="mx-2">•</span>
                        <span>Desafio {mockFrontmatter.challenge}</span>
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