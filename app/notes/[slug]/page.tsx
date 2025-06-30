import { notFound } from "next/navigation"
import { getNote } from '@/lib/mdx'
import { getCurrentCampaignId } from '@/lib/campaign-config'
import { formatDateBR, formatDateForMDX, parseBRDate } from '@/utils/date-utils'
import { Badge } from '@/components/ui/badge'
import { Calendar, FileText, Edit } from 'lucide-react'
import { DetailPageLayout } from '@/components/layouts/detail-page-layout'
import { AdminButton } from '@/components/ui/admin-button'
import { DeleteButton } from '@/components/ui/delete-button'
import { Metadata } from 'next'

interface NotePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params
  const campaignId = await getCurrentCampaignId()
  const note = await getNote(slug, campaignId)
  
  if (!note) return {}

  return {
    title: (note as any).name,
    description: (note as any).description || `Anotação: ${(note as any).name}`,
  }
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params
  const campaignId = await getCurrentCampaignId()
  
  console.log(`Página de anotação: Carregando ${slug} da campanha: ${campaignId || 'padrão'}`)
  
  const note = await getNote(slug, campaignId)
  if (!note) notFound()

  // Use type assertion para evitar erro de tipo
  const { content: contentHtml } = note
  const meta = note as any

  // Render note metadata
  const noteMetadata = (
    <>
      {meta.date && (
        <div className="text-lg mb-4 text-gold-light">
          <Calendar className="inline-block mr-2 h-5 w-5" />
          {parseBRDate(meta.date) ? formatDateForMDX(parseBRDate(meta.date)!) : meta.date}
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
      backLink="/notes"
      backLabel="Voltar para Anotações"
      image={meta.image}
      imageAlt={meta.name}
      imagePlaceholder={<FileText className="h-24 w-24 text-gold-light/50" />}
      actionButtons={
        <>
          <AdminButton href={`/admin/edit/note/${slug}`} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </AdminButton>
          <DeleteButton
            type="note"
            slug={slug}
            name={meta.name}
            campaignId={campaignId}
            className="hidden sm:flex"
            size="sm"
          />
        </>
      }
      metadata={noteMetadata}
      description={meta.description}
      trackViewItem={{
        slug: meta.slug || slug,
        name: meta.name,
        type: "Anotação",
        date: meta.date,
        category: "notes",
      }}
    >
      <article
        className="prose prose-slate dark:prose-invert max-w-none mdx-content"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </DetailPageLayout>
  )
} 