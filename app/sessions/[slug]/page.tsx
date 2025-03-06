import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getSession } from "@/lib/mdx"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Users } from "lucide-react"
import TrackView from "@/components/track-view"

export default async function SessionPage({ params }: { params: { slug: string } }) {
  // Get the actual content
  const session = await getSession(params.slug)
  if (!session) notFound()

  const { contentHtml, meta } = session

  return (
    <div className="max-w-3xl mx-auto">
      {/* Track this view */}
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
          {meta.image && (
            <div className="w-full md:w-1/3 flex-shrink-0">
              <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gold-dark">
                <Image
                  src={meta.image || "/placeholder.svg"}
                  alt={`Session ${meta.session_number}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <div className="flex-1">
            <h1 className="fantasy-heading mb-4">Sessão {meta.session_number}</h1>

            <div className="flex items-center text-gold-light mb-3">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{meta.date}</span>
            </div>

            <div className="flex items-start gap-2 mb-4">
              <Users className="h-5 w-5 text-gold-light mt-1" />
              <div className="flex flex-wrap gap-2">
                {meta.players.map((player: string) => (
                  <span key={player} className="bg-secondary px-3 py-1 rounded-full text-xs">
                    {player}
                  </span>
                ))}
              </div>
            </div>

            {meta.description && <p className="text-gold-light italic">{meta.description}</p>}
          </div>
        </div>
      </div>

      <article
        className="prose prose-slate dark:prose-invert max-w-none mdx-content"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  )
}

