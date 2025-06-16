import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { isDevelopment } from '@/lib/dev-utils'
import { getCurrentCampaignIdFromCookies } from '@/lib/campaign-utils'
import { getCampaignContentPath } from '@/lib/mdx'
import matter from 'gray-matter'

// Só permitir em desenvolvimento
if (!isDevelopment()) {
  throw new Error('Admin API only available in development')
}

export async function PUT(request: NextRequest) {
  try {
    // Verificar se estamos em desenvolvimento
    if (!isDevelopment()) {
      return NextResponse.json(
        { error: 'Admin API only available in development' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, slug, name, content, metadata, originalSlug } = body

    if (!type || !slug || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: type, slug, name' },
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

    // Obter caminho do diretório
    const dirPath = await getCampaignContentPath(contentType, campaignId)
    
    // Usar originalSlug se fornecido (para casos onde o slug mudou)
    const fileSlug = originalSlug || slug
    const filePath = path.join(dirPath, `${fileSlug}.md`)
    
    // Verificar se o arquivo existe
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Se o slug mudou, precisamos renomear o arquivo
    const newFilePath = path.join(dirPath, `${slug}.md`)
    const slugChanged = originalSlug && originalSlug !== slug

    // Criar frontmatter atualizado
    const frontmatter = createFrontmatter(type, name, metadata)
    const fileContent = `${frontmatter}\n${content}`

    // Escrever o arquivo
    await writeFile(newFilePath, fileContent, 'utf8')

    // Se o slug mudou, deletar o arquivo antigo
    if (slugChanged && filePath !== newFilePath) {
      const fs = await import('fs/promises')
      try {
        await fs.unlink(filePath)
      } catch (error) {
        console.warn('Could not delete old file:', error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${type} updated successfully`,
      slug: slug
    })

  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function createFrontmatter(type: string, name: string, metadata: any): string {
  const baseData = {
    name,
    slug: metadata.slug || generateSlug(name),
    updated: new Date().toISOString()
  }

  let frontmatterData: any = {}

  switch (type) {
    case 'monster':
      frontmatterData = {
        ...baseData,
        type: metadata.type || 'Monstro',
        challenge: metadata.challenge || '1',
        tags: metadata.tags || [],
        image: metadata.image || ''
      }
      break
    
    case 'npc':
      frontmatterData = {
        ...baseData,
        type: metadata.type || 'NPC',
        affiliation: metadata.affiliation || '',
        tags: metadata.tags || [],
        image: metadata.image || ''
      }
      break
    
    case 'player':
      frontmatterData = {
        ...baseData,
        player: metadata.player || '',
        class: metadata.class || 'Guerreiro',
        race: metadata.race || 'Humano',
        level: metadata.level || 1,
        tags: metadata.tags || [],
        image: metadata.image || ''
      }
      break
    
    case 'item':
      frontmatterData = {
        ...baseData,
        type: metadata.type || 'Item',
        rarity: metadata.rarity || 'Comum',
        tags: metadata.tags || [],
        image: metadata.image || ''
      }
      break
    
    case 'session':
      frontmatterData = {
        ...baseData,
        title: name, // Sessions use 'title' instead of 'name'
        date: metadata.date || new Date().toISOString().split('T')[0],
        session_number: metadata.session_number || 1,
        players: metadata.players || [],
        tags: metadata.tags || [],
        image: metadata.image || ''
      }
      delete frontmatterData.name // Remove 'name' for sessions
      break
    
    default:
      frontmatterData = baseData
  }

  // Convert to YAML frontmatter
  let frontmatter = '---\n'
  for (const [key, value] of Object.entries(frontmatterData)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          frontmatter += `${key}: [${value.map(v => `"${v}"`).join(', ')}]\n`
        }
      } else {
        frontmatter += `${key}: "${value}"\n`
      }
    }
  }
  frontmatter += '---'
  
  return frontmatter
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
} 