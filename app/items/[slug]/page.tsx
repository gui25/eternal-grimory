import { notFound } from "next/navigation"
import { getItem, ItemMeta } from "@/lib/mdx"
import { Sparkles } from "lucide-react"
import { DetailPageLayout } from "@/components/layouts/detail-page-layout"
import { createItemMetadata } from "@/lib/metadata"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"

// Generate metadata for this page
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const campaignId = await getCurrentCampaignIdFromCookies()
  
  const item = await getItem(params.slug, campaignId)
  if (!item) return {}
  
  // Use type assertion para evitar erro de tipo
  const { meta } = item as unknown as { contentHtml: string, meta: ItemMeta }
  
  return {
    title: `${meta.name} | Grimório Eterno`,
    description: meta.description || `${meta.name} - ${meta.type} (${meta.rarity})`,
    openGraph: {
      title: meta.name,
      description: meta.description || `${meta.name} - ${meta.type} (${meta.rarity})`,
      images: [
        {
          url: meta.image || "/default-item.jpg",
          width: 1200,
          height: 630,
          alt: meta.name,
        },
      ],
    },
  }
}

export default async function ItemPage({ params }: { params: { slug: string } }) {
  const campaignId = await getCurrentCampaignIdFromCookies()
  console.log(`[ITEM-PAGE] Slug: ${params.slug}, CampaignId do cookie: ${campaignId || 'não encontrado'}`);
  
  const item = await getItem(params.slug, campaignId)
  if (!item) notFound()

  // Use type assertion para evitar erro de tipo
  const { contentHtml, meta } = item as unknown as { contentHtml: string, meta: ItemMeta }
  console.log(`[ITEM-PAGE] Item carregado: ${meta.name}, Campanha: ${meta.campaignId || 'não informado'}`);

  // Render item metadata
  const itemMetadata = (
    <>
      <div className={`text-sm inline-block px-2 py-0.5 rounded mb-3 ${meta.rarity ? `rarity-${meta.rarity.toLowerCase()}` : ''} ${meta.rarity?.toLowerCase() === 'legendary' ? 'legendary-badge' : ''}`}>
        {meta.rarity || 'Comum'}
      </div>

      <div className="text-lg mb-3 text-gold-light">
        {meta.type}
      </div>
      
      <div className="flex flex-wrap gap-2">
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
      backLink="/items"
      backLabel="Voltar para Itens"
      image={meta.image}
      imageAlt={meta.name}
      imagePlaceholder={<Sparkles className="h-24 w-24 text-gold-light/50" />}
      metadata={itemMetadata}
      description={meta.description}
      trackViewItem={{
        slug: meta.slug,
        name: meta.name,
        type: meta.type,
        category: "item",
        rarity: meta.rarity
      }}
      className={meta.rarity?.toLowerCase() === 'legendary' ? 'legendary-page-content' : ''}
    >
      <div className="mdx-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </DetailPageLayout>
  )
}

