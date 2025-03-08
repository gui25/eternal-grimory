import { notFound } from "next/navigation"
import { getItem, ItemMeta } from "@/lib/mdx"
import { Sparkles } from "lucide-react"
import { DetailPageLayout } from "@/components/layouts/detail-page-layout"
import { createItemMetadata } from "@/lib/metadata"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"

// Generate metadata for this page
export async function generateMetadata({ params }: { params: { slug: string } }) {
  // Obter o ID da campanha atual do cookie
  const campaignId = getCurrentCampaignIdFromCookies()
  
  const item = await getItem(params.slug, campaignId)
  if (!item) return {}
  
  // Use type assertion com unknown primeiro para evitar o erro de tipo
  const { meta } = item as unknown as { contentHtml: string, meta: ItemMeta }
  return createItemMetadata({
    name: meta.name,
    description: meta.description,
    type: meta.type,
    rarity: meta.rarity,
    image: meta.image,
    slug: meta.slug,
  })
}

export default async function ItemPage({ params }: { params: { slug: string } }) {
  // Obter o ID da campanha atual do cookie
  const campaignId = getCurrentCampaignIdFromCookies()
  
  // Obter o conteúdo do item, passando explicitamente o ID da campanha
  const item = await getItem(params.slug, campaignId)
  if (!item) notFound()

  // Use type assertion com unknown primeiro para evitar o erro de tipo
  const { contentHtml, meta } = item as unknown as { contentHtml: string, meta: ItemMeta }

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

