import { NextResponse } from 'next/server'
import { getItems } from '@/lib/mdx'
import { getCampaignIdFromHttpCookies } from '@/lib/campaign-utils'

// Marcar explicitamente a rota como dinâmica
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Obter o cookie da campanha atual
    const cookieHeader = request.headers.get('cookie')
    const campaignId = getCampaignIdFromHttpCookies(cookieHeader)
    
    // Buscar os itens da campanha específica
    const items = await getItems(campaignId)
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar itens" }, { status: 500 })
  }
}

