'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Folder, Settings, Trash2, Edit, Save, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { isAdminMode } from '@/lib/dev-utils'

interface Campaign {
  id: string
  name: string
  description: string
  active: boolean
  createdAt: string
  dmName?: string
}

interface EditingCampaign {
  id: string
  name: string
  description: string
  dmName: string
}

export default function CampaignsPage() {
  const router = useRouter()
  const [showAdmin, setShowAdmin] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<EditingCampaign | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    dmName: ''
  })

  useEffect(() => {
    const adminMode = isAdminMode()
    setShowAdmin(adminMode)
    
    if (!adminMode) {
      router.push('/')
      return
    }

    loadCampaigns()
  }, [router])

  const loadCampaigns = async () => {
    try {
      console.log('Carregando campanhas...')
      const response = await fetch('/api/admin/campaigns', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Campanhas carregadas:', data.campaigns)
        setCampaigns(data.campaigns || [])
      } else {
        console.error('Erro na resposta:', response.status)
      }
    } catch (error) {
      console.error('Error loading campaigns:', error)
      toast.error('Erro ao carregar campanhas')
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const slug = generateSlug(newCampaign.name)
      
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCampaign.name,
          slug,
          description: newCampaign.description,
          dmName: newCampaign.dmName
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Campanha criada com sucesso!')
        setNewCampaign({ name: '', description: '', dmName: '' })
        setShowCreateForm(false)
        await loadCampaigns()
      } else {
        toast.error(result.error || 'Erro ao criar campanha')
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast.error('Erro ao criar campanha')
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      dmName: campaign.dmName || ''
    })
  }

  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCampaign) return

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/admin/campaigns/${editingCampaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingCampaign.name,
          description: editingCampaign.description,
          dmName: editingCampaign.dmName
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Campanha atualizada com sucesso!')
        setEditingCampaign(null)
        await loadCampaigns()
      } else {
        toast.error(result.error || 'Erro ao atualizar campanha')
      }
    } catch (error) {
      console.error('Error updating campaign:', error)
      toast.error('Erro ao atualizar campanha')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    
    let confirmMessage = 'Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.'
    
    if (campaign?.active) {
      const activeCampaigns = campaigns.filter(c => c.active)
      if (activeCampaigns.length === 1) {
        toast.error('Não é possível excluir a única campanha ativa. Crie ou ative outra campanha primeiro.')
        return
      }
      confirmMessage = `ATENÇÃO: Esta é uma campanha ATIVA (${campaign.name}). Tem certeza que deseja excluí-la? Esta ação não pode ser desfeita e todos os dados serão perdidos permanentemente.`
    }
    
    if (!confirm(confirmMessage)) {
      return
    }

    setDeletingCampaignId(campaignId)

    try {
      console.log('Iniciando exclusão da campanha:', campaignId)
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        console.log('Campanha excluída com sucesso, recarregando lista...')
        toast.success('Campanha excluída com sucesso!')
        
        // Forçar recarregamento da lista
        await loadCampaigns()
        
        // Alternativa: remover diretamente do estado local
        setCampaigns(prevCampaigns => prevCampaigns.filter(c => c.id !== campaignId))
      } else {
        toast.error(result.error || 'Erro ao excluir campanha')
        console.error('Delete error:', result)
      }
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.error('Erro ao excluir campanha')
    } finally {
      setDeletingCampaignId(null)
    }
  }

  if (!showAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-muted-foreground">
          Esta página só está disponível em modo de desenvolvimento local.
        </p>
        <Button asChild className="mt-4">
          <Link href="/">Voltar ao Início</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Admin
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Folder className="h-6 w-6 text-gold-primary" />
          <h1 className="text-3xl font-bold">Gerenciar Campanhas</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Campanhas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campanhas Existentes</CardTitle>
                  <CardDescription>
                    Gerencie suas campanhas de RPG
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  disabled={showCreateForm}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Campanha
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Carregando campanhas...</p>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma campanha encontrada</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Crie sua primeira campanha para começar
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      {editingCampaign?.id === campaign.id ? (
                        <form onSubmit={handleUpdateCampaign} className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor={`edit-name-${campaign.id}`}>Nome da Campanha</Label>
                            <Input
                              id={`edit-name-${campaign.id}`}
                              value={editingCampaign.name}
                              onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, name: e.target.value } : null)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`edit-description-${campaign.id}`}>Descrição</Label>
                            <Textarea
                              id={`edit-description-${campaign.id}`}
                              value={editingCampaign.description}
                              onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, description: e.target.value } : null)}
                              rows={2}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`edit-dm-${campaign.id}`}>Nome do Mestre</Label>
                            <Input
                              id={`edit-dm-${campaign.id}`}
                              value={editingCampaign.dmName}
                              onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, dmName: e.target.value } : null)}
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button type="submit" size="sm" disabled={isUpdating}>
                              <Save className="h-4 w-4 mr-1" />
                              {isUpdating ? 'Salvando...' : 'Salvar'}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingCampaign(null)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{campaign.name}</h3>
                              {campaign.active && (
                                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-600 rounded-full">
                                  Ativa
                                </span>
                              )}
                            </div>
                            {campaign.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {campaign.description}
                              </p>
                            )}
                            {campaign.dmName && (
                              <p className="text-sm text-muted-foreground mt-1">
                                <span className="font-medium">Mestre:</span> {campaign.dmName}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Criada em: {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditCampaign(campaign)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={deletingCampaignId === campaign.id}
                            >
                              {deletingCampaignId === campaign.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Criação */}
        {showCreateForm && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Nova Campanha</CardTitle>
                <CardDescription>
                  Crie uma nova campanha de RPG
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Campanha *</Label>
                    <Input
                      id="name"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: A Lenda dos Cinco Anéis"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newCampaign.description}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Uma breve descrição da campanha..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dmName">Nome do Mestre</Label>
                    <Input
                      id="dmName"
                      value={newCampaign.dmName}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, dmName: e.target.value }))}
                      placeholder="Ex: Mestre João"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={isCreating} className="flex-1">
                      {isCreating ? 'Criando...' : 'Criar Campanha'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 