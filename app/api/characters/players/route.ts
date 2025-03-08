import { getCharacters } from "@/lib/mdx"
import { NextResponse } from "next/server"
import { getCampaignIdFromHttpCookies } from "@/lib/campaign-utils"

// Marcar explicitamente a rota como dinâmica
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Obter o cookie da campanha atual
    const cookieHeader = request.headers.get('cookie')
    const campaignId = getCampaignIdFromHttpCookies(cookieHeader)
    
    console.log(`API: Buscando jogadores da campanha: ${campaignId || 'padrão'}`)
    
    // Buscar os jogadores da campanha específica
    const players = await getCharacters("player", campaignId)
    return NextResponse.json(players)
  } catch (error) {
    console.error("Erro ao buscar personagens:", error)
    return NextResponse.json({ error: "Erro ao buscar personagens" }, { status: 500 })
  }
}

