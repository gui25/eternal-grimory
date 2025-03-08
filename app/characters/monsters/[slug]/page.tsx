import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getCharacter } from "@/lib/mdx"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Skull } from "lucide-react"
import TrackView from "@/components/track-view"
import { PageContainer } from "@/components/ui/page-container"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"
import { DetailPageLayout } from "@/components/layouts/detail-page-layout"

// Interface para o objeto meta retornado do getCharacter
interface CharacterMeta {
  slug: string;
  name: string;
  type: string;
  challenge: string;
  tags: string[];
  image?: string;
  category: "npc" | "monster" | "player";
}

export default async function MonsterPage({ params }: { params: { slug: string } }) {
  // Obter o ID da campanha atual do cookie
  const campaignId = getCurrentCampaignIdFromCookies()
  
  console.log(`Página de monstro: Carregando ${params.slug} da campanha: ${campaignId || 'padrão'}`)
  
  const character = await getCharacter(params.slug, "monster", campaignId)
  if (!character) notFound()

  // Use type assertion com unknown primeiro para evitar o erro de tipo
  const { contentHtml, meta } = character as unknown as { contentHtml: string, meta: CharacterMeta }

  return (
    <DetailPageLayout
      title={meta.name}
      backLink="/characters/monsters"
      backLabel="Voltar para Monstros"
      image={meta.image}
      imageAlt={meta.name}
      imagePlaceholder={<Skull className="h-24 w-24 text-red-accent/40" />}
      metadata={
        <>
          <div className="flex items-center text-lg mb-4 text-gold-light">
            <span>{meta.type}</span>
            <span className="mx-2">•</span>
            <span>Desafio {meta.challenge}</span>
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
        type: meta.type,
        category: "monster",
      }}
    >
      <article 
        className="prose prose-slate dark:prose-invert max-w-none mdx-content"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </DetailPageLayout>
  )
}

