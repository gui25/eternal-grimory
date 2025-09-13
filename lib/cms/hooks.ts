/**
 * Sistema de hooks para o CMS
 */
import { ContentHook, HookContext, HookHandler } from './types'

export class HookManager {
  private static instance: HookManager
  private hooks: Map<string, ContentHook[]> = new Map()

  static getInstance(): HookManager {
    if (!HookManager.instance) {
      HookManager.instance = new HookManager()
    }
    return HookManager.instance
  }

  // Registrar um hook
  register(hook: ContentHook): void {
    const key = this.getHookKey(hook.type, hook.action)
    
    if (!this.hooks.has(key)) {
      this.hooks.set(key, [])
    }
    
    this.hooks.get(key)!.push(hook)
  }

  // Remover um hook
  unregister(hookName: string): boolean {
    for (const [key, hooks] of this.hooks.entries()) {
      const index = hooks.findIndex(h => h.name === hookName)
      if (index !== -1) {
        hooks.splice(index, 1)
        if (hooks.length === 0) {
          this.hooks.delete(key)
        }
        return true
      }
    }
    return false
  }

  // Executar hooks
  async execute(
    type: 'before' | 'after',
    action: 'create' | 'update' | 'delete' | 'publish',
    context: Omit<HookContext, 'action'>
  ): Promise<any> {
    const key = this.getHookKey(type, action)
    const hooks = this.hooks.get(key) || []
    
    const fullContext: HookContext = {
      ...context,
      action
    }

    let result = context.data

    for (const hook of hooks) {
      try {
        const hookResult = await hook.handler(fullContext)
        
        // Se o hook retornar dados, usar como novo resultado
        if (hookResult !== undefined) {
          result = hookResult
          fullContext.data = result
        }
      } catch (error) {
        console.error(`Error in hook ${hook.name}:`, error)
        
        // Para hooks 'before', propagamos o erro
        if (type === 'before') {
          throw new Error(`Hook ${hook.name} failed: ${error}`)
        }
        
        // Para hooks 'after', apenas logamos o erro
      }
    }

    return result
  }

  private getHookKey(type: 'before' | 'after', action: string): string {
    return `${type}:${action}`
  }

  // Obter todos os hooks registrados
  getRegisteredHooks(): { key: string; hooks: ContentHook[] }[] {
    return Array.from(this.hooks.entries()).map(([key, hooks]) => ({
      key,
      hooks: [...hooks]
    }))
  }

  // Limpar todos os hooks
  clear(): void {
    this.hooks.clear()
  }
}

// Instância singleton
export const hookManager = HookManager.getInstance()

// Hooks predefinidos úteis
export const BuiltinHooks = {
  // Hook para gerar slug automaticamente
  autoSlug: {
    name: 'auto-slug',
    type: 'before' as const,
    action: 'create' as const,
    handler: async (context: HookContext) => {
      if (!context.data.slug && context.data.name) {
        context.data.slug = generateSlug(context.data.name)
      }
      return context.data
    }
  },

  // Hook para atualizar timestamp
  updateTimestamp: {
    name: 'update-timestamp',
    type: 'before' as const,
    action: 'update' as const,
    handler: async (context: HookContext) => {
      context.data.updated = new Date().toISOString()
      return context.data
    }
  },

  // Hook para validar campos obrigatórios
  validateRequired: {
    name: 'validate-required',
    type: 'before' as const,
    action: 'create' as const,
    handler: async (context: HookContext) => {
      const requiredFields = ['name', 'content']
      
      for (const field of requiredFields) {
        if (!context.data[field]) {
          throw new Error(`Campo obrigatório ausente: ${field}`)
        }
      }
      
      return context.data
    }
  },

  // Hook para limpar cache após mudanças
  clearCache: {
    name: 'clear-cache',
    type: 'after' as const,
    action: 'update' as const,
    handler: async (context: HookContext) => {
      const { cache } = await import('./cache')
      
      // Invalidar cache do item específico
      cache.invalidateContent(context.contentType, context.data.slug, context.campaignId)
      
      // Invalidar listas do tipo de conteúdo
      cache.invalidateContentLists(context.contentType, context.campaignId)
      
      return context.data
    }
  },

  // Hook para log de auditoria
  auditLog: {
    name: 'audit-log',
    type: 'after' as const,
    action: 'update' as const,
    handler: async (context: HookContext) => {
      console.log(`[AUDIT] ${context.action} ${context.contentType}:${context.data.slug} by ${context.user?.name || 'system'}`)
      
      // Aqui você poderia salvar em um arquivo de log ou banco de dados
      
      return context.data
    }
  },

  // Hook para backup automático
  backup: {
    name: 'backup',
    type: 'before' as const,
    action: 'update' as const,
    handler: async (context: HookContext) => {
      if (context.previousData) {
        // Criar backup do conteúdo anterior
        const backupData = {
          ...context.previousData,
          backedUpAt: new Date().toISOString(),
          originalSlug: context.data.slug
        }
        
        // Aqui você salvaria o backup
        console.log(`[BACKUP] Created backup for ${context.contentType}:${context.data.slug}`)
      }
      
      return context.data
    }
  }
}

// Função utilitária para gerar slug
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

// Registrar hooks padrão
export function registerBuiltinHooks(): void {
  Object.values(BuiltinHooks).forEach(hook => {
    hookManager.register(hook)
  })
}

// Funções utilitárias para executar hooks
export async function executeBeforeHooks(
  action: 'create' | 'update' | 'delete' | 'publish',
  context: Omit<HookContext, 'action'>
): Promise<any> {
  return hookManager.execute('before', action, context)
}

export async function executeAfterHooks(
  action: 'create' | 'update' | 'delete' | 'publish',
  context: Omit<HookContext, 'action'>
): Promise<any> {
  return hookManager.execute('after', action, context)
}

// Decorador para funções que precisam de hooks
export function withHooks(action: 'create' | 'update' | 'delete' | 'publish') {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const context = args[0] as HookContext

      try {
        // Executar hooks 'before'
        const processedData = await executeBeforeHooks(action, context)
        
        // Atualizar contexto com dados processados
        if (processedData !== undefined) {
          context.data = processedData
          args[0] = context
        }

        // Executar método original
        const result = await method.apply(this, args)

        // Executar hooks 'after'
        await executeAfterHooks(action, {
          ...context,
          data: result || context.data
        })

        return result
      } catch (error) {
        console.error(`Error in ${action} operation:`, error)
        throw error
      }
    }

    return descriptor
  }
}
