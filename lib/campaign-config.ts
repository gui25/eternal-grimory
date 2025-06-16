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
  },
  {
    id: "teste",
    name: "Teste",
    description: "Teste",
    contentPath: "teste",
    theme: {
      primary: "gold",
      secondary: "wine-dark",
      accent: "red-accent"
    },
    dmName: "Teste",
    active: true
  }
];

export const CAMPAIGN_COOKIE_NAME = 'current-campaign';
export const CAMPAIGN_LOCAL_STORAGE_KEY = 'current-campaign';


export function getCurrentCampaignId(): string {
  const defaultCampaign = CAMPAIGNS.find(c => c.active)?.id || CAMPAIGNS[0].id
  
  if (typeof window === 'undefined') {
    return defaultCampaign;
  } else {
    try {
      const fromLocalStorage = localStorage.getItem(CAMPAIGN_LOCAL_STORAGE_KEY)
      
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
  
  console.log(`[CAMPANHA] Alterando para: ${id}, caminho: ${campaign.contentPath}`);
  
  try {
    if (typeof window !== 'undefined') {
      const recentViewsKey = 'recently-viewed-items';
      const recentActivityKey = 'recent-activity';
      
      const recentViews = localStorage.getItem(recentViewsKey);
      const recentActivity = localStorage.getItem(recentActivityKey);
      
      localStorage.removeItem(CAMPAIGN_LOCAL_STORAGE_KEY);
      localStorage.removeItem(CAMPAIGN_COOKIE_NAME);
      
      localStorage.setItem(CAMPAIGN_LOCAL_STORAGE_KEY, id);
      console.log(`[CAMPANHA] localStorage definido para: ${id}`);
      
      // Restaurar atividades recentes se existirem
      if (recentViews) localStorage.setItem(recentViewsKey, recentViews);
      if (recentActivity) localStorage.setItem(recentActivityKey, recentActivity);
      
      // Define o cookie (mesmo no cliente, para consistência)
      document.cookie = `${CAMPAIGN_COOKIE_NAME}=${id}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      console.log(`[CAMPANHA] Cookie definido: ${CAMPAIGN_COOKIE_NAME}=${id}`);
      
      // Usar sessionStorage também
      sessionStorage.setItem('campaign', id);
      
      // Verificar se estamos em uma subpágina que não é do sidebar
      const pathname = window.location.pathname;
      const pathSegments = pathname.split('/').filter(Boolean);
      
      // Páginas principais do sidebar que devem apenas recarregar, sem redirecionar
      const mainPages = ['', 'items', 'sessions', 'characters', 'npcs', 'players', 'monsters'];
      
      // Se tiver mais de um segmento (ex: /items/sword) e não for uma das páginas principais do sidebar
      const isDetailPage = pathSegments.length > 1 && !mainPages.includes(pathSegments[0]);
      
      if (isDetailPage) {
        // Se for uma página de detalhes, redireciona para a home sem parâmetros na URL
        console.log(`[CAMPANHA] Redirecionando da página de detalhes ${pathname} para a home`);
        window.location.href = '/';
      } else {
        // Se for uma página principal ou raiz, apenas recarrega
        // Primeiro, remover qualquer parâmetro ?campaign=xxx da URL atual
        const url = new URL(window.location.href);
        url.searchParams.delete('campaign');
        
        // Atualizar a URL sem o parâmetro campaign (sem recarregar ainda)
        window.history.replaceState({}, '', url.toString());
        
        console.log(`[CAMPANHA] Recarregando página principal ${pathname} sem parâmetros de campanha`);
        window.location.reload();
      }
    }
  } catch (error) {
    console.error('[CAMPANHA] Erro ao definir campanha:', error);
    
    // Tentar recarregar mesmo em caso de erro para garantir a atualização
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
} 