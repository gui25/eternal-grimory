import { Sparkles } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin">
          <Sparkles className="h-8 w-8 text-gold" />
        </div>
        <p className="text-gold-light text-sm">Carregando...</p>
      </div>
    </div>
  )
} 