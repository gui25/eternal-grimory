"use client"

import { useState, useEffect, memo } from 'react'
import { CAMPAIGNS, getCurrentCampaignId, setCurrentCampaign } from '@/lib/campaign-config'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// Nome do evento para notificar mudanças de campanha
export const CAMPAIGN_CHANGE_EVENT = 'campaign-changed'

export default function CampaignSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentCampaignState, setCurrentCampaignState] = useState<string>('')
  
  // Quando o componente é montado, obter a campanha atual (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Inicializar o estado com a campanha atual
      setCurrentCampaignState(getCurrentCampaignId())
    }
  }, [])

  // Objeto da campanha atual
  const currentCampaign = CAMPAIGNS.find(c => c.id === currentCampaignState) || CAMPAIGNS[0]
  
  // Função para lidar com a mudança de campanha
  const handleCampaignChange = (campaignId: string) => {
    if (campaignId === currentCampaignState) {
      setIsOpen(false)
      return
    }
    
    setIsOpen(false)
    
    // Emitir um evento para notificar que a campanha foi alterada
    if (typeof window !== 'undefined') {
      const event = new CustomEvent(CAMPAIGN_CHANGE_EVENT, { 
        detail: { 
          previousCampaign: currentCampaignState,
          newCampaign: campaignId
        } 
      })
      window.dispatchEvent(event)
    }
    
    // Definir a nova campanha
    setCurrentCampaign(campaignId)
  }
  
  return (
    <div className="w-full mt-auto bg-background rounded-lg border border-gold-primary overflow-hidden">
      <div className="relative">
        {/* Botão para abrir/fechar o seletor */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="w-full p-4 text-left hover:bg-muted/50 transition-colors focus:outline-none flex items-center justify-between"
        >
          <div>
            <p className="text-gold font-medium">Campanha Atual</p>
            <p className="text-lg text-gold">{currentCampaign?.name}</p>
            <p className="text-xs text-gold italic mt-1">{currentCampaign?.dmName}</p>
          </div>
          <span className="text-gold">
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </span>
        </button>
        
        {/* Lista dropdown de campanhas */}
        {isOpen && (
          <div className={cn(
            "border-t border-gold-primary bg-background shadow-lg overflow-hidden rounded-b-lg", 
          )}>
            {CAMPAIGNS.filter(c => c.active).map(campaign => (
              <button
                key={campaign.id}
                onClick={() => handleCampaignChange(campaign.id)}
                className={cn(
                  "w-full p-3 text-left hover:bg-muted/50 transition-colors focus:outline-none",
                  "border-b border-gold-primary last:border-b-0",
                  campaign.id === currentCampaignState ? "bg-muted" : ""
                )}
              >
                <p className="text-gold">{campaign.name}</p>
                <p className="text-xs text-gold italic">{campaign.dmName}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 