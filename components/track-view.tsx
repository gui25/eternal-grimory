"use client"

import { useEffect } from "react"
import { ViewedItem } from "@/types/content"

interface TrackViewProps {
  item: ViewedItem;
}

export default function TrackView({ item }: TrackViewProps) {
  useEffect(() => {
    // Implementação do track view
    const storeView = () => {
      try {
        // Obter itens visualizados do localStorage
        const viewedItemsString = localStorage.getItem("viewedItems") || "[]"
        const viewedItems = JSON.parse(viewedItemsString)
        
        // Verificar se o item já está na lista
        const existingIndex = viewedItems.findIndex(
          (i: ViewedItem) => i.slug === item.slug
        )
        
        if (existingIndex !== -1) {
          // Remover o item existente
          viewedItems.splice(existingIndex, 1)
        }
        
        // Adicionar o novo item no início
        viewedItems.unshift(item)
        
        // Manter apenas os últimos 10 itens
        const updatedItems = viewedItems.slice(0, 10)
        
        // Salvar de volta no localStorage
        localStorage.setItem("viewedItems", JSON.stringify(updatedItems))
      } catch (error) {
        console.error("Erro ao salvar item visualizado:", error)
      }
    }

    storeView()
  }, [item])

  // Componente não renderiza nada visível
  return null
}

export type { ViewedItem }

