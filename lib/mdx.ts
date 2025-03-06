import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

// Atualize as interfaces para incluir o campo de imagem opcional

export type ItemMeta = {
  name: string
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"
  type: string
  tags: string[]
  slug: string
  image?: string
  description?: string
}

export type SessionMeta = {
  date: string
  session_number: number
  players: string[]
  slug: string
  image?: string
  description?: string
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

// Get list of all items with their metadata
export async function getItems(): Promise<ItemMeta[]> {
  const directory = path.join(process.cwd(), "content/items")
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
    } as ItemMeta
  })

  return items
}

// Get specific item by slug
export async function getItem(slug: string) {
  const filePath = path.join(process.cwd(), `content/items/${slug}.md`)

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
    },
  }
}

// Get list of all sessions with their metadata
export async function getSessions(): Promise<SessionMeta[]> {
  const directory = path.join(process.cwd(), "content/sessions")
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
    } as SessionMeta
  })

  return sessions.sort((a, b) => b.session_number - a.session_number)
}

// Get specific session by slug
export async function getSession(slug: string) {
  const filePath = path.join(process.cwd(), `content/sessions/${slug}.md`)

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
    },
  }
}

// Get list of all characters with their metadata
export async function getCharacters(category: "npc" | "monster" | "player"): Promise<CharacterMeta[]> {
  const directory = path.join(process.cwd(), `content/characters/${category}`)
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
    } as CharacterMeta
  })

  return characters
}

// Get specific character by slug and category
export async function getCharacter(slug: string, category: "npc" | "monster" | "player") {
  const filePath = path.join(process.cwd(), `content/characters/${category}/${slug}.md`)

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
    },
  }
}

