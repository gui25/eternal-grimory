import { Metadata } from "next"
import { createMetadata } from "@/lib/metadata"
import { type ReactNode } from "react"

export const metadata: Metadata = createMetadata({
  title: "Personagens & NPCs",
  description: "Conheça todos os personagens, NPCs e monstros da campanha.",
  keywords: ["personagens", "jogadores", "NPCs", "monstros", "criaturas"],
  path: "/characters",
})

export default function CharactersLayout({ children }: { children: ReactNode }) {
  return children
}
