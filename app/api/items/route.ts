import { NextResponse } from 'next/server'
import { getItems } from '@/lib/mdx'
import { getCampaignIdFromHttpCookies } from '@/lib/campaign-utils'
import { CAMPAIGNS } from '@/lib/campaign-config'

// Marcar explicitamente a rota como dinâmica
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Obter o parâmetro de consulta "campaign", se fornecido
    const url = new URL(request.url)
    const campaignParam = url.searchParams.get('campaign')
    
    // Obter o cookie da campanha atual se o parâmetro não for fornecido
    const cookieHeader = request.headers.get('cookie')
    
    console.log('API Items - Cookie Header:', cookieHeader)
    
    const campaignIdFromCookie = getCampaignIdFromHttpCookies(cookieHeader)
    
    // Usar o parâmetro de consulta, se fornecido, ou o cookie
    const campaignId = campaignParam || campaignIdFromCookie
    
    console.log('API Items - Campaign ID Final:', campaignId)
    
    // Buscar os itens da campanha específica
    const itemsResult = await getItems(campaignId)
    
    // Adicionar o ID da campanha aos metadados dos itens para debugging
    const itemsWithCampaignInfo = itemsResult.map(item => ({
      ...item,
      _debug: {
        loadedFromCampaign: campaignId || 'default',
        allCampaigns: CAMPAIGNS.map(c => c.id),
        requestHadCampaignParam: !!campaignParam
      }
    }))
    
    return NextResponse.json(itemsWithCampaignInfo)
  } catch (error) {
    console.error("Erro ao buscar itens:", error)
    return NextResponse.json({ 
      error: "Erro ao buscar itens",
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

