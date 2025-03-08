import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getCharacter } from "@/lib/mdx"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User } from "lucide-react"
import TrackView from "@/components/track-view"
import { PlayerMeta } from "@/types/content"
import { PageContainer } from "@/components/ui/page-container"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"
import { DetailPageLayout } from "@/components/layouts/detail-page-layout"

// Define a interface localmente
interface PlayerCharacterMeta {
  slug: string;
  name: string;
  race?: string;
  class?: string;
  level?: number;
  player?: string;
  tags: string[];
  image?: string;
  category: "player";
}

export default async function PlayerPage({ params }: { params: { slug: string } }) {
  // Obter o ID da campanha atual do cookie
  const campaignId = getCurrentCampaignIdFromCookies()
  
  console.log(`Página de jogador: Carregando ${params.slug} da campanha: ${campaignId || 'padrão'}`)
  
  const character = await getCharacter(params.slug, "player", campaignId)
  if (!character) notFound()

  // Use type assertion com unknown primeiro para evitar o erro de tipo
  const { contentHtml, meta } = character as unknown as { contentHtml: string, meta: PlayerCharacterMeta }

  // Informação do jogador como descrição em vez de subtitle
  const playerInfo = meta.player ? `Jogado por ${meta.player}` : undefined;

  return (
    <DetailPageLayout
      title={meta.name}
      backLink="/characters/players"
      backLabel="Voltar para Jogadores"
      image={meta.image}
      imageAlt={meta.name}
      imagePlaceholder={<User className="h-24 w-24 text-gold-light/50" />}
      description={playerInfo}
      metadata={
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 text-gold-light">
            {meta.race && <span>{meta.race}</span>}
            
            {meta.race && meta.class && (
              <span className="hidden sm:inline">•</span>
            )}
            
            {meta.class && <span>{meta.class}</span>}
            
            {(meta.race || meta.class) && meta.level && (
              <span className="hidden sm:inline">•</span>
            )}
            
            {meta.level && <span>Nível {meta.level}</span>}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {meta.tags.map(tag => (
              <span key={tag} className="bg-secondary px-3 py-1 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        </>
      }
      trackViewItem={{
        slug: meta.slug,
        name: meta.name,
        type: meta.class || "Personagem",
        category: "player",
      }}
    >
      <article 
        className="prose prose-slate dark:prose-invert max-w-none mdx-content"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </DetailPageLayout>
  )
}

