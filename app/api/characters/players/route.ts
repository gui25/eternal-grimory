import { getCharacters } from "@/lib/mdx"
import { NextResponse } from "next/server"
import { CAMPAIGN_COOKIE_NAME, CAMPAIGNS } from "@/lib/campaign-config"

export async function GET(request: Request) {
  try {
    // Obter o cookie da campanha atual
    const cookieHeader = request.headers.get('cookie')
    let campaignId: string | undefined = undefined
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      }, {} as Record<string, string>)
      
      const cookieValue = cookies[CAMPAIGN_COOKIE_NAME]
      if (cookieValue) {
        campaignId = cookieValue
      }
    }
    
    // Verificar se a campanha existe e está ativa
    if (campaignId) {
      const campaignExists = CAMPAIGNS.some(c => c.id === campaignId && c.active)
      if (!campaignExists) {
        campaignId = undefined
      }
    }
    
    console.log(`API: Buscando jogadores da campanha: ${campaignId || 'padrão'}`)
    
    // Buscar os jogadores da campanha específica
    const players = await getCharacters("player", campaignId)
    return NextResponse.json(players)
  } catch (error) {
    console.error("Erro ao buscar personagens:", error)
    return NextResponse.json({ error: "Erro ao buscar personagens" }, { status: 500 })
  }
}

