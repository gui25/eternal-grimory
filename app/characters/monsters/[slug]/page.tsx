import { notFound } from "next/navigation"
import { getCharacter, CharacterMeta } from "@/lib/mdx"
import { Skull, Edit } from "lucide-react"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"
import { DetailPageLayout } from "@/components/layouts/detail-page-layout"
import { AdminButton } from "@/components/ui/admin-button"

export default async function MonsterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const campaignId = await getCurrentCampaignIdFromCookies()
  
  console.log(`Página de monstro: Carregando ${slug} da campanha: ${campaignId || 'padrão'}`)
  
  const monster = await getCharacter(slug, "monster", campaignId)
  if (!monster) notFound()

  // Use type assertion para evitar erro de tipo
  const { contentHtml, meta } = monster as unknown as { contentHtml: string, meta: CharacterMeta }

  return (
    <DetailPageLayout
      title={meta.name}
      backLink="/characters/monsters"
      backLabel="Voltar para Monstros"
      image={meta.image}
      imageAlt={meta.name}
      imagePlaceholder={<Skull className="h-24 w-24 text-red-accent/40" />}
      actionButtons={
        <AdminButton href={`/admin/edit/monster/${slug}`} variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </AdminButton>
      }
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
      description={meta.description}
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

