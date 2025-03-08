import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { CAMPAIGNS } from './lib/campaign-config'

// Nome do cookie que armazena a campanha atual
const CAMPAIGN_COOKIE_NAME = 'current-campaign'

export function middleware(request: NextRequest) {
  // Debug - registrar a URL que está sendo processada
  console.log(`Middleware processando: ${request.url}`)
  
  // Obtém a resposta para passar adiante
  const response = NextResponse.next()

  // Tenta obter a campanha do cookie
  const campaignId = request.cookies.get(CAMPAIGN_COOKIE_NAME)?.value
  console.log(`Cookie de campanha encontrado: ${campaignId || 'nenhum'}`)

  // Se não tiver o cookie de campanha, define a campanha padrão
  if (!campaignId) {
    // Obtém a primeira campanha ativa
    const defaultCampaign = CAMPAIGNS.find(c => c.active)?.id || CAMPAIGNS[0].id
    console.log(`Definindo cookie para campanha padrão: ${defaultCampaign}`)
    
    // Define o cookie com a campanha padrão
    response.cookies.set({
      name: CAMPAIGN_COOKIE_NAME,
      value: defaultCampaign,
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 ano
      sameSite: 'lax',
    })
  } else {
    // Verifica se a campanha ainda existe e está ativa
    const campaignExists = CAMPAIGNS.some(c => c.id === campaignId && c.active)
    
    // Se a campanha não existir mais ou estiver inativa, redefine para a padrão
    if (!campaignExists) {
      const defaultCampaign = CAMPAIGNS.find(c => c.active)?.id || CAMPAIGNS[0].id
      console.log(`Campanha inválida, redefinindo para: ${defaultCampaign}`)
      
      response.cookies.set({
        name: CAMPAIGN_COOKIE_NAME,
        value: defaultCampaign,
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
    } else {
      // Garantir que o cookie seja renovado a cada requisição
      console.log(`Renovando cookie para campanha: ${campaignId}`)
      response.cookies.set({
        name: CAMPAIGN_COOKIE_NAME,
        value: campaignId,
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
    }
  }

  return response
}

// Configuração do middleware para ser executado em todas as rotas
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 