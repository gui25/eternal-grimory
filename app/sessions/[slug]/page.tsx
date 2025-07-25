import { notFound } from "next/navigation"
import { getSession, SessionMeta } from "@/lib/mdx"
import { Calendar, Edit } from "lucide-react"
import { DetailPageLayout } from "@/components/layouts/detail-page-layout"
import { createSessionMetadata } from "@/lib/metadata"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"
import { AdminButton } from "@/components/ui/admin-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { getCurrentCampaignId } from "@/lib/campaign-config"
import { formatDateBR, formatDateForMDX, parseBRDate } from "@/utils/date-utils"
import { Badge } from "@/components/ui/badge"

// Generate metadata for this page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // Obter o ID da campanha atual do cookie
  const campaignId = await getCurrentCampaignIdFromCookies()
  
  const session = await getSession(slug, campaignId)
  if (!session) return {}
  
  // Use type assertion para evitar erro de tipo
  const { meta } = session as unknown as { contentHtml: string, meta: SessionMeta }
  return createSessionMetadata({
    session_number: meta.session_number,
    date: meta.date,
    slug: meta.slug,
  })
}

export default async function SessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // Obter o ID da campanha atual do cookie
  const campaignId = await getCurrentCampaignIdFromCookies()
  
  console.log(`Página de sessão: Carregando ${slug} da campanha: ${campaignId || 'padrão'}`)
  
  const session = await getSession(slug, campaignId)
  if (!session) notFound()

  // Use type assertion para evitar erro de tipo
  const { contentHtml, meta } = session as unknown as { contentHtml: string, meta: SessionMeta }

  // Render session metadata
  const sessionMetadata = (
    <>
      <div className="text-lg mb-3 text-gold-light">
        <Calendar className="inline-block mr-2 h-5 w-5" />
        {parseBRDate(meta.date) ? formatDateForMDX(parseBRDate(meta.date)!) : meta.date}
      </div>

      {meta.description && (
        <div className="mb-3 italic text-gray-100">
          "{meta.description}"
        </div>
      )}

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
      title={`SESSÃO ${meta.session_number}`}
      backLink="/sessions"
      backLabel="Voltar para Sessões"
      image={meta.image}
      imageAlt={`Sessão ${meta.session_number}`}
      imagePlaceholder={<Calendar className="h-24 w-24 text-gold-light/50" />}
      actionButtons={
        <>
          <AdminButton href={`/admin/edit/session/${slug}`} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </AdminButton>
          <DeleteButton
            type="session"
            slug={slug}
            name={`Sessão ${meta.session_number}`}
            campaignId={getCurrentCampaignId()}
            className="hidden sm:flex"
            size="sm"
          />
        </>
      }
      metadata={sessionMetadata}
      trackViewItem={{
        slug: meta.slug,
        name: `SESSÃO ${meta.session_number}`,
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

