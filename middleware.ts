import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { CAMPAIGNS } from './lib/campaign-config'

// Nome do cookie que armazena a campanha atual
const CAMPAIGN_COOKIE_NAME = 'current-campaign'

// Processa a requisição
export function middleware(request: NextRequest) {
  console.log("[MIDDLEWARE] Iniciando processamento para:", request.url);
  
  // Verificar se temos um parâmetro de campanha na URL
  const url = request.nextUrl.clone()
  const campaignParam = url.searchParams.get('campaign')
  
  // Verificar o cookie de campanha atual
  const campaignCookie = request.cookies.get(CAMPAIGN_COOKIE_NAME)
  const campaignId = campaignParam || campaignCookie?.value
  
  // Obter a primeira campanha ativa (default)
  const defaultCampaign = CAMPAIGNS.find(c => c.active)?.id || CAMPAIGNS[0].id
  
  // Inicializar a resposta
  let response = NextResponse.next()
  
  console.log(`[MIDDLEWARE] URL: ${url.pathname}, CampaignID (Param/Cookie): ${campaignParam || 'nenhum'}/${campaignCookie?.value || 'nenhum'}`);
  
  // Determinar qual ID de campanha usar
  let effectiveCampaignId = campaignId || defaultCampaign
  
  // Verificar se o ID é válido (campanha existe e está ativa)
  const isValidCampaign = CAMPAIGNS.some(campaign => 
    campaign.id === effectiveCampaignId && campaign.active
  )
  
  if (!isValidCampaign) {
    console.log(`[MIDDLEWARE] Campanha inválida, usando padrão: ${defaultCampaign}`);
    effectiveCampaignId = defaultCampaign
  }
  
  // Sempre definir ou renovar o cookie com a campanha efetiva
  response.cookies.set({
    name: CAMPAIGN_COOKIE_NAME,
    value: effectiveCampaignId,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: '/',
    sameSite: 'lax'
  })
  
  console.log(`[MIDDLEWARE] Cookie definido: ${CAMPAIGN_COOKIE_NAME}=${effectiveCampaignId}`);
  
  // Se estamos na página raiz e não tem parâmetro de campanha, mas temos cookie,
  // redirecione para a mesma URL com o parâmetro de campanha
  if (url.pathname === '/' && !campaignParam && campaignCookie) {
    url.searchParams.set('campaign', effectiveCampaignId)
    return NextResponse.redirect(url)
  }
  
  return response
}

// Função auxiliar para verificar se um ID de campanha é válido
function isValidCampaign(campaignId?: string | null): boolean {
  if (!campaignId) return false
  return CAMPAIGNS.some(campaign => 
    campaign.id === campaignId && campaign.active
  )
}

// Configuração do middleware para ser executado em todas as rotas
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 