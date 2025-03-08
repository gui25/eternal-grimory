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

// Cookie name for storing the current campaign
export const CAMPAIGN_COOKIE_NAME = 'current-campaign';

// Helper to parse cookies in a SSR-compatible way
function parseCookies(cookieString: string | null): Record<string, string> {
  if (!cookieString) return {}
  try {
    return cookieString.split('; ').reduce((prev, current) => {
      const [name, ...value] = current.split('=')
      prev[name] = value.join('=')
      return prev
    }, {} as Record<string, string>)
  } catch (error) {
    console.error('Erro ao analisar cookies:', error)
    return {}
  }
}

// Get current campaign (works on both client and server sides)
export function getCurrentCampaignId(): string {
  // Para depuração
  console.log('getCurrentCampaignId chamado')
  
  // No servidor, tente ler dos cookies usando o objeto global de requisição
  if (typeof window === 'undefined') {
    try {
      // No Node.js - tentamos obter dos cookies do documento se estiverem disponíveis
      const cookieString = typeof document !== 'undefined' ? document.cookie : null
      
      // Como alternativa, se estamos em um middleware ou API, eles terão seu próprio 
      // método para ler cookies que é tratado separadamente no middleware.ts
      
      console.log('Ambiente do servidor, cookieString:', cookieString || 'não disponível')
      
      const cookies = parseCookies(cookieString)
      const campaignIdFromCookie = cookies[CAMPAIGN_COOKIE_NAME]
      
      console.log('ID da campanha do cookie:', campaignIdFromCookie || 'não encontrado')
      
      if (campaignIdFromCookie) {
        // Verificar se o ID é válido
        const isValid = CAMPAIGNS.some(c => c.id === campaignIdFromCookie && c.active)
        if (isValid) {
          console.log(`Campanha válida do cookie: ${campaignIdFromCookie}`)
          return campaignIdFromCookie
        } else {
          console.log(`Campanha do cookie inválida: ${campaignIdFromCookie}, usando padrão`)
        }
      }
      
      // Se não tivermos um cookie ou for inválido, retorne a primeira campanha ativa
      const defaultCampaign = CAMPAIGNS.find(c => c.active)?.id || CAMPAIGNS[0].id
      console.log(`Retornando campanha padrão: ${defaultCampaign}`)
      return defaultCampaign
    } catch (error) {
      console.error('Erro ao obter o ID da campanha atual no servidor:', error)
      return CAMPAIGNS.find(c => c.active)?.id || CAMPAIGNS[0].id
    }
  }
  
  // No cliente
  try {
    console.log('Ambiente do cliente')
    
    // Tente obter do localStorage
    const fromLocalStorage = typeof window !== 'undefined' 
      ? localStorage.getItem(CAMPAIGN_COOKIE_NAME)
      : null
      
    console.log('ID da campanha do localStorage:', fromLocalStorage || 'não encontrado')
    
    // Tente obter dos cookies
    const cookieString = typeof document !== 'undefined' ? document.cookie : null
    const cookies = parseCookies(cookieString)
    const fromCookies = cookies[CAMPAIGN_COOKIE_NAME]
    
    console.log('ID da campanha do cookie (cliente):', fromCookies || 'não encontrado')
    
    // Priorize localStorage, depois cookies
    const campaignId = fromLocalStorage || fromCookies
    
    if (campaignId) {
      // Verificar se o ID é válido
      const isValid = CAMPAIGNS.some(c => c.id === campaignId && c.active)
      if (isValid) {
        console.log(`Usando campanha do cliente: ${campaignId}`)
        return campaignId
      }
    }
    
    // Se não tivermos um ID válido, retorne a primeira campanha ativa
    const defaultCampaign = CAMPAIGNS.find(c => c.active)?.id || CAMPAIGNS[0].id
    console.log(`Cliente usando campanha padrão: ${defaultCampaign}`)
    return defaultCampaign
  } catch (error) {
    console.error('Erro ao obter o ID da campanha atual no cliente:', error)
    return CAMPAIGNS.find(c => c.active)?.id || CAMPAIGNS[0].id
  }
}

// Get campaign by ID
export function getCampaignById(id: string): CampaignInfo | undefined {
  return CAMPAIGNS.find(c => c.id === id);
}

// Set current campaign (client-side only)
export function setCurrentCampaign(id: string): void {
  console.log(`Alterando campanha para: ${id}`)
  
  if (typeof window === 'undefined') {
    console.warn('setCurrentCampaign chamado no servidor, isso não deve acontecer.')
    return
  }
  
  try {
    // Verifica se a campanha é válida
    const campaign = CAMPAIGNS.find(c => c.id === id && c.active)
    if (!campaign) {
      console.error(`Campanha inválida: ${id}`)
      return
    }
    
    // Armazena no localStorage
    localStorage.setItem(CAMPAIGN_COOKIE_NAME, id)
    console.log(`Campanha armazenada no localStorage: ${id}`)
    
    // Define o cookie para acesso do servidor
    document.cookie = `${CAMPAIGN_COOKIE_NAME}=${id}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    console.log(`Cookie definido: ${CAMPAIGN_COOKIE_NAME}=${id}`)
    
    // Recarrega a página para garantir que o novo conteúdo seja carregado
    console.log('Recarregando a página para aplicar a nova campanha...')
    window.location.reload()
  } catch (error) {
    console.error('Erro ao definir a campanha atual:', error)
  }
} 