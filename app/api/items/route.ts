import { getItems } from "@/lib/mdx"
import { NextResponse } from "next/server"
import { getCampaignIdFromHttpCookies } from "@/lib/campaign-utils"

export async function GET(request: Request) {
  try {
    // Obter o cookie da campanha atual
    const cookieHeader = request.headers.get('cookie')
    const campaignId = getCampaignIdFromHttpCookies(cookieHeader)
    
    console.log(`API: Buscando itens da campanha: ${campaignId || 'padrão'}`)
    
    // Buscar os itens da campanha específica
    const items = await getItems(campaignId)
    return NextResponse.json(items)
  } catch (error) {
    console.error("Erro ao buscar itens:", error)
    return NextResponse.json({ error: "Erro ao buscar itens" }, { status: 500 })
  }
}

