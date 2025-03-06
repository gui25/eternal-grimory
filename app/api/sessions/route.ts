import { getSessions } from "@/lib/mdx"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const sessions = await getSessions()
    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Erro ao buscar sessões:", error)
    return NextResponse.json({ error: "Erro ao buscar sessões" }, { status: 500 })
  }
}

