"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Globe, Book, Sparkles, Bug } from "lucide-react"
import { CAMPAIGNS, getCurrentCampaignId, setCurrentCampaign } from "@/lib/campaign-config"
import { cn } from "@/lib/utils"

export default function CampaignSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentCampaignState, setCurrentCampaignState] = useState("")
  const [showDebug, setShowDebug] = useState(false)
  const [cookieDebug, setCookieDebug] = useState<Record<string, string>>({})

  // Defina um efeito para carregar o estado inicial apenas no lado do cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Carregar a campanha atual
      console.log('CampaignSwitcher: Inicializando...')
      const currentId = getCurrentCampaignId()
      console.log(`CampaignSwitcher: getCurrentCampaignId() retornou ${currentId}`)
      setCurrentCampaignState(currentId)
      
      // Debug: Ler cookies
      try {
        const cookies = document.cookie.split('; ').reduce((prev, current) => {
          const [name, ...value] = current.split('=')
          prev[name] = value.join('=')
          return prev
        }, {} as Record<string, string>)
        setCookieDebug(cookies)
        console.log('CampaignSwitcher: Cookies atuais:', cookies)
      } catch (error) {
        console.error('CampaignSwitcher: Erro ao ler cookies:', error)
      }
    }
  }, [])

  // Encontre o objeto da campanha atual
  const currentCampaign = CAMPAIGNS.find(c => c.id === currentCampaignState) || CAMPAIGNS[0]
  
  // Handler para mudança de campanha
  const handleCampaignChange = (campaignId: string) => {
    console.log(`CampaignSwitcher: Alterando campanha para ${campaignId}`)
    setCurrentCampaignState(campaignId)
    setIsOpen(false)
    setCurrentCampaign(campaignId)
  }
  
  // Toggle para o painel de debug
  const toggleDebug = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDebug(!showDebug)
  }

  return (
    <div className="mb-2 mt-1">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gold">
          <Globe className="h-3.5 w-3.5 text-gold" />
          <span className="tracking-wider">CAMPANHA ATUAL</span>
        </div>
        <button 
          onClick={toggleDebug} 
          className="text-gold hover:text-gold/80 transition-colors"
          title="Debug"
        >
          <Bug className="h-3.5 w-3.5" />
        </button>
      </div>
      
      {showDebug && (
        <div className="mb-2 px-2 py-2 bg-wine-dark/30 rounded text-xs text-gold-light/70 border border-gold-dark/30 overflow-auto max-h-60">
          <p>ID: {currentCampaignState || "não definido"}</p>
          <p>Path: {currentCampaign?.contentPath || "não definido"}</p>
          <p className="mt-1 font-bold">Cookies:</p>
          <pre className="overflow-x-auto">{JSON.stringify(cookieDebug, null, 2)}</pre>
          <p className="mt-1 font-bold">LocalStorage:</p>
          <pre>{typeof window !== 'undefined' ? localStorage.getItem('current-campaign') || 'não definido' : 'indisponível'}</pre>
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="mt-2 px-2 py-1 bg-wine-dark text-gold-light rounded hover:bg-wine-darker hover:text-gold transition-colors text-xs"
          >
            Recarregar Página
          </button>
        </div>
      )}
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-md",
            "bg-wine-darker border border-gold-primary",
            "text-gold transition-colors duration-200"
          )}
          style={{ borderColor: '#D4AF37' }}
        >
          <div className="flex items-center gap-2 truncate">
            <Book className="h-5 w-5 flex-shrink-0 text-gold" />
            <span className="truncate text-base font-medium">{currentCampaign.name}</span>
          </div>
          
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gold transition-transform duration-300",
              isOpen ? "transform rotate-180" : ""
            )}
          />
        </button>
        
        {isOpen && (
          <div 
            className="absolute z-10 top-full left-0 right-0 mt-1 bg-wine-darker border border-gold-primary rounded-md py-1 shadow-lg"
            style={{ borderColor: '#D4AF37' }}
          >
            {CAMPAIGNS.filter(c => c.active).map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => handleCampaignChange(campaign.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors",
                  "hover:bg-wine-dark",
                  currentCampaignState === campaign.id 
                    ? "text-gold" 
                    : "text-gold-light hover:text-gold"
                )}
              >
                {currentCampaignState === campaign.id ? (
                  <Sparkles className="h-4 w-4 text-gold" />
                ) : (
                  <div className="w-4" />
                )}
                <span className="truncate">{campaign.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="pl-2.5 pr-2 text-base text-gold mt-3 italic">
        <p className="truncate font-medium">{currentCampaign.dmName || "Mestre"}</p>
      </div>
    </div>
  )
} 