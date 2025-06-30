import { NextRequest, NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { isDevelopment } from '@/lib/dev-utils'
import { getCurrentCampaignIdFromCookies } from '@/lib/campaign-utils'
import { getCampaignContentPath } from '@/lib/mdx'
import matter from 'gray-matter'

export async function POST(request: NextRequest) {
  try {
    // Verificar se estamos em desenvolvimento
    if (!isDevelopment()) {
      return NextResponse.json(
        { error: 'Admin API only available in development' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, name, excludeSlug } = body

    if (!type || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: type, name' },
        { status: 400 }
      )
    }

    // Obter campanha atual
    const campaignId = await getCurrentCampaignIdFromCookies()
    
    // Determinar o tipo de conteúdo e caminho
    let contentType: string
    switch (type) {
      case 'monster':
        contentType = 'characters/monster'
        break
      case 'npc':
        contentType = 'characters/npc'
        break
      case 'player':
        contentType = 'characters/player'
        break
      case 'item':
        contentType = 'items'
        break
      case 'session':
        contentType = 'sessions'
        break
      case 'note':
        contentType = 'notes'
        break
      case 'campaign':
        // Para campanhas, verificar na pasta raiz de content
        const contentDir = path.join(process.cwd(), 'content')
        if (existsSync(contentDir)) {
          const campaigns = await readdir(contentDir)
          const nameExists = campaigns.some(campaign => {
            if (campaign === excludeSlug) return false // Excluir o próprio item
            return campaign.toLowerCase() === name.toLowerCase()
          })
          
          return NextResponse.json({
            exists: nameExists,
            message: nameExists ? 'Já existe uma campanha com este nome' : 'Nome disponível'
          })
        }
        return NextResponse.json({ exists: false, message: 'Nome disponível' })
      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        )
    }

    // Obter caminho do diretório
    const dirPath = await getCampaignContentPath(contentType, campaignId)
    
    if (!existsSync(dirPath)) {
      return NextResponse.json({ exists: false, message: 'Nome disponível' })
    }

    // Ler todos os arquivos do diretório
    const files = await readdir(dirPath)
    const mdFiles = files.filter(file => file.endsWith('.md'))

    // Verificar se algum arquivo tem o mesmo nome
    for (const file of mdFiles) {
      const slug = file.replace('.md', '')
      
      // Pular o próprio arquivo (para edição)
      if (excludeSlug && slug === excludeSlug) continue
      
      const filePath = path.join(dirPath, file)
      const fileContent = await readFile(filePath, 'utf8')
      const { data: frontmatter } = matter(fileContent)
      
      // Verificar nome ou title (para sessões)
      const itemName = frontmatter.name || frontmatter.title || ''
      
      if (itemName.toLowerCase() === name.toLowerCase()) {
        return NextResponse.json({
          exists: true,
          message: `Já existe ${getTypeLabel(type)} com este nome`
        })
      }
    }

    return NextResponse.json({
      exists: false,
      message: 'Nome disponível'
    })

  } catch (error) {
    console.error('Error validating name:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'monster': return 'um monstro'
    case 'npc': return 'um NPC'
    case 'player': return 'um jogador'
    case 'item': return 'um item'
    case 'session': return 'uma sessão'
    case 'note': return 'uma anotação'
    case 'campaign': return 'uma campanha'
    default: return 'um conteúdo'
  }
} 