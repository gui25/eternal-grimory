/**
 * Página de gerenciamento de conteúdo
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCMSContent, useCMSMutation } from '@/hooks/use-cms-content'
import { getContentType } from '@/lib/cms/config'
import { isAdminMode } from '@/lib/dev-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  Filter,
  Calendar,
  Tag,
  AlertCircle
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { toast } from 'sonner'

interface ManageContentPageProps {
  params: {
    type: string
  }
}

export default function ManageContentPage({ params }: ManageContentPageProps) {
  const { type } = params
  const router = useRouter()
  const [showAdmin, setShowAdmin] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState('updated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const contentType = getContentType(type)

  // Hook para buscar conteúdo
  const {
    data: items,
    isLoading,
    error,
    refetch,
    meta
  } = useCMSContent({
    type,
    search: search || undefined,
    status: statusFilter || undefined,
    sortBy,
    sortOrder,
    include: ['content']
  }, {
    enabled: showAdmin
  })

  // Hook para mutações
  const { delete: deleteItem, isLoading: isDeleting } = useCMSMutation(type, {
    onSuccess: () => {
      toast.success('Item deletado com sucesso!')
      refetch()
    },
    onError: (error) => {
      toast.error('Erro ao deletar item')
    }
  })

  useEffect(() => {
    const adminMode = isAdminMode()
    setShowAdmin(adminMode)
    
    if (!adminMode) {
      router.push('/')
    }
  }, [router])

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

  if (!contentType) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Conteúdo Inválido</CardTitle>
            <CardDescription>
              O tipo de conteúdo "{type}" não foi encontrado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/v2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleDelete = async (slug: string) => {
    if (confirm('Tem certeza que deseja deletar este item? Esta ação não pode ser desfeita.')) {
      await deleteItem(slug)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Navegação */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/v2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Filter className="h-6 w-6 text-gold-primary" />
            <h1 className="text-3xl font-bold">Gerenciar {contentType.pluralName}</h1>
          </div>
        </div>

        <Button asChild>
          <Link href={`/admin/v2/create/${type}`}>
            <Plus className="h-4 w-4 mr-2" />
            Novo {contentType.name}
          </Link>
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>
            Use os filtros abaixo para encontrar o conteúdo desejado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome, descrição..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ordenar por */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordenar por</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Última atualização</SelectItem>
                  <SelectItem value="created">Data de criação</SelectItem>
                  <SelectItem value="name">Nome</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ordem */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordem</label>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Mais recente</SelectItem>
                  <SelectItem value="asc">Mais antigo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {meta ? `${meta.total} itens encontrados` : 'Carregando...'}
            </p>
            <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Conteúdo */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Carregando conteúdo...</p>
          </CardContent>
        </Card>
      ) : !items || items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              {search || statusFilter 
                ? 'Nenhum item encontrado com os filtros aplicados.'
                : `Nenhum ${contentType.name.toLowerCase()} encontrado.`
              }
            </p>
            <Button asChild>
              <Link href={`/admin/v2/create/${type}`}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro {contentType.name}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item: any) => (
            <Card key={item.slug} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold truncate">
                        {item.name || item.title}
                      </h3>
                      {item.status && (
                        <Badge variant={
                          item.status === 'published' ? 'default' :
                          item.status === 'draft' ? 'secondary' : 'outline'
                        }>
                          {item.status}
                        </Badge>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Atualizado: {formatDate(item.updated)}
                      </div>
                      
                      {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {item.tags.slice(0, 3).map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="text-xs">+{item.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`${contentType.routePath}/${item.slug}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/v2/edit/${type}/${item.slug}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.slug)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginação (placeholder) */}
      {meta && meta.hasMore && (
        <Card className="mt-6">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Mostrando {items?.length || 0} de {meta.total} itens
            </p>
            <Button variant="outline" className="mt-2" disabled>
              Carregar Mais (Em breve)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
