'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { isAdminMode } from '@/lib/dev-utils'
import { Skull, User, Package, BookOpen, Settings, Plus, FileText, Folder } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [showAdmin, setShowAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const adminMode = isAdminMode()
    setShowAdmin(adminMode)
    
    // Redirecionar se não estiver em modo admin
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

  const createOptions = [
    {
      title: 'Criar Monstro',
      description: 'Adicionar um novo monstro à campanha',
      icon: Skull,
      href: '/admin/create/monster',
      color: 'text-red-accent'
    },
    {
      title: 'Criar NPC',
      description: 'Adicionar um novo personagem não-jogador',
      icon: User,
      href: '/admin/create/npc',
      color: 'text-gold-light'
    },
    {
      title: 'Criar Player',
      description: 'Adicionar um novo personagem jogador',
      icon: User,
      href: '/admin/create/player',
      color: 'text-gold-light'
    },
    {
      title: 'Criar Item',
      description: 'Adicionar um novo item mágico ou equipamento',
      icon: Package,
      href: '/admin/create/item',
      color: 'text-gold-primary'
    },
    {
      title: 'Criar Sessão',
      description: 'Documentar uma nova sessão de jogo',
      icon: BookOpen,
      href: '/admin/create/session',
      color: 'text-gold-primary'
    }
  ]

  const quickActions = [
    {
      title: 'Gerenciar Campanhas',
      href: '/admin/campaigns',
      icon: Folder
    },
    {
      title: 'Ver Monstros',
      href: '/characters/monsters',
      icon: Skull
    },
    {
      title: 'Ver NPCs',
      href: '/characters/npcs',
      icon: User
    },
    {
      title: 'Ver Players',
      href: '/characters/players',
      icon: User
    },
    {
      title: 'Ver Itens',
      href: '/items',
      icon: Package
    },
    {
      title: 'Ver Sessões',
      href: '/sessions',
      icon: BookOpen
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Settings className="h-8 w-8 text-gold-primary" />
          <h1 className="text-4xl font-bold">Painel de Administração</h1>
        </div>
      </div>

      <div className="mb-8 p-4 bg-gold-primary/10 border border-gold-primary/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-5 w-5 text-gold-primary" />
          <span className="font-medium text-gold-primary">Modo Desenvolvimento Ativo</span>
        </div>
        <p className="text-sm text-gold-light">
          Você está no modo de desenvolvimento local. Todas as alterações serão salvas nos arquivos locais.
          Lembre-se de fazer commit das mudanças quando estiver satisfeito com o resultado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Criar Conteúdo
            </CardTitle>
            <CardDescription>
              Adicione novos elementos à sua campanha
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {createOptions.map((option) => (
              <Button
                key={option.href}
                asChild
                variant="outline"
                className="w-full justify-start h-auto p-4"
              >
                <Link href={option.href}>
                  <option.icon className={`h-5 w-5 mr-3 ${option.color}`} />
                  <div className="text-left">
                    <div className="font-medium">{option.title}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Acesso Rápido
            </CardTitle>
            <CardDescription>
              Navegue rapidamente para as seções principais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button
                key={action.href}
                asChild
                variant="ghost"
                className="w-full justify-start"
              >
                <Link href={action.href}>
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.title}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Como funciona:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Os arquivos são criados na campanha atualmente ativa</li>
              <li>Todos os arquivos são salvos em formato Markdown (.md)</li>
              <li>As alterações ficam apenas no seu computador local</li>
              <li>Use Git para fazer commit e push das mudanças quando estiver pronto</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Estrutura de arquivos:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><code>content/[campanha]/characters/monster/</code> - Monstros</li>
              <li><code>content/[campanha]/characters/npc/</code> - NPCs</li>
              <li><code>content/[campanha]/items/</code> - Itens</li>
              <li><code>content/[campanha]/sessions/</code> - Sessões</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 