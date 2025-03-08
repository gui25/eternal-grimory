import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { CAMPAIGNS } from './lib/campaign-config'

// Nome do cookie que armazena a campanha atual
const CAMPAIGN_COOKIE_NAME = 'current-campaign'

// Processa a requisição
export function middleware(request: NextRequest) {
  // Verificar o cookie de campanha atual
  const campaignCookie = request.cookies.get(CAMPAIGN_COOKIE_NAME)
  const campaignId = campaignCookie?.value
  
  let response = NextResponse.next()
  
  // Obter a primeira campanha ativa (default)
  const defaultCampaign = CAMPAIGNS.find(c => c.active)?.id || CAMPAIGNS[0].id
  
  // Se não houver cookie, definir o padrão
  if (!campaignId) {
    response = NextResponse.next()
    
    // Definir cookie
    response.cookies.set({
      name: CAMPAIGN_COOKIE_NAME,
      value: defaultCampaign,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: '/',
      sameSite: 'lax'
    })
  } else {
    // Verificar se a campanha é válida
    const isValidCampaign = CAMPAIGNS.some(campaign => 
      campaign.id === campaignId && campaign.active
    )
    
    // Se a campanha não for válida, redefinir para o padrão
    if (!isValidCampaign) {
      response = NextResponse.next()
      
      response.cookies.set({
        name: CAMPAIGN_COOKIE_NAME,
        value: defaultCampaign,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/',
        sameSite: 'lax'
      })
    } else {
      // Renovar o cookie para manter a sessão ativa
      response.cookies.set({
        name: CAMPAIGN_COOKIE_NAME,
        value: campaignId,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/',
        sameSite: 'lax'
      })
    }
  }
  
  return response
}

// Configuração do middleware para ser executado em todas as rotas
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 