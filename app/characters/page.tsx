import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, User } from "lucide-react"
import { getCharacters } from "@/lib/mdx"
import { PageContainer } from "@/components/ui/page-container"

export default async function CharactersPage() {
  const npcs = await getCharacters("npc")
  const monsters = await getCharacters("monster")
  const players = await getCharacters("player")

  return (
    <PageContainer>
      <h1 className="fantasy-heading">Personagens</h1>
      <p className="text-muted-foreground">Navegue pelos personagens dos jogadores, NPCs e monstros da sua campanha.</p>

      <div className="grid gap-6 sm:grid-cols-3">
        <Link href="/characters/players">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">Jogadores</CardTitle>
              <User className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{players.length}</div>
              <p className="text-muted-foreground">Personagens dos jogadores na sua campanha.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/characters/npcs">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">NPCs</CardTitle>
              <Users className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{npcs.length}</div>
              <p className="text-muted-foreground">Aliados, vilões e personagens neutros.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/characters/monsters">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">Monstros</CardTitle>
              <Shield className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monsters.length}</div>
              <p className="text-muted-foreground">Criaturas e inimigos encontrados.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </PageContainer>
  )
}

