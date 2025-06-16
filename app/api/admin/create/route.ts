import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { isDevelopment } from '@/lib/dev-utils'
import { getCurrentCampaignIdFromCookies } from '@/lib/campaign-utils'
import { getCampaignContentPath } from '@/lib/mdx'

export async function POST(request: NextRequest) {
  try {
    // Verificar se estamos em desenvolvimento
    if (!isDevelopment()) {
      return NextResponse.json(
        { error: 'Admin API only available in development' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, slug, name, content, metadata } = body

    if (!type || !slug || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: type, slug, name' },
        { status: 400 }
      )
    }

    // Obter campanha atual
    const campaignId = await getCurrentCampaignIdFromCookies()
    
    // Determinar o tipo de conteúdo e caminho
    let contentType: string
    switch (type) {
      case 'monster':
        contentType = 'characters/monster'
        break
      case 'npc':
        contentType = 'characters/npc'
        break
      case 'player':
        contentType = 'characters/player'
        break
      case 'item':
        contentType = 'items'
        break
      case 'session':
        contentType = 'sessions'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        )
    }

    // Obter caminho do diretório
    const dirPath = await getCampaignContentPath(contentType, campaignId)
    
    // Criar diretório se não existir
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true })
    }

    // Caminho do arquivo
    const filePath = path.join(dirPath, `${slug}.md`)

    // Verificar se arquivo já existe
    if (existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File already exists' },
        { status: 409 }
      )
    }

    // Criar conteúdo do arquivo
    const frontmatter = createFrontmatter(type, name, metadata)
    const defaultContent = createDefaultContent(type, { name, slug, ...metadata })
    const fileContent = `${frontmatter}\n\n${content || defaultContent}`

    // Escrever arquivo
    await writeFile(filePath, fileContent, 'utf8')

    return NextResponse.json({
      success: true,
      message: 'File created successfully',
      path: filePath,
      slug
    })

  } catch (error) {
    console.error('Error creating file:', error)
    return NextResponse.json(
      { error: 'Failed to create file' },
      { status: 500 }
    )
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim()
}

function createFrontmatter(type: string, name: string, metadata: any): string {
  const baseData = {
    name,
    slug: metadata.slug || generateSlug(name),
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  }

  let frontmatterData: any = {}

  switch (type) {
    case 'monster':
      frontmatterData = {
        ...baseData,
        type: metadata.type || 'Monstro',
        challenge: metadata.challenge || '1',
        tags: metadata.tags || [],
        image: metadata.image || ''
      }
      break
    
    case 'npc':
      frontmatterData = {
        ...baseData,
        type: metadata.type || 'NPC',
        affiliation: metadata.affiliation || '',
        tags: metadata.tags || [],
        image: metadata.image || ''
      }
      break
    
    case 'player':
      frontmatterData = {
        ...baseData,
        player: metadata.player || '',
        class: metadata.class || 'Guerreiro',
        race: metadata.race || 'Humano',
        level: metadata.level || 1,
        tags: metadata.tags || [],
        image: metadata.image || ''
      }
      break
    
    case 'item':
      frontmatterData = {
        ...baseData,
        type: metadata.type || 'Item',
        rarity: metadata.rarity || 'Comum',
        tags: metadata.tags || [],
        image: metadata.image || '',
        description: metadata.description || ''
      }
      break
    
    case 'session':
      frontmatterData = {
        ...baseData,
        title: name, // Sessions use 'title' instead of 'name'
        date: metadata.date || new Date().toISOString().split('T')[0],
        tags: metadata.tags || [],
        image: metadata.image || ''
      }
      delete frontmatterData.name // Remove 'name' for sessions
      break
    
    default:
      frontmatterData = baseData
  }

  // Convert to YAML frontmatter
  let frontmatter = '---\n'
  for (const [key, value] of Object.entries(frontmatterData)) {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        frontmatter += `${key}: [${value.map((item: string) => `"${item}"`).join(', ')}]\n`
      } else {
        frontmatter += `${key}: []\n`
      }
    } else {
      frontmatter += `${key}: "${value}"\n`
    }
  }
  frontmatter += '---'
  
  return frontmatter
}

function createDefaultContent(type: string, data: any): string {
  switch (type) {
    case 'monster':
      return `# ${data.name}

Uma descrição detalhada da criatura, sua aparência, comportamento e origem.

## Estatísticas

**Classe de Armadura:** [Valor] ([Tipo de armadura])  
**Pontos de Vida:** [Valor] ([Dados de vida])  
**Deslocamento:** [Valor]m, [outros tipos de movimento]  
**Nível de Desafio:** ${data.challenge || '[Valor]'}

### Atributos
- **Força:** [Valor] (+[Modificador])
- **Destreza:** [Valor] (+[Modificador])
- **Constituição:** [Valor] (+[Modificador])
- **Inteligência:** [Valor] (+[Modificador])
- **Sabedoria:** [Valor] (+[Modificador])
- **Carisma:** [Valor] (+[Modificador])

### Resistências e Imunidades
- **Resistências a Dano:** [Tipos de dano]
- **Imunidades a Dano:** [Tipos de dano]
- **Imunidades a Condições:** [Condições]

## Habilidades

### [Nome da Habilidade Principal]
Descrição da habilidade mais importante da criatura, incluindo alcance, dano e testes de resistência.

### [Nome da Habilidade Secundária]
Descrição de outras habilidades especiais que a criatura possui.

### Ações Lendárias (se aplicável)
- **[Ação 1]:** Descrição da ação lendária
- **[Ação 2]:** Descrição da ação lendária

## Encontros Notáveis

### Sessão [Número]: [Título do Encontro]
Descrição de como a criatura foi encontrada pelos jogadores, o que aconteceu durante o combate e qual foi o resultado.

## História e Lore

Informações sobre a origem da criatura, sua motivação, território que habita e como ela se encaixa na narrativa da campanha.

### Relacionamentos
- **Aliados:** [Outras criaturas ou NPCs aliados]
- **Inimigos:** [Criaturas ou grupos que são inimigos]
- **Território:** [Onde a criatura pode ser encontrada]

## Tesouro

Lista de itens, ouro ou outros tesouros que a criatura pode carregar ou guardar em seu covil.

## Notas do Mestre

Dicas para interpretar a criatura, táticas de combate recomendadas e como usar efetivamente em diferentes situações.`

    case 'npc':
      return `# ${data.name}

Uma descrição detalhada do NPC, incluindo aparência física, personalidade e maneirismos distintivos.

## Informações Básicas

**Ocupação:** [Profissão ou papel social]  
**Localização:** [Onde pode ser encontrado]  
**Afiliação:** ${data.affiliation || '[Organização ou grupo]'}  
**Atitude Inicial:** [Amigável/Neutro/Hostil]

## Personalidade

### Traços de Personalidade
- [Traço distintivo 1]
- [Traço distintivo 2]

### Ideais
- [O que motiva o personagem]

### Vínculos
- [Pessoas, lugares ou coisas importantes para o NPC]

### Defeitos
- [Fraquezas ou falhas do personagem]

## História Pessoal

Informações sobre o passado do NPC, como chegou à sua posição atual e eventos importantes em sua vida.

## Relacionamentos

### Família e Amigos
- **[Nome]:** [Relacionamento e descrição]

### Aliados Profissionais
- **[Nome/Organização]:** [Natureza da relação]

### Rivais ou Inimigos
- **[Nome]:** [Motivo do conflito]

## Encontros com os Jogadores

### Sessão [Número]: [Título do Encontro]
Descrição de como o NPC interagiu com os jogadores, que informações foram trocadas e qual foi o resultado.

## Informações e Serviços

### O que o NPC Sabe
- [Informação importante 1]
- [Informação importante 2]
- [Rumores que pode compartilhar]

### Serviços Oferecidos
- [Serviço 1]: [Preço/Condições]
- [Serviço 2]: [Preço/Condições]

## Estatísticas de Combate (se necessário)

**Classe de Armadura:** [Valor]  
**Pontos de Vida:** [Valor]  
**Deslocamento:** [Valor]m  

### Ataques
- **[Arma]:** +[Bônus] para acertar, [Dano] de dano [tipo]

## Notas do Mestre

Dicas para interpretar o NPC, frases características e como usar efetivamente nas sessões.`

    case 'player':
      return `# ${data.name}

Uma descrição detalhada do personagem, incluindo aparência física, personalidade e história pessoal.

## Informações Básicas

**Jogador:** ${data.player || '[Nome do Jogador]'}  
**Classe:** ${data.class || '[Classe]'}  
**Raça:** ${data.race || '[Raça]'}  
**Nível:** ${data.level || '[Nível]'}  
**Antecedente:** [Antecedente escolhido]

## Atributos

**Força:** [Valor] (+[Modificador])  
**Destreza:** [Valor] (+[Modificador])  
**Constituição:** [Valor] (+[Modificador])  
**Inteligência:** [Valor] (+[Modificador])  
**Sabedoria:** [Valor] (+[Modificador])  
**Carisma:** [Valor] (+[Modificador])

## Personalidade

### Traços de Personalidade
- [Traço distintivo 1]
- [Traço distintivo 2]

### Ideais
- [O que motiva o personagem]

### Vínculos
- [Pessoas, lugares ou coisas importantes para o personagem]

### Defeitos
- [Fraquezas ou falhas do personagem]

## História Pessoal

Informações sobre o passado do personagem, sua origem, família e eventos que o levaram a se tornar um aventureiro.

### Família e Origens
- **Família:** [Informações sobre pais, irmãos, etc.]
- **Local de Nascimento:** [Cidade, vila ou região]
- **Educação:** [Como e onde aprendeu suas habilidades]

## Equipamentos Principais

### Armas
- **[Arma Principal]:** [Descrição e propriedades especiais]
- **[Arma Secundária]:** [Descrição e uso]

### Armadura
- **[Tipo de Armadura]:** [Descrição e proteção oferecida]

### Itens Especiais
- **[Item Importante]:** [Descrição e significado pessoal]

## Objetivos e Motivações

### Objetivos de Curto Prazo
- [Objetivo imediato 1]
- [Objetivo imediato 2]

### Objetivos de Longo Prazo
- [Ambição principal do personagem]
- [Legado que deseja deixar]

## Relacionamentos no Grupo

### Aliados
- **[Nome do Personagem]:** [Natureza da relação]

### Dinâmica de Grupo
- [Como o personagem interage com o grupo]
- [Papel que assume nas aventuras]

## Desenvolvimento do Personagem

### Marcos Importantes
- **Nível [X]:** [Evento ou realização significativa]

### Mudanças de Personalidade
- [Como o personagem evoluiu durante as aventuras]

## Notas do Jogador

[Espaço para o jogador adicionar suas próprias observações, estratégias preferidas e aspectos do personagem que gosta de enfatizar]`

    case 'item':
      return `# ${data.name}

Uma descrição detalhada do item, incluindo sua aparência, materiais e características distintivas.

## Propriedades do Item

**Tipo:** ${data.type || '[Categoria do item]'}  
**Raridade:** ${data.rarity || '[Comum/Incomum/Raro/Épico/Lendário]'}  
**Requer Sintonia:** [Sim/Não]  
**Peso:** [Valor] kg  
**Valor:** [Valor] po (estimado)

## Efeitos Mágicos

### Propriedade Principal
Descrição do efeito mágico principal do item e como ele funciona.

### Propriedades Secundárias
- **[Propriedade 1]:** Descrição do efeito
- **[Propriedade 2]:** Descrição do efeito

### Limitações
- [Limitação 1]: Descrição
- [Limitação 2]: Descrição

## História do Item

### Origem
Informações sobre quem criou o item, quando e por que motivo.

### Proprietários Anteriores
Lista de pessoas notáveis que possuíram o item e o que aconteceu com eles.

## Encontros com os Jogadores

### Sessão [Número]: [Como foi Obtido]
Descrição de como os jogadores encontraram ou obtiveram o item.

### Usos Notáveis
- **Sessão [Número]:** [Como foi usado e resultado]

## Lore e Lendas

Histórias, mitos ou lendas associadas ao item que podem ser conhecidas por estudiosos ou sábios.

## Variações

### [Nome da Variação]
Descrição de versões alternativas do item com propriedades ligeiramente diferentes.

## Notas do Mestre

Dicas sobre como introduzir o item na campanha, possíveis consequências de seu uso e ganchos de aventura relacionados.`

    case 'session':
      return `# ${data.name}

## Resumo da Sessão

Breve resumo dos eventos principais que aconteceram durante a sessão.

## Participantes

### Jogadores Presentes
- **[Nome do Personagem]** ([Nome do Jogador])
- **[Nome do Personagem]** ([Nome do Jogador])

### NPCs Importantes
- **[Nome do NPC]:** [Papel na sessão]

## Eventos Principais

### [Título do Evento 1]
Descrição detalhada do primeiro evento importante da sessão.

### [Título do Evento 2]
Descrição detalhada do segundo evento importante da sessão.

## Combates

### [Nome do Encontro]
- **Inimigos:** [Lista de criaturas enfrentadas]
- **Resultado:** [Vitória/Derrota/Fuga/Negociação]
- **Recompensas:** [XP, itens, ouro obtidos]

## Interpretação e Roleplay

### Momentos Marcantes
- [Momento de roleplay importante 1]
- [Momento de roleplay importante 2]

### Desenvolvimento de Personagem
- **[Nome do Personagem]:** [Como o personagem evoluiu ou mudou]

## Descobertas e Informações

### Novas Informações Obtidas
- [Informação importante 1]
- [Informação importante 2]

### Mistérios Revelados
- [Mistério que foi solucionado]

### Novos Mistérios
- [Novo mistério introduzido]

## Decisões Importantes

### [Título da Decisão]
Descrição da decisão tomada pelos jogadores e suas possíveis consequências.

## Itens e Recompensas

### Itens Encontrados
- **[Nome do Item]:** [Quem ficou com ele]

### Experiência Ganha
- **Total de XP:** [Valor]
- **Novo Nível:** [Se algum personagem subiu de nível]

## Ganchos para Próximas Sessões

### Objetivos Imediatos
- [Objetivo 1]
- [Objetivo 2]

### Questões em Aberto
- [Questão que precisa ser resolvida]

## Notas do Mestre

### O que Funcionou Bem
- [Aspecto positivo da sessão]

### Pontos de Melhoria
- [Aspecto que pode ser melhorado]

### Preparação para Próxima Sessão
- [O que precisa ser preparado]`

    default:
      return `# ${data.name}\n\nDescreva aqui o conteúdo...`
  }
} 