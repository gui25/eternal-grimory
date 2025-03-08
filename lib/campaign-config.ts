export type CampaignInfo = {
  id: string;
  name: string;
  description: string;
  contentPath: string;
  theme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  dmName?: string;
  active: boolean;
}

export const CAMPAIGNS: CampaignInfo[] = [
  {
    id: "penumbra-eterna",
    name: "Penumbra Eterna",
    description: "A campanha original onde sombras antigas retornam para ameaçar o mundo.",
    contentPath: "penumbra-eterna",
    theme: {
      primary: "gold",
      secondary: "wine-dark",
      accent: "red-accent"
    },
    dmName: "Mestre Guilherme",
    active: true
  },
  {
    id: "sessao-teste",
    name: "Sessão de Teste",
    description: "Uma campanha de teste para demonstrar a funcionalidade de múltiplas campanhas.",
    contentPath: "sessao-teste",
    theme: {
      primary: "blue-400", 
      secondary: "slate-800",
      accent: "emerald-400"
    },
    dmName: "Mestre de Teste",
    active: true
  }
];

// Nome do cookie e chave do localStorage
export const CAMPAIGN_COOKIE_NAME = 'current-campaign';
export const CAMPAIGN_LOCAL_STORAGE_KEY = 'current-campaign';

/**
 * Obtém o ID da campanha atualmente selecionada
 * @returns ID da campanha atual
 */
export function getCurrentCampaignId(): string {
  // Obtém a primeira campanha ativa como padrão
  const defaultCampaign = CAMPAIGNS.find(c => c.active)?.id || CAMPAIGNS[0].id
  
  // Verificar se estamos no servidor
  if (typeof window === 'undefined') {
    // No servidor, não temos acesso direto aos cookies, retornar o padrão
    return defaultCampaign;
  } else {
    // No cliente, podemos usar localStorage e cookies
    try {
      // Tentar obter do localStorage primeiro (é mais direto)
      const fromLocalStorage = localStorage.getItem(CAMPAIGN_LOCAL_STORAGE_KEY)
      
      // Verificar localStorage
      if (fromLocalStorage) {
        const isValid = CAMPAIGNS.some(c => 
          c.id === fromLocalStorage && c.active
        )
        
        if (isValid) {
          return fromLocalStorage
        }
      }
      
      // Tentar obter do cookie do lado do cliente
      const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      
      const fromCookies = cookies[CAMPAIGN_COOKIE_NAME];
      
      // Verificar cookie
      if (fromCookies) {
        const isValid = CAMPAIGNS.some(c => 
          c.id === fromCookies && c.active
        )
        
        if (isValid) {
          return fromCookies
        }
      }
      
      // Se não encontrou nada válido, retorna o padrão
      return defaultCampaign
    } catch (error) {
      // Em caso de erro, usa a campanha padrão
      return defaultCampaign
    }
  }
}

// Get campaign by ID
export function getCampaignById(id: string): CampaignInfo | undefined {
  return CAMPAIGNS.find(c => c.id === id);
}

/**
 * Altera a campanha atual e recarrega a página 
 * @param id ID da campanha
 */
export function setCurrentCampaign(id: string) {
  // Verificar se o ID é válido
  const campaign = getCampaignById(id)
  if (!campaign || !campaign.active) {
    throw new Error(`Campanha inválida: ${id}`)
  }
  
  try {
    // Guarda no localStorage para persistência entre sessões
    if (typeof window !== 'undefined') {
      localStorage.setItem(CAMPAIGN_LOCAL_STORAGE_KEY, id)
      
      // Define o cookie (mesmo no cliente, para consistência)
      document.cookie = `${CAMPAIGN_COOKIE_NAME}=${id}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
    }
    
    // Recarregar a página para aplicar a mudança
    window.location.reload()
  } catch (error) {
    // Ignora erros - apenas não vai persistir
  }
} 