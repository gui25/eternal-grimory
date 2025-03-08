import { notFound } from "next/navigation"
import { getSession, SessionMeta } from "@/lib/mdx"
import { Calendar } from "lucide-react"
import { DetailPageLayout } from "@/components/layouts/detail-page-layout"
import { createSessionMetadata } from "@/lib/metadata"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"

// Generate metadata for this page
export async function generateMetadata({ params }: { params: { slug: string } }) {
  // Obter o ID da campanha atual do cookie
  const campaignId = getCurrentCampaignIdFromCookies()
  
  const session = await getSession(params.slug, campaignId)
  if (!session) return {}
  
  // Use type assertion para evitar erro de tipo
  const { meta } = session as unknown as { contentHtml: string, meta: SessionMeta }
  return createSessionMetadata({
    session_number: meta.session_number,
    date: meta.date,
    slug: meta.slug,
  })
}

export default async function SessionPage({ params }: { params: { slug: string } }) {
  // Obter o ID da campanha atual do cookie
  const campaignId = getCurrentCampaignIdFromCookies()
  
  console.log(`Página de sessão: Carregando ${params.slug} da campanha: ${campaignId || 'padrão'}`)
  
  const session = await getSession(params.slug, campaignId)
  if (!session) notFound()

  // Use type assertion para evitar erro de tipo
  const { contentHtml, meta } = session as unknown as { contentHtml: string, meta: SessionMeta }

  // Render session metadata
  const sessionMetadata = (
    <>
      <div className="text-lg mb-4 text-gold-light">
        <Calendar className="inline-block mr-2 h-5 w-5" />
        {meta.date}
      </div>

      {meta.players && meta.players.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-muted-foreground mb-1">Jogadores presentes:</div>
          <div className="flex flex-wrap gap-2">
            {meta.players.map((player: string) => (
              <span key={player} className="bg-secondary px-3 py-1 rounded-full text-xs text-foreground">
                {player}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  )

  return (
    <DetailPageLayout
      title={`Sessão ${meta.session_number}`}
      backLink="/sessions"
      backLabel="Voltar para Sessões"
      image={meta.image}
      imageAlt={`Sessão ${meta.session_number}`}
      imagePlaceholder={<Calendar className="h-24 w-24 text-gold-light/50" />}
      metadata={sessionMetadata}
      description={meta.description}
      trackViewItem={{
        slug: meta.slug,
        name: `Sessão ${meta.session_number}`,
        type: "Sessão",
        date: meta.date,
        category: "session",
      }}
    >
      <article
        className="prose prose-slate dark:prose-invert max-w-none mdx-content"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </DetailPageLayout>
  )
}

