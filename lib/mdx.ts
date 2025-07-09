import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"
import { compile, CompileOptions } from "@mdx-js/mdx"
import { getCurrentCampaignId, getCampaignById, CAMPAIGNS } from "@/lib/campaign-config"
import { getCurrentCampaignIdFromCookies } from "@/lib/campaign-utils"
import { notFound } from 'next/navigation'

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
  tags: string[]
  slug: string
  image?: string
  description?: string
  campaignId?: string
}

export type NotesMeta = {
  name: string
  date?: string
  description: string
  tags: string[]
  slug: string
  image?: string
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

// Process MDX content with React components
export async function processMDX(content: string) {
  try {
    const compiled = await compile(content, {
      outputFormat: 'function-body',
      development: process.env.NODE_ENV === 'development'
    } as CompileOptions)
    
    return compiled.toString()
  } catch (error) {
    console.error('Error processing MDX:', error)
    // Fallback to regular markdown
    return await markdownToHtml(content)
  }
}

// Ensure directory exists
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// Get campaign content directory path
export async function getCampaignContentPath(contentType: string, campaignId?: string): Promise<string> {
  console.log(`[CAMPAIGN-PATH] Buscando caminho para tipo ${contentType}, campaignId fornecido: ${campaignId || 'nenhum'}`);
  
  // Se um campaignId foi fornecido, use-o
  if (campaignId) {
    const campaign = CAMPAIGNS.find(c => c.id === campaignId);
    if (campaign && campaign.active) {
      const fullPath = path.join(process.cwd(), 'content', campaign.contentPath, contentType);
      console.log(`[CAMPAIGN-PATH] Usando campanha específica: ${campaignId}, path: ${campaign.contentPath}, fullPath: ${fullPath}`);
      return fullPath;
    } else {
      console.log(`[CAMPAIGN-PATH] Campanha especificada ${campaignId} não encontrada ou inativa`);
    }
  }
  
  // Tentar obter o campaignId de uma query string se estivermos no cliente
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCampaignId = urlParams.get('campaign');
    if (urlCampaignId) {
      const urlCampaign = CAMPAIGNS.find(c => c.id === urlCampaignId);
      if (urlCampaign && urlCampaign.active) {
        const fullPath = path.join(process.cwd(), 'content', urlCampaign.contentPath, contentType);
        console.log(`[CAMPAIGN-PATH] Usando campanha da URL: ${urlCampaignId}, path: ${urlCampaign.contentPath}, fullPath: ${fullPath}`);
        return fullPath;
      }
    }
  }
  
  // Tentar obter de um arquivo de configuração ou header especial
  try {
    // Verifica se existe um arquivo de configuração em runtime
    const configPath = path.join(process.cwd(), '.campaign-config');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8').trim();
      if (configContent) {
        const configCampaign = CAMPAIGNS.find(c => c.id === configContent);
        if (configCampaign && configCampaign.active) {
          const fullPath = path.join(process.cwd(), 'content', configCampaign.contentPath, contentType);
          console.log(`[CAMPAIGN-PATH] Usando campanha do arquivo de config: ${configContent}, path: ${configCampaign.contentPath}, fullPath: ${fullPath}`);
          return fullPath;
        }
      }
    }
  } catch (error) {
    console.error('[CAMPAIGN-PATH] Erro ao ler arquivo de configuração:', error);
  }
  
  // Última tentativa: tentar obter dos cookies
  try {
    // No servidor, devemos usar getCurrentCampaignIdFromCookies
    if (typeof window === 'undefined') {
      const cookieCampaignId = await getCurrentCampaignIdFromCookies();
      console.log(`[CAMPAIGN-PATH] cookieCampaignId obtido: ${cookieCampaignId || 'nenhum'}`);
      
      if (cookieCampaignId) {
        const cookieCampaign = CAMPAIGNS.find(c => c.id === cookieCampaignId);
        if (cookieCampaign && cookieCampaign.active) {
          const campaignPath = cookieCampaign.contentPath;
          const fullPath = path.join(process.cwd(), 'content', campaignPath, contentType);
          
          console.log(`[CAMPAIGN-PATH] Usando campanha de cookie: ${cookieCampaignId}, path: ${campaignPath}, fullPath: ${fullPath}`);
          return fullPath;
        } else {
          console.log(`[CAMPAIGN-PATH] Campanha de cookie ${cookieCampaignId} não encontrada ou inativa`);
        }
      } else {
        console.log(`[CAMPAIGN-PATH] Nenhum cookie de campanha encontrado`);
      }
    } else {
      // No cliente, usamos localStorage
      if (typeof localStorage !== 'undefined') {
        const storageCampaignId = localStorage.getItem('current-campaign');
        console.log(`[CAMPAIGN-PATH] storageCampaignId obtido: ${storageCampaignId || 'nenhum'}`);
        
        if (storageCampaignId) {
          const storageCampaign = CAMPAIGNS.find(c => c.id === storageCampaignId);
          if (storageCampaign && storageCampaign.active) {
            const campaignPath = storageCampaign.contentPath;
            const fullPath = path.join(process.cwd(), 'content', campaignPath, contentType);
            
            console.log(`[CAMPAIGN-PATH] Usando campanha de localStorage: ${storageCampaignId}, path: ${campaignPath}, fullPath: ${fullPath}`);
            return fullPath;
          } else {
            console.log(`[CAMPAIGN-PATH] Campanha de localStorage ${storageCampaignId} não encontrada ou inativa`);
          }
        } else {
          console.log(`[CAMPAIGN-PATH] Nenhum localStorage de campanha encontrado`);
        }
      }
    }
  } catch (error) {
    console.error('[CAMPAIGN-PATH] Erro ao obter campanha de cookies/localStorage:', error);
  }
  
  // Se chegamos aqui, use a primeira campanha ativa como fallback
  const defaultCampaign = CAMPAIGNS.find(c => c.active) || CAMPAIGNS[0];
  const defaultPath = defaultCampaign.contentPath;
  const fullPath = path.join(process.cwd(), 'content', defaultPath, contentType);
  
  console.log(`[CAMPAIGN-PATH] Usando campanha padrão: ${defaultCampaign.id}, path: ${defaultPath}, fullPath: ${fullPath}`);
  return fullPath;
}

// Get list of all items with their metadata
export async function getItems(campaignId?: string): Promise<ItemMeta[]> {
  console.log(`[ITEMS] Obtendo itens para campanha: ${campaignId || 'não especificado'}`);
  
  // Obter o diretório de conteúdo
  const directory = await getCampaignContentPath("items", campaignId);
  console.log(`[ITEMS] Buscando em: ${directory}`);
  
  ensureDirectoryExists(directory);

  const files = fs.readdirSync(directory);
  const mdFiles = files.filter((file) => file.endsWith(".md"));
  
  console.log(`[ITEMS] Encontrados ${mdFiles.length} itens.`);

  const items = mdFiles.map((filename) => {
    const filePath = path.join(directory, filename);
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Use gray-matter to parse the frontmatter
    const { data } = matter(fileContent);
    const finalCampaignId = campaignId || CAMPAIGNS.find(c => c.contentPath === directory.split('/').slice(-2)[0])?.id || CAMPAIGNS[0].id;

    // Usar `as unknown as ItemMeta` para evitar erros de tipo com propriedades adicionais
    return {
      ...data,
      slug: filename.replace(".md", ""),
      campaignId: finalCampaignId,
      _source: {
        path: filePath,
        campaignPath: directory.split('/').slice(-2)[0]
      }
    } as unknown as ItemMeta
  });

  return items;
}

// Get specific item by slug
export async function getItem(slug: string, campaignId?: string) {
  console.log(`[ITEM] Obtendo item ${slug} para campanha: ${campaignId || 'não especificado'}`);
  
  // Obter o diretório de conteúdo
  const directory = await getCampaignContentPath("items", campaignId);
  console.log(`[ITEM] Buscando em: ${directory}`);
  
  const filePath = path.join(directory, `${slug}.md`);
  console.log(`[ITEM] Caminho do arquivo: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log(`[ITEM] Arquivo não encontrado: ${filePath}`);
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf8");

  // Use gray-matter to parse the frontmatter
  const { data, content } = matter(fileContent);

  // Convert markdown to HTML
  const contentHtml = await markdownToHtml(content);
  
  const finalCampaignId = campaignId || CAMPAIGNS.find(c => c.contentPath === directory.split('/').slice(-2)[0])?.id || CAMPAIGNS[0].id;

  return {
    contentHtml,
    meta: {
      ...data,
      slug,
      campaignId: finalCampaignId,
      _source: {
        path: filePath,
        campaignPath: directory.split('/').slice(-2)[0]
      }
    },
  };
}

// Get list of all sessions with their metadata
export async function getSessions(campaignId?: string): Promise<SessionMeta[]> {
  console.log(`[SESSIONS] Obtendo sessões para campanha: ${campaignId || 'não especificado'}`);
  
  // Se não foi especificado um ID de campanha, vamos verificar a query string
  if (!campaignId && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCampaignId = urlParams.get('campaign');
    if (urlCampaignId) {
      console.log(`[SESSIONS] Usando campanha da URL: ${urlCampaignId}`);
      campaignId = urlCampaignId;
    }
  }
  
  // Obter o diretório de conteúdo
  const directory = await getCampaignContentPath("sessions", campaignId);
  console.log(`[SESSIONS] Buscando em: ${directory}`);
  
  ensureDirectoryExists(directory);

  const files = fs.readdirSync(directory);
  const mdFiles = files.filter((file) => file.endsWith(".md"));
  
  console.log(`[SESSIONS] Encontradas ${mdFiles.length} sessões.`);

  const sessions = mdFiles.map((filename) => {
    const filePath = path.join(directory, filename);
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Use gray-matter to parse the frontmatter
    const { data } = matter(fileContent);
    const finalCampaignId = campaignId || CAMPAIGNS.find(c => c.contentPath === directory.split('/').slice(-2)[0])?.id || CAMPAIGNS[0].id;

    // Usar `as unknown as SessionMeta` para evitar erros de tipo com propriedades adicionais
    return {
      ...data,
      slug: filename.replace(".md", ""),
      campaignId: finalCampaignId,
      _source: {
        path: filePath,
        campaignPath: directory.split('/').slice(-2)[0]
      }
    } as unknown as SessionMeta;
  });

  return sessions.sort((a, b) => b.session_number - a.session_number);
}

// Get specific session by slug
export async function getSession(slug: string, campaignId?: string) {
  const directory = await getCampaignContentPath("sessions", campaignId)
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
  const directory = await getCampaignContentPath(`characters/${category}`, campaignId)
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
// Get list of all notes with their metadata
export async function getNotes(campaignId?: string): Promise<NotesMeta[]> {
  console.log(`[NOTES] Obtendo anotações para campanha: ${campaignId || 'não especificado'}`);
  
  // Obter o diretório de conteúdo
  const directory = await getCampaignContentPath("notes", campaignId);
  console.log(`[NOTES] Buscando em: ${directory}`);
  
  ensureDirectoryExists(directory);

  const files = fs.readdirSync(directory);
  const mdFiles = files.filter((file) => file.endsWith(".md"));
  
  console.log(`[NOTES] Encontradas ${mdFiles.length} anotações.`);

  const notes = mdFiles.map((filename) => {
    const filePath = path.join(directory, filename);
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Use gray-matter to parse the frontmatter
    const { data } = matter(fileContent);
    const finalCampaignId = campaignId || CAMPAIGNS.find(c => c.contentPath === directory.split('/').slice(-2)[0])?.id || CAMPAIGNS[0].id;

    return {
      ...data,
      slug: filename.replace(".md", ""),
      campaignId: finalCampaignId,
      _source: {
        path: filePath,
        campaignPath: directory.split('/').slice(-2)[0]
      }
    } as unknown as NotesMeta
  });

  // Sort by date (most recent first) or by name if no date
  return notes.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return a.name.localeCompare(b.name);
  });
}

// Get single note by slug
export async function getNote(slug: string, campaignId?: string) {
  console.log(`[NOTE] Obtendo anotação ${slug} para campanha: ${campaignId || 'não especificado'}`);
  
  const directory = await getCampaignContentPath("notes", campaignId);
  ensureDirectoryExists(directory);
  
  const filePath = path.join(directory, `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`[NOTE] Arquivo não encontrado: ${filePath}`);
    notFound();
  }

  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContent);
  const htmlContent = await markdownToHtml(content);
  const finalCampaignId = campaignId || CAMPAIGNS.find(c => c.contentPath === directory.split('/').slice(-2)[0])?.id || CAMPAIGNS[0].id;

  return {
    ...data,
    slug,
    content: htmlContent,
    campaignId: finalCampaignId,
    _source: {
      path: filePath,
      campaignPath: directory.split('/').slice(-2)[0]
    }
  };
}

export async function getCharacter(
  slug: string, 
  category: "npc" | "monster" | "player", 
  campaignId?: string
) {
  const directory = await getCampaignContentPath(`characters/${category}`, campaignId)
  const filePath = path.join(directory, `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContent = fs.readFileSync(filePath, "utf8")

  // Use gray-matter to parse the frontmatter
  const { data, content } = matter(fileContent)

  // Convert markdown to HTML for fallback
  const contentHtml = await markdownToHtml(content)

  return {
    contentHtml,
    contentMdx: content, // Raw MDX content for proper processing
    meta: {
      ...data,
      slug,
      category,
      campaignId: campaignId || getCurrentCampaignId(),
    },
  }
}

