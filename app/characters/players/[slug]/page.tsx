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
import { Badge } from "@/components/ui/badge"

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
  
  const player = await getCharacter(slug, "player", campaignId || '')
  if (!player) notFound()

  // Use type assertion para evitar erro de tipo
  const { contentHtml, meta } = player as unknown as { contentHtml: string, meta: CharacterMeta }

  // Create metadata exactly like notes
  const playerMetadata = (
    <>
      <div className="text-lg mb-3 text-gold-light">
        Nível {meta.level} • {meta.race} {meta.class}
      </div>

      {meta.player && (
        <div className="text-sm text-muted-foreground mb-3">
          Jogado por: {meta.player}
        </div>
      )}
      
      {meta.description && (
        <div className="mb-3 italic text-gray-100">
          "{meta.description}"
        </div>
      )}

      {meta.tags && meta.tags.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-muted-foreground mb-1">Tags:</div>
          <div className="flex flex-wrap gap-2">
        {meta.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
              </Badge>
        ))}
      </div>
        </div>
      )}
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
      metadata={playerMetadata}
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
            campaignId={campaignId || ''}
            className="hidden sm:flex"
            size="sm"
          />
        </>
      }
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

