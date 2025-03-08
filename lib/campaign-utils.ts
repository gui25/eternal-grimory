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
    if (!cookieHeader) return undefined;
    
    // Parsear os cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    // Obter o valor do cookie da campanha
    const campaignId = cookies[CAMPAIGN_COOKIE_NAME];
    
    // Verificar se a campanha existe e está ativa
    if (campaignId) {
      const campaignExists = CAMPAIGNS.some(c => c.id === campaignId && c.active);
      if (campaignExists) {
        return campaignId;
      }
    }
    
    return undefined;
  } catch (error) {
    console.error("Erro ao extrair ID da campanha dos cookies HTTP:", error);
    return undefined;
  }
} 