/**
 * Gerenciador de conteúdo principal do CMS
 */
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { ContentQuery, ContentMutation, ApiResponse, HookContext } from './types'
import { getContentType, validateContentType } from './config'
import { cache, withCache, hashQuery } from './cache'
import { validateContent } from './validation'
import { executeBeforeHooks, executeAfterHooks } from './hooks'
import { getCampaignContentPath } from '../mdx'

export class ContentManager {
  private static instance: ContentManager

  static getInstance(): ContentManager {
    if (!ContentManager.instance) {
      ContentManager.instance = new ContentManager()
    }
    return ContentManager.instance
  }

  // Buscar conteúdo com cache e filtros avançados
  async findContent<T = any>(query: ContentQuery): Promise<ApiResponse<T[]>> {
    try {
      const {
        type,
        campaign,
        status,
        tags,
        search,
        limit = 50,
        offset = 0,
        sortBy = 'updated',
        sortOrder = 'desc',
        include = []
      } = query

      // Validar tipo de conteúdo
      if (type && !validateContentType(type)) {
        return {
          success: false,
          error: {
            code: 'INVALID_CONTENT_TYPE',
            message: `Tipo de conteúdo inválido: ${type}`
          }
        }
      }

      // Gerar chave de cache
      const queryHash = hashQuery(query)
      const cacheKey = `find:${type}:${campaign}:${queryHash}`

      return withCache(
        cacheKey,
        async () => {
          const contentType = getContentType(type!)
          if (!contentType) {
            throw new Error(`Content type not found: ${type}`)
          }

          // Obter caminho do diretório
          const dirPath = await getCampaignContentPath(
            this.getContentPath(type!),
            campaign
          )

          // Verificar se diretório existe
          try {
            await fs.access(dirPath)
          } catch {
            return {
              success: true,
              data: [],
              meta: {
                total: 0,
                page: Math.floor(offset / limit) + 1,
                limit,
                hasMore: false,
                timestamp: new Date().toISOString()
              }
            }
          }

          // Ler arquivos
          const files = await fs.readdir(dirPath)
          const mdFiles = files.filter(file => file.endsWith('.md'))

          // Processar arquivos
          const items: T[] = []
          
          for (const filename of mdFiles) {
            const filePath = path.join(dirPath, filename)
            const fileContent = await fs.readFile(filePath, 'utf8')
            const { data: frontmatter, content } = matter(fileContent)

            // Aplicar filtros
            if (status && frontmatter.status !== status) continue
            if (tags && tags.length > 0) {
              const itemTags = Array.isArray(frontmatter.tags) ? frontmatter.tags : []
              if (!tags.some(tag => itemTags.includes(tag))) continue
            }
            if (search) {
              const searchText = `${frontmatter.name || ''} ${frontmatter.description || ''} ${content}`.toLowerCase()
              if (!searchText.includes(search.toLowerCase())) continue
            }

            // Preparar item
            const item = {
              ...frontmatter,
              slug: filename.replace('.md', ''),
              campaignId: campaign,
              ...(include.includes('content') && { content })
            } as T

            items.push(item)
          }

          // Ordenar
          items.sort((a: any, b: any) => {
            let aValue = a[sortBy]
            let bValue = b[sortBy]

            if (sortBy === 'updated' || sortBy === 'created') {
              aValue = new Date(aValue).getTime()
              bValue = new Date(bValue).getTime()
            }

            if (sortOrder === 'desc') {
              return bValue > aValue ? 1 : -1
            } else {
              return aValue > bValue ? 1 : -1
            }
          })

          // Paginar
          const total = items.length
          const paginatedItems = items.slice(offset, offset + limit)

          return {
            success: true,
            data: paginatedItems,
            meta: {
              total,
              page: Math.floor(offset / limit) + 1,
              limit,
              hasMore: offset + limit < total,
              timestamp: new Date().toISOString()
            }
          }
        },
        300000, // 5 minutos
        [`content`, `content:${type}`, campaign].filter(Boolean)
      )

    } catch (error) {
      console.error('Error finding content:', error)
      return {
        success: false,
        error: {
          code: 'FIND_ERROR',
          message: 'Erro ao buscar conteúdo'
        }
      }
    }
  }

  // Obter conteúdo específico
  async getContent<T = any>(
    type: string,
    slug: string,
    campaignId?: string,
    includeContent = true
  ): Promise<ApiResponse<T>> {
    try {
      // Verificar cache primeiro
      const cached = cache.getCachedContent<T>(type, slug, campaignId)
      if (cached) {
        return {
          success: true,
          data: cached,
          meta: {
            timestamp: new Date().toISOString()
          }
        }
      }

      const contentType = getContentType(type)
      if (!contentType) {
        return {
          success: false,
          error: {
            code: 'INVALID_CONTENT_TYPE',
            message: `Tipo de conteúdo inválido: ${type}`
          }
        }
      }

      // Obter caminho do arquivo
      const dirPath = await getCampaignContentPath(
        this.getContentPath(type),
        campaignId
      )
      const filePath = path.join(dirPath, `${slug}.md`)

      // Verificar se arquivo existe
      try {
        await fs.access(filePath)
      } catch {
        return {
          success: false,
          error: {
            code: 'CONTENT_NOT_FOUND',
            message: `Conteúdo não encontrado: ${slug}`
          }
        }
      }

      // Ler e processar arquivo
      const fileContent = await fs.readFile(filePath, 'utf8')
      const { data: frontmatter, content } = matter(fileContent)

      const item = {
        ...frontmatter,
        slug,
        campaignId,
        ...(includeContent && { content })
      } as T

      // Salvar no cache
      cache.cacheContent(type, slug, item, campaignId)

      return {
        success: true,
        data: item,
        meta: {
          timestamp: new Date().toISOString()
        }
      }

    } catch (error) {
      console.error('Error getting content:', error)
      return {
        success: false,
        error: {
          code: 'GET_ERROR',
          message: 'Erro ao obter conteúdo'
        }
      }
    }
  }

  // Criar conteúdo
  async createContent(mutation: ContentMutation): Promise<ApiResponse<any>> {
    try {
      const { type, data, options = {} } = mutation

      const contentType = getContentType(type)
      if (!contentType) {
        return {
          success: false,
          error: {
            code: 'INVALID_CONTENT_TYPE',
            message: `Tipo de conteúdo inválido: ${type}`
          }
        }
      }

      // Validar dados se não pular validação
      if (!options.skipValidation) {
        const validation = validateContent(contentType.schema, data)
        if (!validation.valid) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Dados inválidos',
              details: validation.errors
            }
          }
        }
      }

      // Preparar contexto para hooks
      const hookContext: Omit<HookContext, 'action'> = {
        contentType: type,
        data: { ...data },
        campaignId: data.campaignId || '',
        user: data._user
      }

      // Executar hooks 'before' se não pular
      let processedData = data
      if (!options.skipHooks) {
        processedData = await executeBeforeHooks('create', hookContext)
      }

      // Gerar slug se necessário
      if (!processedData.slug && processedData.name) {
        processedData.slug = this.generateSlug(processedData.name)
      }

      // Adicionar metadados
      const now = new Date().toISOString()
      const contentData = {
        ...processedData,
        created: now,
        updated: now,
        status: processedData.status || 'published',
        version: 1
      }

      // Obter caminho e criar diretório se necessário
      const dirPath = await getCampaignContentPath(
        this.getContentPath(type),
        contentData.campaignId
      )
      
      await fs.mkdir(dirPath, { recursive: true })

      // Verificar se arquivo já existe
      const filePath = path.join(dirPath, `${contentData.slug}.md`)
      try {
        await fs.access(filePath)
        return {
          success: false,
          error: {
            code: 'CONTENT_EXISTS',
            message: `Conteúdo já existe: ${contentData.slug}`
          }
        }
      } catch {
        // Arquivo não existe, pode continuar
      }

      // Criar frontmatter e conteúdo
      const frontmatter = this.createFrontmatter(contentData)
      const fileContent = `${frontmatter}\n\n${contentData.content || ''}`

      // Escrever arquivo
      await fs.writeFile(filePath, fileContent, 'utf8')

      // Invalidar cache
      cache.invalidateContentLists(type, contentData.campaignId)

      // Executar hooks 'after' se não pular
      if (!options.skipHooks) {
        await executeAfterHooks('create', {
          ...hookContext,
          data: contentData
        })
      }

      return {
        success: true,
        data: contentData,
        meta: {
          timestamp: new Date().toISOString()
        }
      }

    } catch (error) {
      console.error('Error creating content:', error)
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Erro ao criar conteúdo'
        }
      }
    }
  }

  // Atualizar conteúdo
  async updateContent(mutation: ContentMutation): Promise<ApiResponse<any>> {
    try {
      const { type, data, options = {} } = mutation

      const contentType = getContentType(type)
      if (!contentType) {
        return {
          success: false,
          error: {
            code: 'INVALID_CONTENT_TYPE',
            message: `Tipo de conteúdo inválido: ${type}`
          }
        }
      }

      // Obter conteúdo anterior
      const existingResponse = await this.getContent(type, data.slug, data.campaignId)
      if (!existingResponse.success) {
        return existingResponse
      }

      const previousData = existingResponse.data

      // Validar dados se não pular validação
      if (!options.skipValidation) {
        const validation = validateContent(contentType.schema, data)
        if (!validation.valid) {
          return {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Dados inválidos',
              details: validation.errors
            }
          }
        }
      }

      // Preparar contexto para hooks
      const hookContext: Omit<HookContext, 'action'> = {
        contentType: type,
        data: { ...data },
        previousData,
        campaignId: data.campaignId || '',
        user: data._user
      }

      // Executar hooks 'before' se não pular
      let processedData = data
      if (!options.skipHooks) {
        processedData = await executeBeforeHooks('update', hookContext)
      }

      // Atualizar metadados
      const contentData = {
        ...previousData,
        ...processedData,
        updated: new Date().toISOString(),
        version: (previousData.version || 1) + 1
      }

      // Obter caminhos
      const dirPath = await getCampaignContentPath(
        this.getContentPath(type),
        contentData.campaignId
      )
      
      const oldFilePath = path.join(dirPath, `${previousData.slug}.md`)
      const newFilePath = path.join(dirPath, `${contentData.slug}.md`)

      // Criar frontmatter e conteúdo
      const frontmatter = this.createFrontmatter(contentData)
      const fileContent = `${frontmatter}\n\n${contentData.content || ''}`

      // Escrever arquivo
      await fs.writeFile(newFilePath, fileContent, 'utf8')

      // Se o slug mudou, deletar arquivo antigo
      if (oldFilePath !== newFilePath) {
        try {
          await fs.unlink(oldFilePath)
        } catch (error) {
          console.warn('Could not delete old file:', error)
        }
      }

      // Invalidar cache
      cache.invalidateContent(type, previousData.slug, contentData.campaignId)
      cache.invalidateContent(type, contentData.slug, contentData.campaignId)
      cache.invalidateContentLists(type, contentData.campaignId)

      // Executar hooks 'after' se não pular
      if (!options.skipHooks) {
        await executeAfterHooks('update', {
          ...hookContext,
          data: contentData
        })
      }

      return {
        success: true,
        data: contentData,
        meta: {
          timestamp: new Date().toISOString()
        }
      }

    } catch (error) {
      console.error('Error updating content:', error)
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Erro ao atualizar conteúdo'
        }
      }
    }
  }

  // Deletar conteúdo
  async deleteContent(
    type: string,
    slug: string,
    campaignId?: string
  ): Promise<ApiResponse<void>> {
    try {
      const contentType = getContentType(type)
      if (!contentType) {
        return {
          success: false,
          error: {
            code: 'INVALID_CONTENT_TYPE',
            message: `Tipo de conteúdo inválido: ${type}`
          }
        }
      }

      // Obter conteúdo antes de deletar
      const existingResponse = await this.getContent(type, slug, campaignId)
      if (!existingResponse.success) {
        return {
          success: false,
          error: existingResponse.error
        }
      }

      const contentData = existingResponse.data

      // Preparar contexto para hooks
      const hookContext: Omit<HookContext, 'action'> = {
        contentType: type,
        data: contentData,
        campaignId: campaignId || '',
      }

      // Executar hooks 'before'
      await executeBeforeHooks('delete', hookContext)

      // Obter caminho do arquivo
      const dirPath = await getCampaignContentPath(
        this.getContentPath(type),
        campaignId
      )
      const filePath = path.join(dirPath, `${slug}.md`)

      // Deletar arquivo
      await fs.unlink(filePath)

      // Invalidar cache
      cache.invalidateContent(type, slug, campaignId)
      cache.invalidateContentLists(type, campaignId)

      // Executar hooks 'after'
      await executeAfterHooks('delete', hookContext)

      return {
        success: true,
        meta: {
          timestamp: new Date().toISOString()
        }
      }

    } catch (error) {
      console.error('Error deleting content:', error)
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Erro ao deletar conteúdo'
        }
      }
    }
  }

  // Métodos utilitários
  private getContentPath(type: string): string {
    switch (type) {
      case 'npc':
        return 'characters/npc'
      case 'monster':
        return 'characters/monster'
      case 'player':
        return 'characters/player'
      case 'item':
        return 'items'
      case 'session':
        return 'sessions'
      case 'note':
        return 'notes'
      default:
        return type
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  private createFrontmatter(data: any): string {
    // Filtrar campos especiais
    const { content, _user, ...frontmatterData } = data

    let frontmatter = '---\n'
    for (const [key, value] of Object.entries(frontmatterData)) {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            frontmatter += `${key}: [${value.map(v => `"${v}"`).join(', ')}]\n`
          }
        } else {
          frontmatter += `${key}: "${value}"\n`
        }
      }
    }
    frontmatter += '---'
    
    return frontmatter
  }
}

// Instância singleton
export const contentManager = ContentManager.getInstance()
