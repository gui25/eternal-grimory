/**
 * API v2 para gerenciamento de conteúdo específico
 * GET /api/v2/content/[type]/[slug] - Obter conteúdo específico
 * PUT /api/v2/content/[type]/[slug] - Atualizar conteúdo
 * DELETE /api/v2/content/[type]/[slug] - Deletar conteúdo
 */
import { NextRequest, NextResponse } from 'next/server'
import { contentManager } from '@/lib/cms/content-manager'
import { validateContentType } from '@/lib/cms/config'
import { isDevelopment } from '@/lib/dev-utils'
import { getCurrentCampaignIdFromCookies } from '@/lib/campaign-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  try {
    const { type, slug } = await params
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

    // Obter parâmetros
    const campaign = searchParams.get('campaign') || await getCurrentCampaignIdFromCookies()
    const includeContent = searchParams.get('includeContent') !== 'false'

    // Buscar conteúdo
    const result = await contentManager.getContent(type, slug, campaign, includeContent)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      const statusCode = result.error?.code === 'CONTENT_NOT_FOUND' ? 404 : 500
      return NextResponse.json(result, { status: statusCode })
    }

  } catch (error) {
    console.error('Error in GET /api/v2/content/[type]/[slug]:', error)
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
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

    const { type, slug } = await params
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

    // Garantir que o slug está nos dados
    body.slug = slug

    // Obter campanha atual se não fornecida
    if (!body.campaignId) {
      body.campaignId = await getCurrentCampaignIdFromCookies()
    }

    // Atualizar conteúdo
    const result = await contentManager.updateContent({
      action: 'update',
      type,
      data: body,
      options: {
        skipValidation: body._skipValidation || false,
        skipHooks: body._skipHooks || false
      }
    })

    if (result.success) {
      return NextResponse.json(result)
    } else {
      const statusCode = result.error?.code === 'VALIDATION_ERROR' ? 400 :
                        result.error?.code === 'CONTENT_NOT_FOUND' ? 404 : 500
      return NextResponse.json(result, { status: statusCode })
    }

  } catch (error) {
    console.error('Error in PUT /api/v2/content/[type]/[slug]:', error)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; slug: string }> }
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

    const { type, slug } = await params
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

    // Obter campanha
    const campaign = searchParams.get('campaign') || await getCurrentCampaignIdFromCookies()

    // Deletar conteúdo
    const result = await contentManager.deleteContent(type, slug, campaign)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      const statusCode = result.error?.code === 'CONTENT_NOT_FOUND' ? 404 : 500
      return NextResponse.json(result, { status: statusCode })
    }

  } catch (error) {
    console.error('Error in DELETE /api/v2/content/[type]/[slug]:', error)
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
