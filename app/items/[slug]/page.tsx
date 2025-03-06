import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getItem } from "@/lib/mdx"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"
import TrackView from "@/components/track-view"
import { ItemMeta } from "@/types/content"

export default async function ItemPage({ params }: { params: { slug: string } }) {
  // Get the actual content
  const item = await getItem(params.slug)
  if (!item) notFound()

  const { contentHtml, meta } = item as { contentHtml: string, meta: ItemMeta }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Track this view */}
      <TrackView
        item={{
          slug: meta.slug,
          name: meta.name, 
          type: meta.type,
          rarity: meta.rarity,
          tags: meta.tags,
          image: meta.image,
          description: meta.description
        }}
      />

      <div className="mb-6">
        <Button variant="rpg" size="lg" asChild className="back-button">
          <Link href="/items" className="flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Voltar para Itens</span>
          </Link>
        </Button>
      </div>

      {/* Item header with optional image */}
      <div className="mb-8 fantasy-card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {meta.image ? (
            <div className="w-full md:w-1/3 flex-shrink-0">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gold-dark">
                <Image src={meta.image || "/placeholder.svg"} alt={meta.name} fill className="object-cover" />
              </div>
            </div>
          ) : (
            <div className="w-full md:w-1/3 flex-shrink-0">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gold-dark bg-wine-darker flex items-center justify-center">
                <Sparkles className="h-24 w-24 text-gold-light/50" />
              </div>
            </div>
          )}

          <div className="flex-1">
            <h1 className="fantasy-heading mb-2">{meta.name}</h1>

            <div className={`text-sm inline-block px-2 py-0.5 rounded mb-3 ${meta.rarity ? `rarity-${meta.rarity.toLowerCase()}` : ''}`}>
              {meta.rarity || 'Comum'}
            </div>

            <div className="text-lg mb-3 text-gold-light">
              {meta.type}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {meta.tags.map((tag: string) => (
                <span key={tag} className="bg-secondary px-3 py-1 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
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
    </div>
  )
}

