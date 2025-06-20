import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getCampaignContentPath } from '@/lib/mdx'
import { getCurrentCampaignIdFromCookies } from '@/lib/campaign-utils'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const slug = searchParams.get('slug')
    const campaignId = searchParams.get('campaignId')

    if (!type || !slug || !campaignId) {
      return NextResponse.json(
        { error: 'Tipo, slug e campaignId são obrigatórios' },
        { status: 400 }
      )
    }

    // Mapear tipos para caminhos
    const typeToPath: Record<string, string> = {
      'player': 'characters/player',
      'npc': 'characters/npc', 
      'monster': 'characters/monster',
      'item': 'items',
      'session': 'sessions'
    }

    const contentPath = typeToPath[type]
    if (!contentPath) {
      return NextResponse.json(
        { error: 'Tipo inválido' },
        { status: 400 }
      )
    }

    // Obter campanha atual se não fornecida
    const currentCampaignId = campaignId || await getCurrentCampaignIdFromCookies()
    
    // Obter o caminho da campanha
    const campaignPath = await getCampaignContentPath(contentPath, currentCampaignId)
    const filePath = path.join(campaignPath, `${slug}.md`)

    // Verificar se o arquivo existe
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      )
    }

    // Deletar o arquivo
    await fs.unlink(filePath)

    // Se for um tipo com imagem, tentar deletar a imagem associada
    if (['player', 'npc', 'monster', 'item'].includes(type)) {
      try {
        // Ler o conteúdo do arquivo antes de deletar para obter a imagem
        const savedImagesDir = path.join(process.cwd(), 'public', 'saved-images')
        const files = await fs.readdir(savedImagesDir)
        
        // Procurar por arquivos que correspondam ao padrão: campaignId_type_slug_*
        const imagePattern = `${campaignId}_${type}_${slug}_`
        const imageFiles = files.filter(file => file.startsWith(imagePattern))
        
        // Deletar todas as imagens encontradas
        for (const imageFile of imageFiles) {
          const imagePath = path.join(savedImagesDir, imageFile)
          await fs.unlink(imagePath)
        }
      } catch (error) {
        // Se falhar ao deletar imagens, continua - o arquivo principal já foi deletado
        console.log('Erro ao deletar imagens associadas:', error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${type} deletado com sucesso` 
    })

  } catch (error) {
    console.error('Erro ao deletar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 