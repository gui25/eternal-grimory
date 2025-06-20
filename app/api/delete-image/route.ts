import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json({ error: 'Nome do arquivo é obrigatório' }, { status: 400 })
    }

    // Validar se o arquivo está na pasta saved-images (segurança)
    if (!filename.startsWith('/saved-images/')) {
      return NextResponse.json({ error: 'Arquivo inválido' }, { status: 400 })
    }

    // Remover /saved-images/ do início para obter apenas o nome do arquivo
    const onlyFilename = filename.replace('/saved-images/', '')
    const filePath = join(process.cwd(), 'public', 'saved-images', onlyFilename)

    // Verificar se arquivo existe
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
    }

    // Deletar arquivo
    await unlink(filePath)

    return NextResponse.json({ 
      success: true, 
      message: 'Imagem removida com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
} 