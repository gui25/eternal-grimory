import { getItems } from "@/lib/mdx"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const items = await getItems()
    return NextResponse.json(items)
  } catch (error) {
    console.error("Erro ao buscar itens:", error)
    return NextResponse.json({ error: "Erro ao buscar itens" }, { status: 500 })
  }
}

