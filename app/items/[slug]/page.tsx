import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getItem } from "@/lib/mdx"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import TrackView from "@/components/track-view"

function getRarityBadgeClass(rarity: string) {
  switch (rarity.toLowerCase()) {
    case "common":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    case "uncommon":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "rare":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "epic":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    case "legendary":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
  }
}

export default async function ItemPage({ params }: { params: { slug: string } }) {
  // Get the actual content
  const item = await getItem(params.slug)
  if (!item) notFound()

  const { contentHtml, meta } = item

  return (
    <div className="max-w-3xl mx-auto">
      {/* Track this view */}
      <TrackView
        item={{
          slug: meta.slug,
          name: meta.name,
          type: meta.type,
          rarity: meta.rarity,
          category: "item",
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
          {meta.image && (
            <div className="w-full md:w-1/3 flex-shrink-0">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gold-dark">
                <Image src={meta.image || "/placeholder.svg"} alt={meta.name} fill className="object-cover" />
              </div>
            </div>
          )}

          <div className="flex-1">
            <h1 className="fantasy-heading mb-4">{meta.name}</h1>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRarityBadgeClass(meta.rarity)}`}>
                {meta.rarity}
              </span>
              <span className="px-3 py-1 rounded-full bg-secondary text-sm font-medium">{meta.type}</span>
              {meta.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-secondary text-sm font-medium">
                  {tag}
                </span>
              ))}
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

