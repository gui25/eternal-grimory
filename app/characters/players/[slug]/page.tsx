import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getCharacter, CharacterMeta } from "@/lib/mdx"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Edit } from "lucide-react"
import TrackView from "@/components/track-view"
import { PlayerMeta } from "@/types/content"
import { PageContainer } from "@/components/ui/page-container"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"
import { DetailPageLayout } from "@/components/layouts/detail-page-layout"
import { AdminButton } from "@/components/ui/admin-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { getCurrentCampaignId } from "@/lib/campaign-config"

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

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const campaignId = await getCurrentCampaignIdFromCookies()
  
  console.log(`Página de jogador: Carregando ${slug} da campanha: ${campaignId || 'padrão'}`)
  
  const player = await getCharacter(slug, "player", campaignId)
  if (!player) notFound()

  // Use type assertion para evitar erro de tipo
  const { contentHtml, meta } = player as unknown as { contentHtml: string, meta: CharacterMeta }

  // Render player metadata
  const playerMetadata = (
    <>
      <div className="flex items-center text-lg mb-2 text-gold-light">
        <span>Nível {meta.level}</span>
        <span className="mx-2">•</span>
        <span>{meta.race} {meta.class}</span>
      </div>
      {meta.player && (
        <div className="text-sm text-muted-foreground mb-4">
          Jogado por: {meta.player}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-6">
        {meta.tags.map((tag: string) => (
          <span key={tag} className="bg-secondary px-3 py-1 rounded-full text-xs">
            {tag}
          </span>
        ))}
      </div>
    </>
  )

  return (
    <DetailPageLayout
      title={meta.name}
      backLink="/characters/players"
      backLabel="Voltar para Personagens"
      image={meta.image}
      imageAlt={meta.name}
      imagePlaceholder={<User className="h-24 w-24 text-blue-accent/50" />}
      actionButtons={
        <>
          <AdminButton href={`/admin/edit/player/${slug}`} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </AdminButton>
          <DeleteButton
            type="player"
            slug={slug}
            name={meta.name}
            campaignId={getCurrentCampaignId()}
            className="hidden sm:flex"
            size="sm"
          />
        </>
      }
      metadata={playerMetadata}
      description={meta.description}
      trackViewItem={{
        slug: meta.slug,
        name: meta.name,
        type: meta.class || "Personagem",
        category: "player"
      }}
    >
      <div className="mdx-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </DetailPageLayout>
  )
}

