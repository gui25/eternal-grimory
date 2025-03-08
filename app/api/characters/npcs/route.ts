import { getCharacters } from "@/lib/mdx"
import { NextResponse } from "next/server"
import { getCampaignIdFromHttpCookies } from "@/lib/campaign-utils"

export async function GET(request: Request) {
  try {
    // Obter o cookie da campanha atual
    const cookieHeader = request.headers.get('cookie')
    const campaignId = getCampaignIdFromHttpCookies(cookieHeader)
    
    console.log(`API: Buscando NPCs da campanha: ${campaignId || 'padrão'}`)
    
    // Buscar os NPCs da campanha específica
    const npcs = await getCharacters("npc", campaignId)
    return NextResponse.json(npcs)
  } catch (error) {
    console.error("Erro ao buscar NPCs:", error)
    return NextResponse.json({ error: "Erro ao buscar NPCs" }, { status: 500 })
  }
}

