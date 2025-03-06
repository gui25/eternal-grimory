import { getCharacters } from "@/lib/mdx"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const players = await getCharacters("player")
    return NextResponse.json(players)
  } catch (error) {
    console.error("Erro ao buscar personagens:", error)
    return NextResponse.json({ error: "Erro ao buscar personagens" }, { status: 500 })
  }
}

