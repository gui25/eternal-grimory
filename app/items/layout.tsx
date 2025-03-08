import { Metadata } from "next"
import { createMetadata } from "@/lib/metadata"

export const metadata: Metadata = createMetadata({
  title: "Biblioteca de Itens",
  description: "Explore a coleção de itens mágicos, armas, armaduras e artefatos da campanha.",
  keywords: ["itens", "armas", "equipamentos", "magia", "artefatos"],
  path: "/items",
})

export default function ItemsLayout({ children }: { children: React.ReactNode }) {
  return children
}
