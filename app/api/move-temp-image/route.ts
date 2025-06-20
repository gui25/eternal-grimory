import { NextRequest, NextResponse } from 'next/server'
import { rename, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const { tempUrl } = await request.json()

    if (!tempUrl || !tempUrl.startsWith('/temp-images/')) {
      return NextResponse.json({ error: 'URL temporária inválida' }, { status: 400 })
    }

    // Extrair nome do arquivo
    const filename = tempUrl.replace('/temp-images/', '')
    
    // Caminhos
    const tempPath = join(process.cwd(), 'public', 'temp-images', filename)
    const savedDir = join(process.cwd(), 'public', 'saved-images')
    const savedPath = join(savedDir, filename)

    // Verificar se arquivo temporário existe
    if (!existsSync(tempPath)) {
      return NextResponse.json({ error: 'Arquivo temporário não encontrado' }, { status: 404 })
    }

    // Criar pasta saved-images se não existir
    if (!existsSync(savedDir)) {
      await mkdir(savedDir, { recursive: true })
    }

    // Mover arquivo de temp para saved
    await rename(tempPath, savedPath)

    // Retornar nova URL
    const permanentUrl = `/saved-images/${filename}`

    return NextResponse.json({ 
      success: true, 
      imageUrl: permanentUrl,
      filename 
    })

  } catch (error) {
    console.error('Erro ao mover imagem:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
} 