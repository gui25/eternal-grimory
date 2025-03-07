import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Shield, Sword, Scroll, Users, BirdIcon as Dragon, Sparkles } from "lucide-react"
import { getItems, getSessions, getCharacters } from "@/lib/mdx"
import RecentActivity from "@/components/recent-activity"
import ConfettiButton from "@/components/confetti-button"
import { PageContainer } from "@/components/ui/page-container"

export default async function Dashboard() {
  // Get actual counts from MDX content
  const items = await getItems()
  const sessions = await getSessions()
  const players = await getCharacters("player")
  const npcs = await getCharacters("npc")
  const monsters = await getCharacters("monster")

  return (
    <PageContainer>
  
      <div className="flex flex-col sm:flex-row sm:items-center items-center sm:justify-between gold-border p-4 gap-4">
        <div>
          <h1 className="fantasy-heading flex items-center gap-2">
            <Dragon className="h-8 w-8 text-gold" />
            Painel da Campanha
          </h1>
          <p className="text-gold-light/80 mt-2">
          Bem-vindo ao Grimório Eterno – uma biblioteca definitiva para uma campanha de RPG
          </p>
        </div>
        <div className="sm:self-center">
          <ConfettiButton className="w-full sm:w-auto">A Aventura Aguarda!</ConfettiButton>
        </div>
      </div>

      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-gold" />
            <h2 className="fantasy-subheading">Personagens dos Jogadores</h2>
          </div>
          <div className="text-xs text-gold-light/70 sm:ml-2">Os heróis da sua campanha</div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {players.length > 0 ? (
            players.slice(0, 3).map((player) => (
              <Link key={player.slug} href={`/characters/players/${player.slug}`} className="h-full">
                <div className="character-card h-full">
                  <h3 className="character-name flex items-center">
                    <Sparkles className="h-4 w-4 mr-1 flex-shrink-0 text-gold" />
                    {player.name}
                  </h3>
                  <p className="character-info">
                    Level {player.level} {player.race} {player.class}
                  </p>
                  <span className="player-name">Played by: {player.player}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="character-card col-span-full">
              <p className="text-gold-light/70">No player characters added yet.</p>
            </div>
          )}
        </div>

        {players.length > 3 && (
          <div className="flex justify-center mt-6">
            <Link href="/characters/players" prefetch={true}>
              <ConfettiButton className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Ver Todos os Personagens
              </ConfettiButton>
            </Link>
          </div>
        )}
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/items" prefetch={true} className="h-full">
          <Card className="stat-card h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-gold">Itens</h3>
                <Sword className="h-5 w-5 text-gold" />
              </div>
              <div className="stat-value">{items.length}</div>
              <p className="text-sm text-gold-light/70 mt-2">Armas, Armaduras, Poções e mais</p>
            </div>
          </Card>
        </Link>

        <Link href="/sessions" className="h-full">
          <Card className="stat-card h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-gold">Sessões</h3>
                <Scroll className="h-5 w-5 text-gold" />
              </div>
              <div className="stat-value">{sessions.length}</div>
              <p className="text-sm text-gold-light/70 mt-2">Registros de aventuras e relatórios de campanha</p>
            </div>
          </Card>
        </Link>

        <Link href="/characters/npcs" className="h-full">
          <Card className="stat-card h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-gold">NPCs</h3>
                <Users className="h-5 w-5 text-gold" />
              </div>
              <div className="stat-value">{npcs.length}</div>
              <p className="text-sm text-gold-light/70 mt-2">Aliados, vilões e personagens neutros</p>
            </div>
          </Card>
        </Link>

        <Link href="/characters/monsters" className="h-full">
          <Card className="stat-card h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-gold">Monstros</h3>
                <Shield className="h-5 w-5 text-gold" />
              </div>
              <div className="stat-value">{monsters.length}</div>
              <p className="text-sm text-gold-light/70 mt-2">Criaturas e inimigos encontrados</p>
            </div>
          </Card>
        </Link>
      </div>
      {/* Recent Activity - Client Component that only renders when there's activity */}
      <RecentActivity />
    </PageContainer>
  )
}

