/**
 * Página de criação de conteúdo usando formulário dinâmico
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DynamicForm } from '@/components/cms/dynamic-form'
import { useCMSMutation } from '@/hooks/use-cms-content'
import { getContentType } from '@/lib/cms/config'
import { isAdminMode } from '@/lib/dev-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

interface CreateContentPageProps {
  params: {
    type: string
  }
}

export default function CreateContentPage({ params }: CreateContentPageProps) {
  const { type } = params
  const router = useRouter()
  const [showAdmin, setShowAdmin] = useState(false)

  const contentType = getContentType(type)
  const { create, isLoading, error } = useCMSMutation(type, {
    onSuccess: (data) => {
      // Redirecionar para a página do item criado ou lista
      if (data?.slug) {
        router.push(`${contentType?.routePath}/${data.slug}`)
      } else {
        router.push(`/admin/v2/manage/${type}`)
      }
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

  const handleSubmit = async (data: any) => {
    return await create(data)
  }

  const handleCancel = () => {
    router.push('/admin/v2')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Navegação */}
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/v2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Plus className="h-6 w-6 text-gold-primary" />
          <h1 className="text-3xl font-bold">Criar {contentType.name}</h1>
        </div>
      </div>

      {/* Informações sobre o tipo de conteúdo */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{contentType.name}</CardTitle>
          <CardDescription>
            {contentType.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>📁 Categoria: {contentType.category}</span>
            <span>🔗 Rota: {contentType.routePath}</span>
            <span>📊 Campos: {contentType.schema.fields.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Formulário dinâmico */}
      <DynamicForm
        contentType={type}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitText={`Criar ${contentType.name}`}
        showPreview={true}
        disabled={isLoading}
      />

      {/* Erro global */}
      {error && (
        <Card className="mt-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Informações de ajuda */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">💡 Dicas de Uso</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ul className="list-disc list-inside space-y-1">
            <li>Campos marcados com * são obrigatórios</li>
            <li>O slug será gerado automaticamente a partir do nome</li>
            <li>Use Markdown para formatação no campo de conteúdo</li>
            <li>Tags podem ser selecionadas múltiplas usando o seletor</li>
            <li>A validação acontece em tempo real conforme você digita</li>
          </ul>
          
          <div className="pt-4 border-t">
            <p>
              📖 <strong>Sobre Markdown:</strong> Você pode usar formatação como **negrito**, 
              *itálico*, ## Cabeçalhos, listas e muito mais.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
