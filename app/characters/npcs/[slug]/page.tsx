import { notFound } from "next/navigation"
import { getCharacter, CharacterMeta } from "@/lib/mdx"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"
import { PageContainer } from "@/components/ui/page-container"
import { User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import TrackView from "@/components/track-view"

export default async function NPCPage({ params }: { params: { slug: string } }) {
  const campaignId = await getCurrentCampaignIdFromCookies()
  
  console.log(`Página de NPC: Carregando ${params.slug} da campanha: ${campaignId || 'padrão'}`)
  
  const npc = await getCharacter(params.slug, "npc", campaignId)
  if (!npc) notFound()

  // Use type assertion para evitar erro de tipo
  const { contentHtml, meta } = npc as unknown as { contentHtml: string, meta: CharacterMeta }

  return (
    <PageContainer className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Button variant="rpg" size="lg" asChild className="back-button">
          <Link href="/characters/npcs" className="flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Voltar para NPCs</span>
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 fantasy-heading">{meta.name}</h1>
        
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
      </div>

      <div className="fantasy-card p-6 rounded-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 flex flex-col items-center">
            {meta.image ? (
              <div className="mb-4 w-full aspect-square overflow-hidden rounded-lg">
                <img 
                  src={meta.image}
                  alt={meta.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="mb-4 w-full aspect-square flex items-center justify-center bg-wine-dark/30 rounded-lg">
                <User className="h-24 w-24 text-gold-light/20" />
              </div>
            )}
          </div>
          
          <div className="md:col-span-2">
            <article
              className="prose prose-slate dark:prose-invert max-w-none mdx-content" 
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        </div>
      </div>

      <TrackView 
        item={{
          slug: meta.slug,
          name: meta.name,
          type: meta.type,
          category: "npc"
        }} 
      />
    </PageContainer>
  )
}

