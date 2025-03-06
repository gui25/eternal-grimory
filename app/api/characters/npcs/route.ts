import { getCharacters } from "@/lib/mdx"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const npcs = await getCharacters("npc")
    return NextResponse.json(npcs)
  } catch (error) {
    console.error("Erro ao buscar NPCs:", error)
    return NextResponse.json({ error: "Erro ao buscar NPCs" }, { status: 500 })
  }
}

