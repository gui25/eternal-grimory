import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { CAMPAIGN_COOKIE_NAME } from "@/lib/campaign-config";
import { CAMPAIGN_CHANGE_EVENT } from "@/components/campaign-switcher";

interface FilterState {
  search: string;
  filters: Record<string, string>;
}

// Função para obter o ID da campanha atual do cookie no navegador
function getCurrentCampaignIdFromBrowser(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies[CAMPAIGN_COOKIE_NAME] || null;
}

export function useFilteredData<T>(
  apiEndpoint: string,
  filterFunction: (item: T, state: FilterState) => boolean
) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  
  // Efeito para verificar e atualizar o ID da campanha a partir dos cookies
  useEffect(() => {
    const campaignFromCookie = getCurrentCampaignIdFromBrowser();
    
    if (campaignFromCookie !== currentCampaignId) {
      setCurrentCampaignId(campaignFromCookie);
    }
    
    // Monitorar mudanças nos cookies
    const checkCookie = () => {
      const newCampaignId = getCurrentCampaignIdFromBrowser();
      if (newCampaignId !== currentCampaignId) {
        setCurrentCampaignId(newCampaignId);
      }
    };
    
    // Ouvir evento de mudança de campanha
    const handleCampaignChange = () => {
      // Forçar uma atualização imediata dos dados quando a campanha mudar
      setTimeout(() => {
        const newCampaignId = getCurrentCampaignIdFromBrowser();
        setCurrentCampaignId(newCampaignId);
        mutate();
      }, 500); // Pequeno atraso para garantir que o cookie foi definido
    };
    
    // Adicionar listener para o evento de mudança de campanha
    window.addEventListener(CAMPAIGN_CHANGE_EVENT, handleCampaignChange);
    
    // Verificar a cada 2 segundos (pode ser ajustado conforme necessário)
    const interval = setInterval(checkCookie, 2000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener(CAMPAIGN_CHANGE_EVENT, handleCampaignChange);
    };
  }, [currentCampaignId]);

  // Usar o ID da campanha como parte da chave do SWR, mas SEM adicionar à URL
  const cacheKey = `${apiEndpoint}-campaign-${currentCampaignId || 'default'}`;

  // Construir a URL da API sem adicionar o parâmetro campaign
  const apiUrl = apiEndpoint;

  console.log(`[useFilteredData] Fetch URL: ${apiUrl}, Campaign usando cookie/localStorage: ${currentCampaignId || 'none'}`);
  
  const { data, error, isLoading, mutate } = useSWR<T[]>(cacheKey, async () => {
    console.log(`Iniciando fetch para ${apiUrl}`);
    const response = await fetch(apiUrl, {
      headers: {
        // Enviar o ID da campanha atual como cabeçalho personalizado
        'X-Campaign': currentCampaignId || '',
      }
    });
    
    if (!response.ok) {
      console.error(`Erro na requisição para ${apiUrl}: ${response.status}`);
      throw new Error(`Erro na requisição: ${response.status}`);
    }
    
    const jsonData = await response.json();
    
    console.log(`Dados recebidos: ${jsonData.length} itens`);
    return jsonData;
  }, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 10000, // 10 segundos entre solicitações duplicadas
  });

  const filteredData = data 
    ? data.filter((item: T) => filterFunction(item, { search, filters }))
    : [];

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({});
  };

  return {
    data,
    filteredData,
    error,
    isLoading,
    search,
    setSearch,
    filters,
    setFilter,
    clearFilters,
    refreshData: mutate,
    currentCampaignId
  };
}
