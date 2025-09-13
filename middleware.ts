import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { CAMPAIGNS } from './lib/campaign-config'

// Nome do cookie que armazena a campanha atual
const CAMPAIGN_COOKIE_NAME = 'current-campaign'

// Processa a requisição
export function middleware(request: NextRequest) {
  console.log("[MIDDLEWARE] Iniciando processamento para:", request.url);
  
  // Verificar se é uma rota de admin (incluindo API v2)
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/api/admin') ||
      request.nextUrl.pathname.startsWith('/api/v2')) {
    // Só permitir em desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      console.log("[MIDDLEWARE] Bloqueando acesso a rota de admin em produção");
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  // Verificar o cookie de campanha atual
  const campaignCookie = request.cookies.get(CAMPAIGN_COOKIE_NAME)
  const campaignId = campaignCookie?.value
  
  // Inicializar a resposta
  let response = NextResponse.next()
  
  console.log(`[MIDDLEWARE] URL: ${request.nextUrl.pathname}, CampaignID (Cookie): ${campaignCookie?.value || 'nenhum'}`);
  
  // Obter a primeira campanha ativa (default)
  const defaultCampaign = CAMPAIGNS.find(c => c.active)?.id || CAMPAIGNS[0].id
  
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
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: '/',
    sameSite: 'lax'
  })
  
  console.log(`[MIDDLEWARE] Cookie definido: ${CAMPAIGN_COOKIE_NAME}=${effectiveCampaignId}`);
  
  // Retorna a resposta sem modificar a URL
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Include API routes so we can check admin access
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 