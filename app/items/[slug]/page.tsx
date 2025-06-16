import { notFound } from "next/navigation"
import { getItem, ItemMeta } from "@/lib/mdx"
import { Edit, Sparkles } from "lucide-react"
import { DetailPageLayout } from "@/components/layouts/detail-page-layout"
import { createItemMetadata } from "@/lib/metadata"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"
import { AdminButton } from "@/components/ui/admin-button"

// Generate metadata for this page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const campaignId = await getCurrentCampaignIdFromCookies()
  
  const item = await getItem(slug, campaignId)
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

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const campaignId = await getCurrentCampaignIdFromCookies()
  console.log(`[ITEM-PAGE] Slug: ${slug}, CampaignId do cookie: ${campaignId || 'não encontrado'}`);
  
  const item = await getItem(slug, campaignId)
  if (!item) notFound()

  // Use type assertion para evitar erro de tipo
  const { contentHtml, meta } = item as unknown as { contentHtml: string, meta: ItemMeta }
  console.log(`[ITEM-PAGE] Item carregado: ${meta.name}, Campanha: ${meta.campaignId || 'não informado'}`);

  // Get rarity badge classes for visual feedback
  const getRarityBadgeClass = (rarity: string) => {
    const rarityLower = rarity.toLowerCase()
    switch (rarityLower) {
      case 'lendário':
      case 'legendary':
        return 'legendary-badge'
      case 'épico':
      case 'epic':
        return 'epic-badge'
      case 'raro':
      case 'rare':
        return 'rare-badge'
      case 'incomum':
      case 'uncommon':
        return 'uncommon-badge'
      case 'comum':
      case 'common':
      default:
        return 'common-badge'
    }
  }

  // Render item metadata
  const itemMetadata = (
    <>
      <div className={`text-sm inline-block px-3 py-1 rounded-full mb-3 font-medium ${getRarityBadgeClass(meta.rarity || 'Common')}`}>
        {meta.rarity || 'Comum'}
      </div>

      <div className="text-lg mb-3 text-gold-light font-medium">
        {meta.type}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {meta.tags.map((tag: string) => (
          <span key={tag} className="bg-secondary/80 px-3 py-1 rounded-full text-xs ">
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
      actionButtons={
        <AdminButton href={`/admin/edit/item/${slug}`} variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </AdminButton>
      }
      metadata={itemMetadata}
      description={meta.description}
      trackViewItem={{
        slug: meta.slug,
        name: meta.name,
        type: meta.type,
        category: "item",
        rarity: meta.rarity
      }}
    >
      <div className="mdx-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </DetailPageLayout>
  )
}

