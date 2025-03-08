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
    
    // Buscar os monstros da campanha específica
    const monsters = await getCharacters("monster", campaignId)
    return NextResponse.json(monsters)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar monstros" }, { status: 500 })
  }
}

