import { NextRequest, NextResponse } from 'next/server'
import { getNotes } from '@/lib/mdx'
import { getCurrentCampaignIdFromCookies } from '@/lib/campaign-utils'

export async function GET(request: NextRequest) {
  try {
    const campaignId = await getCurrentCampaignIdFromCookies()
    const notes = await getNotes(campaignId)
    
    console.log(`API /notes: Buscando anotações da campanha: ${campaignId || 'padrão'}, encontradas: ${notes.length}`)
    
    return NextResponse.json(notes)
  } catch (error) {
    console.error('Erro ao buscar anotações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 