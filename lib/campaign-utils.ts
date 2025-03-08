import { cookies } from "next/headers";
import { CAMPAIGN_COOKIE_NAME, CAMPAIGNS } from "@/lib/campaign-config";

/**
 * Obtém o ID da campanha atual a partir dos cookies.
 * Verifica se a campanha existe e está ativa.
 * Retorna undefined se nenhuma campanha válida for encontrada.
 */
export function getCurrentCampaignIdFromCookies(): string | undefined {
  try {
    // Obter o cookie da campanha atual
    const cookieStore = cookies();
    const campaignId = cookieStore.get(CAMPAIGN_COOKIE_NAME)?.value;
    
    // Verificar se a campanha existe e está ativa
    if (campaignId) {
      const campaignExists = CAMPAIGNS.some(c => c.id === campaignId && c.active);
      if (campaignExists) {
        return campaignId;
      }
    }
    
    // Se não tiver uma campanha válida, retornar undefined
    return undefined;
  } catch (error) {
    console.error("Erro ao obter ID da campanha dos cookies:", error);
    return undefined;
  }
}

/**
 * Extrai o ID da campanha dos cookies HTTP no contexto de API/Route Handler.
 * @param cookieHeader O header Cookie da requisição
 */
export function getCampaignIdFromHttpCookies(cookieHeader: string | null): string | undefined {
  try {
    if (!cookieHeader) {
      console.log('getCampaignIdFromHttpCookies: Cookie header is null');
      return undefined;
    }
    
    // Debugging
    console.log('getCampaignIdFromHttpCookies - Cookie Header:', cookieHeader);
    
    // Parsear os cookies
    const cookies: Record<string, string> = {};
    
    // Dividir a string de cookies e processá-los um por um
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        cookies[key] = value;
      }
    });
    
    // Log dos cookies parseados para debug
    console.log('getCampaignIdFromHttpCookies - Parsed Cookies:', cookies);
    
    // Tentar encontrar o cookie da campanha diretamente
    let campaignId = cookies[CAMPAIGN_COOKIE_NAME];
    
    // Se não encontrar, tentar outra abordagem (alguns navegadores/frameworks podem ter formatos diferentes)
    if (!campaignId) {
      // Procurar o cookie usando regex
      const regex = new RegExp(`${CAMPAIGN_COOKIE_NAME}=([^;]+)`);
      const match = cookieHeader.match(regex);
      if (match && match[1]) {
        campaignId = match[1];
        console.log('getCampaignIdFromHttpCookies - Found via regex:', campaignId);
      }
    }
    
    // Verificar se a campanha existe e está ativa
    if (campaignId) {
      const campaignExists = CAMPAIGNS.some(c => c.id === campaignId && c.active);
      
      console.log(`getCampaignIdFromHttpCookies - Campaign ${campaignId} exists: ${campaignExists}`);
      
      if (campaignExists) {
        return campaignId;
      }
    }
    
    console.log('getCampaignIdFromHttpCookies - No valid campaign found');
    return undefined;
  } catch (error) {
    console.error("Erro ao extrair ID da campanha dos cookies HTTP:", error);
    return undefined;
  }
} 