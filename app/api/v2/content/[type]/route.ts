/**
 * API v2 para gerenciamento de conteúdo
 * GET /api/v2/content/[type] - Listar conteúdo
 * POST /api/v2/content/[type] - Criar conteúdo
 */
import { NextRequest, NextResponse } from 'next/server'
import { contentManager } from '@/lib/cms/content-manager'
import { validateContentType } from '@/lib/cms/config'
import { isDevelopment } from '@/lib/dev-utils'
import { getCurrentCampaignIdFromCookies } from '@/lib/campaign-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    // Verificar se estamos em desenvolvimento para operações admin
    if (!isDevelopment()) {
      return NextResponse.json(
        { 
          success: false,
          error: { 
            code: 'DEVELOPMENT_ONLY',
            message: 'API admin disponível apenas em desenvolvimento' 
          }
        },
        { status: 403 }
      )
    }

    const { type } = await params
    const { searchParams } = new URL(request.url)

    // Validar tipo de conteúdo
    if (!validateContentType(type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CONTENT_TYPE',
            message: `Tipo de conteúdo inválido: ${type}`
          }
        },
        { status: 400 }
      )
    }

    // Obter parâmetros da query
    const campaign = searchParams.get('campaign') || await getCurrentCampaignIdFromCookies()
    const status = searchParams.get('status') as any
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'updated'
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'
    const include = searchParams.get('include')?.split(',').filter(Boolean) || []

    // Buscar conteúdo
    const result = await contentManager.findContent({
      type,
      campaign,
      status,
      tags,
      search,
      limit,
      offset,
      sortBy,
      sortOrder,
      include
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error in GET /api/v2/content/[type]:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor'
        }
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    // Verificar se estamos em desenvolvimento
    if (!isDevelopment()) {
      return NextResponse.json(
        { 
          success: false,
          error: { 
            code: 'DEVELOPMENT_ONLY',
            message: 'API admin disponível apenas em desenvolvimento' 
          }
        },
        { status: 403 }
      )
    }

    const { type } = await params
    const body = await request.json()

    // Validar tipo de conteúdo
    if (!validateContentType(type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CONTENT_TYPE',
            message: `Tipo de conteúdo inválido: ${type}`
          }
        },
        { status: 400 }
      )
    }

    // Validar dados obrigatórios
    if (!body.name && !body.title) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELD',
            message: 'Campo name ou title é obrigatório'
          }
        },
        { status: 400 }
      )
    }

    // Obter campanha atual se não fornecida
    if (!body.campaignId) {
      body.campaignId = await getCurrentCampaignIdFromCookies()
    }

    // Criar conteúdo
    const result = await contentManager.createContent({
      action: 'create',
      type,
      data: body,
      options: {
        skipValidation: body._skipValidation || false,
        skipHooks: body._skipHooks || false
      }
    })

    // Retornar resultado apropriado
    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      const statusCode = result.error?.code === 'VALIDATION_ERROR' ? 400 :
                        result.error?.code === 'CONTENT_EXISTS' ? 409 : 500
      return NextResponse.json(result, { status: statusCode })
    }

  } catch (error) {
    console.error('Error in POST /api/v2/content/[type]:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor'
        }
      },
      { status: 500 }
    )
  }
}
