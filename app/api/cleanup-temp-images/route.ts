import { NextRequest, NextResponse } from 'next/server'
import { readdir, unlink, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const tempDir = join(process.cwd(), 'public', 'temp-images')

    // Verificar se pasta existe
    if (!existsSync(tempDir)) {
      return NextResponse.json({ success: true, message: 'Pasta temporária não existe' })
    }

    // Listar arquivos
    const files = await readdir(tempDir)
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas em ms
    let deletedCount = 0

    for (const file of files) {
      try {
        const filePath = join(tempDir, file)
        const stats = await stat(filePath)
        
        // Se arquivo tem mais de 24 horas, deletar
        if (now - stats.mtime.getTime() > maxAge) {
          await unlink(filePath)
          deletedCount++
        }
      } catch (error) {
        console.error(`Erro ao processar arquivo ${file}:`, error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${deletedCount} arquivos temporários removidos`
    })

  } catch (error) {
    console.error('Erro na limpeza:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
} 