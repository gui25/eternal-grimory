import { notFound } from "next/navigation"
import { getCharacter } from "@/lib/mdx"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"
import { DetailPageLayout } from "@/components/layouts/detail-page-layout"
import { AdminButton } from "@/components/ui/admin-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { Badge } from "@/components/ui/badge"
import { Edit, User } from "lucide-react"

export default async function NPCPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const campaignId = await getCurrentCampaignIdFromCookies()
  
  const npc = await getCharacter(slug, "npc", campaignId || '')
  if (!npc) notFound()

  const { contentHtml, meta } = npc as unknown as { contentHtml: string, meta: any }

  // Create metadata exactly like notes
  const npcMetadata = (
    <>
      <div className="text-lg mb-3 text-gold-light">
        {meta.affiliation ? `${meta.type} • ${meta.affiliation}` : meta.type}
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
      backLink="/characters/npcs"
      backLabel="Voltar para NPCs"
      image={meta.image}
      imageAlt={meta.name}
      imagePlaceholder={<User className="h-24 w-24 text-gold-light/50" />}
      metadata={npcMetadata}
      actionButtons={
        <>
          <AdminButton href={`/admin/edit/npc/${slug}`} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </AdminButton>
          <DeleteButton
            type="npc"
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
          category: "npc"
        }} 
    >
      <div className="mdx-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </DetailPageLayout>
  )
}

