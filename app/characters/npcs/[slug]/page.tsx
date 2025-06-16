import { notFound } from "next/navigation"
import { getCharacter, CharacterMeta } from "@/lib/mdx"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"
import { User, Edit } from "lucide-react"
import { DetailPageLayout } from "@/components/layouts/detail-page-layout"
import { AdminButton } from "@/components/ui/admin-button"

export default async function NPCPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const campaignId = await getCurrentCampaignIdFromCookies()
  
  console.log(`Página de NPC: Carregando ${slug} da campanha: ${campaignId || 'padrão'}`)
  
  const npc = await getCharacter(slug, "npc", campaignId)
  if (!npc) notFound()

  // Use type assertion para evitar erro de tipo
  const { contentHtml, meta } = npc as unknown as { contentHtml: string, meta: CharacterMeta }

  return (
    <DetailPageLayout
      title={meta.name}
      backLink="/characters/npcs"
      backLabel="Voltar para NPCs"
      image={meta.image}
      imageAlt={meta.name}
      imagePlaceholder={<User className="h-24 w-24 text-gold-light/50" />}
      actionButtons={
        <AdminButton href={`/admin/edit/npc/${slug}`} variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </AdminButton>
      }
      metadata={
        <>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 text-gold-light">
          <div className="flex items-center">
            <span className="text-lg">{meta.type}</span>
          </div>
          {meta.affiliation && (
            <>
              <span className="hidden sm:inline">•</span>
              <span>{meta.affiliation}</span>
            </>
          )}
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
          category: "npc"
        }} 
    >
      <div className="mdx-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </DetailPageLayout>
  )
}

