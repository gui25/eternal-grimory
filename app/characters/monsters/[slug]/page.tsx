import { notFound } from "next/navigation"
import { getCharacter, CharacterMeta } from "@/lib/mdx"
import { Skull, Edit } from "lucide-react"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"
import { DetailPageLayout } from "@/components/layouts/detail-page-layout"
import { AdminButton } from "@/components/ui/admin-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { Badge } from "@/components/ui/badge"

export default async function MonsterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const campaignId = await getCurrentCampaignIdFromCookies()
  
  console.log(`Página de monstro: Carregando ${slug} da campanha: ${campaignId || 'padrão'}`)
  
  const monster = await getCharacter(slug, "monster", campaignId || '')
  if (!monster) notFound()

  // Use type assertion para evitar erro de tipo
  const { contentHtml, meta } = monster as unknown as { contentHtml: string, meta: CharacterMeta }

  // Create a metadata section exactly like notes
  const monsterMetadata = (
    <>
      <div className="text-lg mb-3 text-gold-light">
        {meta.type} • Desafio {meta.challenge}
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
      backLink="/characters/monsters"
      backLabel="Voltar para Monstros"
      image={meta.image}
      imageAlt={meta.name}
      imagePlaceholder={<Skull className="h-24 w-24 text-red-accent/40" />}
      metadata={monsterMetadata}
      actionButtons={
        <>
          <AdminButton href={`/admin/edit/monster/${slug}`} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </AdminButton>
          <DeleteButton
            type="monster"
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

