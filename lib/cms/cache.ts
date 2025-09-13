/**
 * Sistema de cache para o CMS
 */
import { CacheConfig, CacheEntry } from './types'

interface MemoryCacheStore {
  [key: string]: CacheEntry
}

class CacheManager {
  private static instance: CacheManager
  private config: CacheConfig
  private store: MemoryCacheStore = {}
  private timers: Map<string, NodeJS.Timeout> = new Map()

  constructor(config: CacheConfig = {
    enabled: true,
    ttl: 300000, // 5 minutes
    prefix: 'cms',
    strategy: 'memory'
  }) {
    this.config = config
  }

  static getInstance(config?: CacheConfig): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(config)
    }
    return CacheManager.instance
  }

  private makeKey(key: string): string {
    return `${this.config.prefix}:${key}`
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.timestamp + entry.ttl
  }

  private scheduleCleanup(key: string, ttl: number): void {
    // Limpar timer anterior se existir
    const existingTimer = this.timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Agendar limpeza
    const timer = setTimeout(() => {
      this.delete(key)
      this.timers.delete(key)
    }, ttl)

    this.timers.set(key, timer)
  }

  set<T>(key: string, data: T, ttl?: number, tags?: string[]): void {
    if (!this.config.enabled) return

    const cacheKey = this.makeKey(key)
    const cacheTtl = ttl || this.config.ttl
    
    const entry: CacheEntry<T> = {
      key: cacheKey,
      data,
      timestamp: Date.now(),
      ttl: cacheTtl,
      tags
    }

    this.store[cacheKey] = entry
    this.scheduleCleanup(cacheKey, cacheTtl)
  }

  get<T>(key: string): T | null {
    if (!this.config.enabled) return null

    const cacheKey = this.makeKey(key)
    const entry = this.store[cacheKey]

    if (!entry) {
      return null
    }

    if (this.isExpired(entry)) {
      this.delete(key)
      return null
    }

    return entry.data as T
  }

  delete(key: string): boolean {
    if (!this.config.enabled) return false

    const cacheKey = this.makeKey(key)
    const existed = cacheKey in this.store

    delete this.store[cacheKey]
    
    // Limpar timer se existir
    const timer = this.timers.get(cacheKey)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(cacheKey)
    }

    return existed
  }

  invalidateByTag(tag: string): number {
    if (!this.config.enabled) return 0

    let count = 0
    const keysToDelete: string[] = []

    for (const [key, entry] of Object.entries(this.store)) {
      if (entry.tags && entry.tags.includes(tag)) {
        keysToDelete.push(key.replace(`${this.config.prefix}:`, ''))
        count++
      }
    }

    keysToDelete.forEach(key => this.delete(key))
    
    return count
  }

  invalidateByPattern(pattern: string): number {
    if (!this.config.enabled) return 0

    let count = 0
    const keysToDelete: string[] = []
    const regex = new RegExp(pattern)

    for (const key of Object.keys(this.store)) {
      if (regex.test(key)) {
        keysToDelete.push(key.replace(`${this.config.prefix}:`, ''))
        count++
      }
    }

    keysToDelete.forEach(key => this.delete(key))
    
    return count
  }

  clear(): void {
    if (!this.config.enabled) return

    // Limpar todos os timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }
    this.timers.clear()

    // Limpar store
    this.store = {}
  }

  size(): number {
    return Object.keys(this.store).length
  }

  getStats(): {
    size: number
    enabled: boolean
    config: CacheConfig
    activeTimers: number
  } {
    return {
      size: this.size(),
      enabled: this.config.enabled,
      config: this.config,
      activeTimers: this.timers.size
    }
  }

  // Métodos específicos para o CMS
  cacheContent(contentType: string, slug: string, data: any, campaignId?: string): void {
    const key = campaignId 
      ? `content:${campaignId}:${contentType}:${slug}`
      : `content:${contentType}:${slug}`
    
    this.set(key, data, this.config.ttl, [`content`, `content:${contentType}`, campaignId].filter(Boolean) as string[])
  }

  getCachedContent<T>(contentType: string, slug: string, campaignId?: string): T | null {
    const key = campaignId 
      ? `content:${campaignId}:${contentType}:${slug}`
      : `content:${contentType}:${slug}`
    
    return this.get<T>(key)
  }

  invalidateContent(contentType: string, slug?: string, campaignId?: string): void {
    if (slug) {
      // Invalidar item específico
      const key = campaignId 
        ? `content:${campaignId}:${contentType}:${slug}`
        : `content:${contentType}:${slug}`
      this.delete(key)
    } else {
      // Invalidar todo o tipo de conteúdo
      const pattern = campaignId 
        ? `content:${campaignId}:${contentType}:`
        : `content:${contentType}:`
      this.invalidateByPattern(pattern)
    }
  }

  cacheContentList(contentType: string, data: any[], campaignId?: string, queryHash?: string): void {
    const key = campaignId 
      ? `list:${campaignId}:${contentType}${queryHash ? `:${queryHash}` : ''}`
      : `list:${contentType}${queryHash ? `:${queryHash}` : ''}`
    
    this.set(key, data, this.config.ttl / 2, [`list`, `list:${contentType}`, campaignId].filter(Boolean) as string[]) // TTL menor para listas
  }

  getCachedContentList<T>(contentType: string, campaignId?: string, queryHash?: string): T[] | null {
    const key = campaignId 
      ? `list:${campaignId}:${contentType}${queryHash ? `:${queryHash}` : ''}`
      : `list:${contentType}${queryHash ? `:${queryHash}` : ''}`
    
    return this.get<T[]>(key)
  }

  invalidateContentLists(contentType?: string, campaignId?: string): void {
    if (contentType) {
      this.invalidateByTag(`list:${contentType}`)
    } else {
      this.invalidateByTag('list')
    }
  }
}

// Instância singleton
export const cache = CacheManager.getInstance()

// Funções utilitárias
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number,
  tags?: string[]
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    // Tentar obter do cache
    const cached = cache.get<T>(key)
    if (cached) {
      resolve(cached)
      return
    }

    try {
      // Buscar dados
      const data = await fetcher()
      
      // Salvar no cache
      cache.set(key, data, ttl, tags)
      
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

export function hashQuery(query: any): string {
  return Buffer.from(JSON.stringify(query)).toString('base64').substring(0, 8)
}
