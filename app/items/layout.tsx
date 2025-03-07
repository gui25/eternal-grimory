import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Biblioteca de Itens | Grimório Eterno",
  description: "Explore a coleção de itens mágicos, armas, armaduras e artefatos da campanha."
}

export default function ItemsLayout({ children }: { children: React.ReactNode }) {
  return children
}
