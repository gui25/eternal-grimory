import { getCharacters } from "@/lib/mdx"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const monsters = await getCharacters("monster")
    return NextResponse.json(monsters)
  } catch (error) {
    console.error("Erro ao buscar monstros:", error)
    return NextResponse.json({ error: "Erro ao buscar monstros" }, { status: 500 })
  }
}

