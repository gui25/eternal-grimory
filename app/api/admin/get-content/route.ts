import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { isDevelopment } from '@/lib/dev-utils'
import { getCurrentCampaignIdFromCookies } from '@/lib/campaign-utils'
import { getCampaignContentPath } from '@/lib/mdx'
import matter from 'gray-matter'

export async function GET(request: NextRequest) {
  try {
    // Verificar se estamos em desenvolvimento
    if (!isDevelopment()) {
      return NextResponse.json(
        { error: 'Admin API only available in development' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const slug = searchParams.get('slug')

    if (!type || !slug) {
      return NextResponse.json(
        { error: 'Missing required parameters: type, slug' },
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
      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        )
    }

    // Obter caminho do arquivo
    const dirPath = await getCampaignContentPath(contentType, campaignId)
    const filePath = path.join(dirPath, `${slug}.md`)
    
    // Verificar se o arquivo existe
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Ler e processar o arquivo
    const fileContent = await readFile(filePath, 'utf8')
    const { data: frontmatter, content } = matter(fileContent)

    // Processar dados específicos por tipo
    let processedData: any = {
      name: frontmatter.name || frontmatter.title || '',
      slug: frontmatter.slug || slug,
      content: content,
      image: frontmatter.image || '',
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.join(', ') : ''
    }

    switch (type) {
      case 'monster':
        processedData = {
          ...processedData,
          type: frontmatter.type || 'Monstro',
          challenge: frontmatter.challenge || '1'
        }
        break
      
      case 'npc':
        processedData = {
          ...processedData,
          type: frontmatter.type || 'NPC',
          affiliation: frontmatter.affiliation || '',
          description: frontmatter.description || ''
        }
        break
      
      case 'player':
        processedData = {
          ...processedData,
          player: frontmatter.player || '',
          class: frontmatter.class || 'Guerreiro',
          race: frontmatter.race || 'Humano',
          level: frontmatter.level || 1,
          description: frontmatter.description || ''
        }
        break
      
      case 'item':
        processedData = {
          ...processedData,
          type: frontmatter.type || 'Item',
          rarity: frontmatter.rarity || 'Comum',
          description: frontmatter.description || ''
        }
        break
      
      case 'session':
        processedData = {
          ...processedData,
          name: frontmatter.title || '', // Sessions use 'title'
          date: frontmatter.date || new Date().toISOString().split('T')[0],
          session_number: frontmatter.session_number || 1,
          players: Array.isArray(frontmatter.players) ? frontmatter.players.join(', ') : ''
        }
        break
    }

    return NextResponse.json({
      success: true,
      data: processedData,
      originalSlug: slug
    })

  } catch (error) {
    console.error('Error getting content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 