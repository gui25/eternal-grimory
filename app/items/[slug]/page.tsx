import { notFound } from "next/navigation"
import { getItem } from "@/lib/mdx"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"
import type { ItemMeta } from "@/lib/mdx"
import { DetailPageLayout } from "@/components/layouts/detail-page-layout"
import { AdminButton } from "@/components/ui/admin-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { Badge } from "@/components/ui/badge"
import { Edit, Sparkles, Shield, Sword, Zap, Heart } from "lucide-react"

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

  // Get rarity styling
  const getRarityTextColor = (rarity: string) => {
    const rarityLower = rarity.toLowerCase()
    switch (rarityLower) {
      case 'lendário':
      case 'legendary':
        return 'text-orange-400'
      case 'épico':
      case 'epic':
        return 'text-purple-400'
      case 'raro':
      case 'rare':
        return 'text-blue-400'
      case 'incomum':
      case 'uncommon':
        return 'text-green-400'
      case 'comum':
      case 'common':
      default:
        return 'text-gray-300'
    }
  }

  // Get item type icon
  const getItemIcon = (type: string) => {
    const typeLower = type.toLowerCase()
    if (typeLower.includes('weapon') || typeLower.includes('arma')) return Sword
    if (typeLower.includes('armor') || typeLower.includes('armadura')) return Shield
    if (typeLower.includes('potion') || typeLower.includes('poção')) return Heart
    return Sparkles
  }

  const rarityTextColor = getRarityTextColor(meta.rarity || 'comum')
  const ItemIcon = getItemIcon(meta.type || 'item')

  // Create metadata with enhanced styling
  const itemMetadata = (
    <>
      <div className="flex items-center gap-3 text-lg text-gold-light mb-3">
        <ItemIcon className="h-5 w-5" />
        <span>{meta.type || 'Item'}</span>
        <span className="text-gold-dark">•</span>
        <span className={`${rarityTextColor} font-semibold`}>{meta.rarity || 'Comum'}</span>
      </div>

      {meta.description && (
        <div className="mb-3 italic text-gray-100 bg-fantasy-darker/30 rounded-lg p-3 border-l-4 border-gold-primary">
          <Zap className="inline-block w-4 h-4 mr-2 text-gold-light" />
          "{meta.description}"
        </div>
      )}

      {meta.tags && meta.tags.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-muted-foreground mb-2 font-medium">Propriedades:</div>
          <div className="flex flex-wrap gap-2">
            {meta.tags.map((tag: string) => (
              <span 
                key={tag} 
                className="bg-red-600/80 px-3 py-1 rounded-full text-xs text-white font-medium hover:bg-red-600 transition-colors"
              >
                {tag}
              </span>
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
      image={meta.image || ''}
      imageAlt={meta.name}
      imagePlaceholder={<ItemIcon className="h-24 w-24 text-gold-light/50" />}
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
      {/* Content card - sem estilização de raridade */}
      <div className="fantasy-card p-6">
        <article 
          className="prose prose-slate dark:prose-invert max-w-none mdx-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>
    </DetailPageLayout>
  )
}

// Helper function for rarity border colors (removida pois não está sendo usada)
// function getRarityBorderColor(rarity: string) {
//   const rarityLower = rarity.toLowerCase()
//   switch (rarityLower) {
//     case 'lendário':
//     case 'legendary':
//       return 'border-orange-400'
//     case 'épico':
//     case 'epic':
//       return 'border-purple-400'
//     case 'raro':
//     case 'rare':
//       return 'border-blue-400'
//     case 'incomum':
//     case 'uncommon':
//       return 'border-green-400'
//     case 'comum':
//     case 'common':
//     default:
//       return 'border-gold-dark'
//   }
// }

