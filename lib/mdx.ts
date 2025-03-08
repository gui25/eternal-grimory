import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"
import { getCurrentCampaignId, getCampaignById } from "@/lib/campaign-config"

// Atualize as interfaces para incluir o campo de imagem opcional

export type ItemMeta = {
  name: string
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"
  type: string
  tags: string[]
  slug: string
  image?: string
  description?: string
  campaignId?: string
}

export type SessionMeta = {
  date: string
  session_number: number
  players: string[]
  slug: string
  image?: string
  description?: string
  campaignId?: string
}

export type CharacterMeta = {
  name: string
  type: string
  affiliation: string
  tags: string[]
  slug: string
  category: "npc" | "monster" | "player"
  challenge?: string // For monsters
  class?: string // For players
  level?: number // For players
  race?: string // For players
  player?: string // For players (the real person's name)
  image?: string
  description?: string
  campaignId?: string
}

// Convert markdown to HTML
async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown)
  return result.toString()
}

// Ensure directory exists
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// Get campaign content directory path
function getCampaignContentPath(contentType: string, campaignId?: string): string {
  // Log para depuração - qual campaignId foi passado para a função
  console.log(`getCampaignContentPath chamado com campaignId: ${campaignId || 'não especificado'}`)
  
  // Se um campaignId específico for fornecido, priorize-o
  let currentCampaignId: string
  
  if (campaignId) {
    // Se um ID foi explicitamente passado, use-o
    currentCampaignId = campaignId
    console.log(`Usando campaignId passado explicitamente: ${currentCampaignId}`)
  } else {
    // Caso contrário, obtenha a campanha atual do sistema
    currentCampaignId = getCurrentCampaignId()
    console.log(`Obtido campaignId do sistema: ${currentCampaignId}`)
  }
  
  // Obtenha os detalhes da campanha
  const campaign = getCampaignById(currentCampaignId)
  
  // Se a campanha existe, use seu caminho de conteúdo, caso contrário, use o padrão
  const campaignPath = campaign?.contentPath || "penumbra-eterna"
  
  // Log detalhado para depuração
  console.log(`Loading ${contentType} from campaign: ${campaignPath} (ID: ${currentCampaignId}, Exists: ${!!campaign})`)
  
  const fullPath = path.join(process.cwd(), "content", campaignPath, contentType)
  console.log(`Caminho completo do diretório: ${fullPath}`)
  
  // Verifica se o diretório existe
  const directoryExists = fs.existsSync(fullPath)
  console.log(`Diretório existe: ${directoryExists}`)
  
  return fullPath
}

// Get list of all items with their metadata
export async function getItems(campaignId?: string): Promise<ItemMeta[]> {
  const directory = getCampaignContentPath("items", campaignId)
  ensureDirectoryExists(directory)

  const files = fs.readdirSync(directory)
  const mdFiles = files.filter((file) => file.endsWith(".md"))

  const items = mdFiles.map((filename) => {
    const filePath = path.join(directory, filename)
    const fileContent = fs.readFileSync(filePath, "utf8")

    // Use gray-matter to parse the frontmatter
    const { data } = matter(fileContent)

    return {
      ...data,
      slug: filename.replace(".md", ""),
      campaignId: campaignId || getCurrentCampaignId(),
    } as ItemMeta
  })

  return items
}

// Get specific item by slug
export async function getItem(slug: string, campaignId?: string) {
  const directory = getCampaignContentPath("items", campaignId)
  const filePath = path.join(directory, `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContent = fs.readFileSync(filePath, "utf8")

  // Use gray-matter to parse the frontmatter
  const { data, content } = matter(fileContent)

  // Convert markdown to HTML
  const contentHtml = await markdownToHtml(content)

  return {
    contentHtml,
    meta: {
      ...data,
      slug,
      campaignId: campaignId || getCurrentCampaignId(),
    },
  }
}

// Get list of all sessions with their metadata
export async function getSessions(campaignId?: string): Promise<SessionMeta[]> {
  const directory = getCampaignContentPath("sessions", campaignId)
  ensureDirectoryExists(directory)

  const files = fs.readdirSync(directory)
  const mdFiles = files.filter((file) => file.endsWith(".md"))

  const sessions = mdFiles.map((filename) => {
    const filePath = path.join(directory, filename)
    const fileContent = fs.readFileSync(filePath, "utf8")

    // Use gray-matter to parse the frontmatter
    const { data } = matter(fileContent)

    return {
      ...data,
      slug: filename.replace(".md", ""),
      campaignId: campaignId || getCurrentCampaignId(),
    } as SessionMeta
  })

  return sessions.sort((a, b) => b.session_number - a.session_number)
}

// Get specific session by slug
export async function getSession(slug: string, campaignId?: string) {
  const directory = getCampaignContentPath("sessions", campaignId)
  const filePath = path.join(directory, `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContent = fs.readFileSync(filePath, "utf8")

  // Use gray-matter to parse the frontmatter
  const { data, content } = matter(fileContent)

  // Convert markdown to HTML
  const contentHtml = await markdownToHtml(content)

  return {
    contentHtml,
    meta: {
      ...data,
      slug,
      campaignId: campaignId || getCurrentCampaignId(),
    },
  }
}

// Get list of all characters with their metadata
export async function getCharacters(
  category: "npc" | "monster" | "player", 
  campaignId?: string
): Promise<CharacterMeta[]> {
  const directory = getCampaignContentPath(`characters/${category}`, campaignId)
  ensureDirectoryExists(directory)

  const files = fs.readdirSync(directory)
  const mdFiles = files.filter((file) => file.endsWith(".md"))

  const characters = mdFiles.map((filename) => {
    const filePath = path.join(directory, filename)
    const fileContent = fs.readFileSync(filePath, "utf8")

    // Use gray-matter to parse the frontmatter
    const { data } = matter(fileContent)

    return {
      ...data,
      slug: filename.replace(".md", ""),
      category,
      campaignId: campaignId || getCurrentCampaignId(),
    } as CharacterMeta
  })

  return characters
}

// Get specific character by slug and category
export async function getCharacter(
  slug: string, 
  category: "npc" | "monster" | "player", 
  campaignId?: string
) {
  const directory = getCampaignContentPath(`characters/${category}`, campaignId)
  const filePath = path.join(directory, `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContent = fs.readFileSync(filePath, "utf8")

  // Use gray-matter to parse the frontmatter
  const { data, content } = matter(fileContent)

  // Convert markdown to HTML
  const contentHtml = await markdownToHtml(content)

  return {
    contentHtml,
    meta: {
      ...data,
      slug,
      category,
      campaignId: campaignId || getCurrentCampaignId(),
    },
  }
}

