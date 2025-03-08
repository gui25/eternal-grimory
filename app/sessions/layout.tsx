import { Metadata } from "next"
import { createMetadata } from "@/lib/metadata"
import { type ReactNode } from "react"

export const metadata: Metadata = createMetadata({
  title: "Sessões & Histórico",
  description: "Registros de todas as sessões e aventuras da campanha.",
  keywords: ["sessões", "aventuras", "história", "campanha", "diário"],
  path: "/sessions",
})

export default function SessionsLayout({ children }: { children: ReactNode }) {
  return children
} 