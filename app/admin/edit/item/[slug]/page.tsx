'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import RarityBorder from '@/components/effects/rarity-border'
import RunicGlow from '@/components/effects/runic-glow'
import { ArrowLeft, Save, Sparkles, Eye, Edit, AlertCircle, Loader2, Shield, Sword, Zap, Heart } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import SmartImage from '@/components/ui/smart-image'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { useNameValidation } from '@/hooks/use-name-validation'
import { ImageUpload } from '@/components/ui/image-upload'
import { DeleteButton } from '@/components/ui/delete-button'
import { getCurrentCampaignId } from '@/lib/campaign-config'

export default function EditItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [slug, setSlug] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [htmlContent, setHtmlContent] = useState('')
  const [originalSlug, setOriginalSlug] = useState('')
  const [nameValidationError, setNameValidationError] = useState('')
  const [canSubmit, setCanSubmit] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'Item',
    rarity: 'Comum',
    tags: '',
    image: '',
    description: '',
    content: ''
  })

  // Hook de validação de nome
  const { validateName, isValidating, validationMessage, isValid } = useNameValidation({
    type: 'item',
    excludeSlug: originalSlug,
    onValidation: (valid, message) => {
      setNameValidationError(valid ? '' : message)
      setCanSubmit(valid)
    }
  })

  // Resolver params e carregar dados
  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      setOriginalSlug(resolvedParams.slug)
      
      try {
        const response = await fetch(`/api/admin/get-content?type=item&slug=${resolvedParams.slug}`)
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
                console.log('[EDIT-ITEM] Preservando imagem local:', prevData.image);
                newData.image = prevData.image;
              }
              
              return newData;
            })
          } else {
            toast.error('Erro ao carregar dados do item')
            router.push('/items')
          }
        } else {
          toast.error('Item não encontrado')
          router.push('/items')
        }
      } catch (error) {
        console.error('Error loading item data:', error)
        toast.error('Erro ao carregar dados do item')
        router.push('/items')
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
      toast.error('Corrija os erros antes de salvar')
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
          type: 'item',
          slug: formData.slug,
          name: formData.name,
          content: formData.content,
          originalSlug: originalSlug,
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
        toast.success('Item atualizado com sucesso!')
        router.push(`/items/${formData.slug}`)
      } else {
        toast.error(result.error || 'Erro ao atualizar item')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Erro ao atualizar item')
    } finally {
      setIsLoading(false)
    }
  }

  // Get rarity configuration - mesma função da página oficial
  const getRarityConfig = (rarity: string) => {
    const rarityLower = rarity.toLowerCase()
    switch (rarityLower) {
      case 'lendário':
      case 'legendary':
        return {
          type: 'legendary' as const,
          color: 'gold' as const,
          intensity: 'strong' as const,
          bgGradient: 'from-orange-500/20 via-yellow-500/10 to-orange-500/20',
          textColor: 'text-orange-400',
          shadowColor: 'shadow-orange-500/50',
          glowEffect: true
        }
      case 'épico':
      case 'epic':
        return {
          type: 'epic' as const,
          color: 'purple' as const,
          intensity: 'strong' as const,
          bgGradient: 'from-purple-500/20 via-violet-500/10 to-purple-500/20',
          textColor: 'text-purple-400',
          shadowColor: 'shadow-purple-500/30',
          glowEffect: true
        }
      case 'raro':
      case 'rare':
        return {
          type: 'rare' as const,
          color: 'blue' as const,
          intensity: 'medium' as const,
          bgGradient: 'from-blue-500/15 via-cyan-500/5 to-blue-500/15',
          textColor: 'text-blue-400',
          shadowColor: 'shadow-blue-500/20',
          glowEffect: true
        }
      case 'incomum':
      case 'uncommon':
        return {
          type: 'uncommon' as const,
          color: 'green' as const,
          intensity: 'medium' as const,
          bgGradient: 'from-green-500/15 via-emerald-500/5 to-green-500/15',
          textColor: 'text-green-400',
          shadowColor: 'shadow-green-500/20',
          glowEffect: false
        }
      case 'comum':
      case 'common':
      default:
        return {
          type: 'common' as const,
          color: 'gold' as const,
          intensity: 'subtle' as const,
          bgGradient: 'from-gray-500/10 via-slate-500/5 to-gray-500/10',
          textColor: 'text-gray-300',
          shadowColor: 'shadow-gray-500/10',
          glowEffect: false
        }
    }
  }

  // Get item type icon
  const getItemIcon = (type: string) => {
    const typeLower = type.toLowerCase()
    if (typeLower.includes('weapon') || typeLower.includes('arma')) return Sword
    if (typeLower.includes('armor') || typeLower.includes('armadura')) return Shield
    if (typeLower.includes('potion') || typeLower.includes('poção')) return Heart
    return Sparkles
  }

  const mockFrontmatter = {
    name: formData.name || 'Nome do Item',
    type: formData.type || 'Item',
    rarity: formData.rarity || 'Comum',
    description: formData.description || '',
    tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    image: formData.image
  }

  const rarityConfig = getRarityConfig(mockFrontmatter.rarity)
  const ItemIcon = getItemIcon(mockFrontmatter.type)

  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados do item...</p>
          </div>
        </div>
      </div>
    )
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
          <Sparkles className="h-6 w-6 text-gold-light" />
          <h1 className="text-3xl font-bold">Editar Item: {formData.name}</h1>
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
              Edite os dados do item. Use Markdown para formatação.
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
                      placeholder="Ex: Espada Flamejante"
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
                <ImageUpload
                  value={formData.image}
                  onChange={(value) => setFormData(prev => ({ ...prev, image: value }))}
                  type="item"
                  slug={formData.slug || 'item'}
                  label="Imagem do Item"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Item</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Escreva a descrição do item"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Descrição do Item (Markdown/MDX)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escreva a descrição do item em Markdown..."
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
                  <Link href="/items">
                    Cancelar
                  </Link>
                </Button>

                <DeleteButton
                  type="item"
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
              Visualização exata de como ficará a página do item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-fantasy-dark rounded-lg p-4 border min-h-[600px] overflow-auto">
              <div className="max-w-3xl mx-auto">
                <RarityBorder 
                  rarity={rarityConfig.type} 
                  pulseIntensity={rarityConfig.intensity}
                  className="mb-8"
                >
                  <div className={`fantasy-card p-6 bg-gradient-to-br ${rarityConfig.bgGradient} ${rarityConfig.shadowColor}`}>
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Enhanced Image Section */}
                      <div className="w-full lg:w-1/3 flex-shrink-0">
                        <div className="relative">
                          {rarityConfig.glowEffect ? (
                            <RunicGlow 
                              color={rarityConfig.color} 
                              intensity={rarityConfig.intensity}
                              runeCount={rarityConfig.type === 'legendary' ? 8 : 6}
                            >
                              <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-gold-dark">
                                <SmartImage 
                                  src={mockFrontmatter.image} 
                                  alt={mockFrontmatter.name} 
                                  fill 
                                  className="object-cover" 
                                  placeholder={<ItemIcon className="h-24 w-24 text-gold-light/50" />}
                                />
                              </div>
                            </RunicGlow>
                          ) : (
                            <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-gold-dark">
                              <SmartImage 
                                src={mockFrontmatter.image} 
                                alt={mockFrontmatter.name} 
                                fill 
                                className="object-cover" 
                                placeholder={<ItemIcon className="h-24 w-24 text-gold-light/50" />}
                              />
                            </div>
                          )}
                          
                          {/* Rarity Badge Overlay */}
                          <div className="absolute -top-2 -right-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${rarityConfig.textColor} bg-fantasy-dark/90 border border-current shadow-lg`}>
                              {mockFrontmatter.rarity}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Content Section */}
                      <div className="flex-1 space-y-4">
                        {/* Title with Enhanced Styling */}
                        <div className="space-y-2">
                          <h1 className={`fantasy-heading text-3xl ${rarityConfig.textColor} drop-shadow-lg`}>
                            {mockFrontmatter.name}
                          </h1>
                          
                          {/* Type and Rarity with Icon */}
                          <div className="flex items-center gap-3 text-lg text-gold-light">
                            <ItemIcon className="h-5 w-5" />
                            <span>{mockFrontmatter.type}</span>
                            <span className="text-gold-dark">•</span>
                            <span className={rarityConfig.textColor}>{mockFrontmatter.rarity}</span>
                          </div>
                        </div>

                        {/* Enhanced Description */}
                        {mockFrontmatter.description && (
                          <div className="text-gray-100 italic text-base bg-fantasy-darker/50 rounded-lg p-3 border-l-4 border-gold-primary">
                            <Zap className="inline-block w-4 h-4 mr-2 text-gold-light" />
                            "{mockFrontmatter.description}"
                          </div>
                        )}

                        {/* Enhanced Tags */}
                        {mockFrontmatter.tags.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground font-medium">Propriedades:</div>
                            <div className="flex flex-wrap gap-2">
                              {mockFrontmatter.tags.map((tag, index) => (
                                <span 
                                  key={index} 
                                  className="bg-red-600/80 text-white text-xs font-medium px-3 py-1 rounded-full hover:bg-red-600 transition-colors"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </RarityBorder>

                <RarityBorder 
                  rarity={rarityConfig.type} 
                  pulseIntensity="subtle"
                  interactive={false}
                  className="mt-6"
                >
                  <div className="fantasy-card p-6">
                    <article 
                      className={`prose prose-slate dark:prose-invert max-w-none mdx-content prose-headings:${rarityConfig.textColor}`}
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                  </div>
                </RarityBorder>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 