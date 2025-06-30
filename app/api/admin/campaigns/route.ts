import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { isAdminMode } from '@/lib/dev-utils'
import { CAMPAIGNS, type CampaignInfo } from '@/lib/campaign-config'

const CONTENT_DIR = path.join(process.cwd(), 'content')
const CAMPAIGN_CONFIG_PATH = path.join(process.cwd(), 'lib', 'campaign-config.ts')

interface Campaign {
  id: string
  name: string
  description: string
  active: boolean
  createdAt: string
  dmName?: string
}

// GET - Listar campanhas
export async function GET() {
  if (!isAdminMode()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    // Usar o campaign-config.ts como fonte de verdade
    const campaigns: Campaign[] = CAMPAIGNS
      .filter(campaign => campaign && campaign.id && campaign.name) // Filtrar objetos inválidos
      .map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        active: campaign.active,
        createdAt: '2024-01-01T00:00:00.000Z', // Placeholder - pode ser melhorado depois
        dmName: campaign.dmName
      }))

    // Ordenar por nome
    campaigns.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Error listing campaigns:', error)
    return NextResponse.json({ error: 'Erro ao listar campanhas' }, { status: 500 })
  }
}

// POST - Criar nova campanha
export async function POST(request: NextRequest) {
  if (!isAdminMode()) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const { name, slug, description, dmName } = await request.json()

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nome e slug são obrigatórios' }, { status: 400 })
    }

    // Verificar se a campanha já existe no config
    const existingCampaign = CAMPAIGNS.find(c => c.id === slug)
    if (existingCampaign) {
      return NextResponse.json({ error: 'Uma campanha com este ID já existe' }, { status: 409 })
    }

    const campaignPath = path.join(CONTENT_DIR, slug)

    // Verificar se o diretório já existe
    try {
      await fs.access(campaignPath)
      return NextResponse.json({ error: 'Um diretório com este nome já existe' }, { status: 409 })
    } catch {
      // Diretório não existe, pode criar
    }

    // Criar estrutura de diretórios da campanha
    const directories = [
      campaignPath,
      path.join(campaignPath, 'characters'),
      path.join(campaignPath, 'characters', 'player'),
      path.join(campaignPath, 'characters', 'npc'),
      path.join(campaignPath, 'characters', 'monster'),
      path.join(campaignPath, 'items'),
      path.join(campaignPath, 'sessions'),
      path.join(campaignPath, 'notes')
    ]

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true })
    }

    // Criar arquivo README.md inicial
    const readmeContent = `# ${name}

${description || 'Uma nova campanha de RPG.'}

## Estrutura

- **characters/player/** - Personagens dos jogadores
- **characters/npc/** - Personagens não-jogadores
- **characters/monster/** - Monstros e criaturas
- **items/** - Itens, armas, armaduras e equipamentos
- **sessions/** - Registros das sessões de jogo
- **notes/** - Anotações e registros importantes

## Como usar

Use o painel de administração para adicionar conteúdo a esta campanha.
`

    await fs.writeFile(path.join(campaignPath, 'README.md'), readmeContent)

    // Agora precisamos atualizar o campaign-config.ts
    const newCampaign: CampaignInfo = {
      id: slug,
      name,
      description: description || '',
      contentPath: slug,
      theme: {
        primary: "gold",
        secondary: "wine-dark",
        accent: "red-accent"
      },
      dmName: dmName || '',
      active: true
    }

    // Ler o arquivo campaign-config.ts atual
    const configContent = await fs.readFile(CAMPAIGN_CONFIG_PATH, 'utf-8')
    
    // Encontrar onde inserir a nova campanha (antes do fechamento do array)
    const campaignArrayRegex = /(export const CAMPAIGNS: CampaignInfo\[\] = \[)([\s\S]*?)(\];)/
    const match = configContent.match(campaignArrayRegex)
    
    if (match) {
      const [, arrayStart, existingCampaigns, arrayEnd] = match
      
      // Criar a string da nova campanha
      const newCampaignString = `  {
    id: "${newCampaign.id}",
    name: "${newCampaign.name}",
    description: "${newCampaign.description}",
    contentPath: "${newCampaign.contentPath}",
    theme: {
      primary: "${newCampaign.theme?.primary}",
      secondary: "${newCampaign.theme?.secondary}",
      accent: "${newCampaign.theme?.accent}"
    },
    dmName: "${newCampaign.dmName}",
    active: ${newCampaign.active}
  }`

      // Adicionar vírgula se já existem campanhas
      const separator = existingCampaigns.trim() ? ',\n' : '\n'
      const updatedCampaigns = existingCampaigns + separator + newCampaignString + '\n'
      
      const updatedConfig = configContent.replace(
        campaignArrayRegex,
        `${arrayStart}${updatedCampaigns}${arrayEnd}`
      )
      
      // Escrever o arquivo atualizado
      await fs.writeFile(CAMPAIGN_CONFIG_PATH, updatedConfig)
    }

    return NextResponse.json({ 
      message: 'Campanha criada com sucesso',
      campaign: {
        id: slug,
        name,
        description: description || '',
        active: true,
        createdAt: new Date().toISOString(),
        dmName: dmName || ''
      }
    })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Erro ao criar campanha' }, { status: 500 })
  }
} 