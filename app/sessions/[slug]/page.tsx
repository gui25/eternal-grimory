import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getSession } from "@/lib/mdx"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen } from "lucide-react"
import TrackView from "@/components/track-view"
import { SessionMeta } from "@/types/content"
import { PageContainer } from "@/components/ui/page-container"

export default async function SessionPage({ params }: { params: { slug: string } }) {

  const session = await getSession(params.slug)
  if (!session) notFound()

  const { contentHtml, meta } = session as { contentHtml: string, meta: SessionMeta }

  return (
    <PageContainer className="max-w-3xl mx-auto">

      <TrackView
        item={{
          slug: meta.slug,
          name: `Session ${meta.session_number}`,
          type: "Session Report",
          date: meta.date,
          category: "session",
        }}
      />

      <div className="mb-6">
        <Button variant="rpg" size="lg" asChild className="back-button">
          <Link href="/sessions" className="flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Voltar para Sessões</span>
          </Link>
        </Button>
      </div>

      {/* Session header with optional image */}
      <div className="mb-8 fantasy-card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {meta.image ? (
            <div className="w-full md:w-1/3 flex-shrink-0">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gold-dark">
                <Image src={meta.image} alt={`Sessão ${meta.session_number}`} fill className="object-cover" />
              </div>
            </div>
          ) : (
            <div className="w-full md:w-1/3 flex-shrink-0">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gold-dark bg-wine-darker flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-gold-light/50" />
              </div>
            </div>
          )}

          <div className="flex-1">
            <h1 className="fantasy-heading mb-2">Sessão {meta.session_number}</h1>

            <div className="text-lg mb-3">
              {meta.date}
            </div>

            {meta.players && meta.players.length > 0 && (
              <div className="text-sm mb-4">
                <span className="font-medium text-gold">Jogadores:</span> {meta.players.join(', ')}
              </div>
            )}
          </div>
        </div>

        {meta.description && (
          <div className="mt-4 italic text-gray-300">"{meta.description}"</div>
        )}
      </div>

      <article
        className="prose prose-slate dark:prose-invert max-w-none mdx-content"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </PageContainer>
  )
}

