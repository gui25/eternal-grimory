import { NextResponse } from 'next/server'
import { getItems } from '@/lib/mdx'
import { getCampaignIdFromHttpCookies } from '@/lib/campaign-utils'
import { CAMPAIGNS } from '@/lib/campaign-config'

// Marcar explicitamente a rota como dinâmica
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verificar se existe um header personalizado com o ID da campanha
    const campaignHeader = request.headers.get('X-Campaign')
    
    // Se o header existir e não estiver vazio, usar esse valor
    let campaignId = campaignHeader && campaignHeader.trim() !== '' 
      ? campaignHeader 
      : undefined;
      
    console.log(`[API-ITEMS] Header X-Campaign: ${campaignHeader || 'não encontrado'}`);
    
    // Se não tiver o header, tentar obter do cookie
    if (!campaignId) {
      const cookieHeader = request.headers.get('cookie')
      campaignId = getCampaignIdFromHttpCookies(cookieHeader)
      console.log(`[API-ITEMS] Cookie campaign: ${campaignId || 'não encontrado'}`);
    }
    
    // Verificar se o campaignId é válido
    if (campaignId) {
      const isValid = CAMPAIGNS.some(c => c.id === campaignId && c.active);
      if (!isValid) {
        console.log(`[API-ITEMS] Campaign ID inválido: ${campaignId}, usando padrão`);
        campaignId = CAMPAIGNS.find(c => c.active)?.id;
      }
    } else {
      // Se não tiver nenhum ID, usar o padrão
      campaignId = CAMPAIGNS.find(c => c.active)?.id;
      console.log(`[API-ITEMS] Nenhum ID de campanha encontrado, usando padrão: ${campaignId}`);
    }
    
    // Buscar os itens da campanha específica
    console.log(`[API-ITEMS] Buscando itens para campanha: ${campaignId}`);
    const items = await getItems(campaignId)
    return NextResponse.json(items)
  } catch (error) {
    console.error('[API-ITEMS] Erro:', error);
    return NextResponse.json({ error: "Erro ao buscar itens" }, { status: 500 })
  }
}

