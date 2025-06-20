import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getCurrentCampaignIdFromCookies } from '@/lib/campaign-utils'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const type: string = data.get('type') as string // session, item, monster, npc, player
    const slug: string = data.get('slug') as string
    const isTemporary: boolean = data.get('temporary') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (!type || !slug) {
      return NextResponse.json({ error: 'Tipo e slug são obrigatórios' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP' 
      }, { status: 400 })
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Máximo 5MB' 
      }, { status: 400 })
    }

    // Obter campanha atual
    const campaignId = await getCurrentCampaignIdFromCookies()
    if (!campaignId) {
      return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 400 })
    }

    // Criar nome do arquivo com timestamp para evitar conflitos
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${campaignId}_${type}_${slug}_${timestamp}.${extension}`

    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determinar pasta (temp ou definitiva)
    const folder = isTemporary ? 'temp-images' : 'saved-images'
    const uploadDir = join(process.cwd(), 'public', folder)
    
    // Criar pasta se não existir
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Salvar arquivo
    const uploadPath = join(uploadDir, filename)
    await writeFile(uploadPath, buffer)

    // Retornar URL da imagem
    const imageUrl = `/${folder}/${filename}`

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      filename,
      temporary: isTemporary
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
} 