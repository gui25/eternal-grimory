/**
 * Nova interface de administração do CMS
 */
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { isAdminMode } from '@/lib/dev-utils'
import { CONTENT_TYPES } from '@/lib/cms/config'
import { cache } from '@/lib/cms/cache'
import { hookManager } from '@/lib/cms/hooks'
import { useCMSContent } from '@/hooks/use-cms-content'
import { 
  Settings, 
  Plus, 
  Database, 
  Activity, 
  BarChart3,
  Clock,
  Users,
  FileText,
  Package,
  BookOpen,
  Skull,
  Zap,
  RefreshCw,
  AlertCircle,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ContentStats {
  type: string
  name: string
  count: number
  icon: any
  color: string
}

export default function AdminV2Dashboard() {
  const [showAdmin, setShowAdmin] = useState(false)
  const [cacheStats, setCacheStats] = useState<any>(null)
  const [hookStats, setHookStats] = useState<any>(null)
  const [contentStats, setContentStats] = useState<ContentStats[]>([])
  const router = useRouter()

  useEffect(() => {
    const adminMode = isAdminMode()
    setShowAdmin(adminMode)
    
    if (!adminMode) {
      router.push('/')
    } else {
      loadDashboardData()
    }
  }, [router])

  const loadDashboardData = async () => {
    // Carregar estatísticas do cache
    setCacheStats(cache.getStats())

    // Carregar estatísticas dos hooks
    setHookStats({
      registered: hookManager.getRegisteredHooks().length,
      total: hookManager.getRegisteredHooks().reduce((acc, h) => acc + h.hooks.length, 0)
    })

    // Carregar estatísticas de conteúdo
    const stats: ContentStats[] = []
    
    for (const contentType of CONTENT_TYPES) {
      const iconMap: Record<string, any> = {
        'User': Users,
        'Skull': Skull,
        'Package': Package,
        'BookOpen': BookOpen,
        'FileText': FileText
      }

      const colorMap: Record<string, string> = {
        'npc': 'text-blue-500',
        'monster': 'text-red-500',
        'player': 'text-green-500',
        'item': 'text-yellow-500',
        'session': 'text-purple-500',
        'note': 'text-gray-500'
      }

      try {
        const response = await fetch(`/api/v2/content/${contentType.id}?limit=1`)
        const data = await response.json()
        
        stats.push({
          type: contentType.id,
          name: contentType.pluralName,
          count: data.meta?.total || 0,
          icon: iconMap[contentType.icon || 'FileText'] || FileText,
          color: colorMap[contentType.id] || 'text-gray-500'
        })
      } catch (error) {
        console.error(`Error loading stats for ${contentType.id}:`, error)
        stats.push({
          type: contentType.id,
          name: contentType.pluralName,
          count: 0,
          icon: iconMap[contentType.icon || 'FileText'] || FileText,
          color: colorMap[contentType.id] || 'text-gray-500'
        })
      }
    }

    setContentStats(stats)
  }

  const refreshCache = () => {
    cache.clear()
    setCacheStats(cache.getStats())
    loadDashboardData()
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings className="h-8 w-8 text-gold-primary" />
            <h1 className="text-4xl font-bold">CMS Admin v2</h1>
          </div>
          <Badge variant="outline" className="text-xs">
            Modo Desenvolvimento
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshCache}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">
              Admin v1
            </Link>
          </Button>
        </div>
      </div>

      {/* Status do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Cache</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cacheStats?.enabled ? 'Ativo' : 'Inativo'}
            </div>
            <p className="text-xs text-muted-foreground">
              {cacheStats?.size || 0} itens em cache
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema de Hooks</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hookStats?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {hookStats?.registered || 0} grupos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Conteúdo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contentStats.reduce((acc, stat) => acc + stat.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {contentStats.length} tipos de conteúdo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas de Conteúdo */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas de Conteúdo
          </CardTitle>
          <CardDescription>
            Visão geral de todos os tipos de conteúdo na aplicação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {contentStats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.type} className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <div className="text-sm text-muted-foreground">{stat.name}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Criar Conteúdo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Criar Conteúdo
            </CardTitle>
            <CardDescription>
              Adicione novos elementos à sua campanha usando os formulários otimizados
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {CONTENT_TYPES.map((contentType) => {
              const iconMap: Record<string, any> = {
                'User': Users,
                'Skull': Skull,
                'Package': Package,
                'BookOpen': BookOpen,
                'FileText': FileText
              }
              const Icon = iconMap[contentType.icon || 'FileText'] || FileText

              return (
                <Button
                  key={contentType.id}
                  asChild
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Link href={`/admin/v2/create/${contentType.id}`}>
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{contentType.name}</span>
                  </Link>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        {/* Gerenciar Conteúdo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Gerenciar Conteúdo
            </CardTitle>
            <CardDescription>
              Visualize, edite e organize seu conteúdo existente
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {CONTENT_TYPES.map((contentType) => {
              const iconMap: Record<string, any> = {
                'User': Users,
                'Skull': Skull,
                'Package': Package,
                'BookOpen': BookOpen,
                'FileText': FileText
              }
              const Icon = iconMap[contentType.icon || 'FileText'] || FileText
              const stat = contentStats.find(s => s.type === contentType.id)

              return (
                <Button
                  key={contentType.id}
                  asChild
                  variant="ghost"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Link href={`/admin/v2/manage/${contentType.id}`}>
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{contentType.pluralName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {stat?.count || 0}
                    </Badge>
                  </Link>
                </Button>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Recursos Ativos:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Sistema de cache em memória</li>
                <li>Hooks para automação de tarefas</li>
                <li>Validação baseada em schemas</li>
                <li>Formulários dinâmicos</li>
                <li>API RESTful v2</li>
                <li>Gerenciamento multi-campanha</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Próximos Recursos:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>Sistema de versionamento de conteúdo</li>
                <li>Colaboração em tempo real</li>
                <li>Search & filtros avançados</li>
                <li>Backup automático</li>
                <li>Plugins personalizados</li>
                <li>API GraphQL</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Esta nova interface oferece formulários mais inteligentes, 
              validação em tempo real e melhor performance através do sistema de cache integrado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
