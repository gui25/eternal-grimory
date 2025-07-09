import { notFound } from "next/navigation"
import { getItem } from "@/lib/mdx"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"
import type { ItemMeta } from "@/lib/mdx"
import { DetailPageLayout } from "@/components/layouts/detail-page-layout"
import { AdminButton } from "@/components/ui/admin-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { Badge } from "@/components/ui/badge"
import { Edit, Sparkles } from "lucide-react"

interface ItemPageProps {
  params: Promise<{ slug: string }>
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

  // Create metadata exactly like notes
  const itemMetadata = (
    <>
      <div className="text-lg mb-3 text-gold-light">
        {meta.type || 'Item'} • {meta.rarity || 'Comum'}
      </div>

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
      backLink="/items"
      backLabel="Voltar para Itens"
      image={meta.image}
      imageAlt={meta.name}
      imagePlaceholder={<Sparkles className="h-24 w-24 text-gold-light/50" />}
      metadata={itemMetadata}
      actionButtons={
        <>
          <AdminButton href={`/admin/edit/item/${slug}`} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </AdminButton>
          <DeleteButton
            type="item"
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
        type: meta.type,
        category: "item",
        rarity: meta.rarity
      }}
    >
      <div className="mdx-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </DetailPageLayout>
  )
}

