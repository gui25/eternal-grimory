/**
 * Inicialização do CMS
 */
import { registerBuiltinHooks } from './hooks'
import { cache } from './cache'

// Flag para verificar se o CMS foi inicializado
let isInitialized = false

/**
 * Inicializa o sistema CMS
 */
export function initializeCMS() {
  if (isInitialized) {
    return
  }

  console.log('[CMS] Inicializando sistema...')

  try {
    // Registrar hooks padrão
    registerBuiltinHooks()
    console.log('[CMS] Hooks padrão registrados')

    // Verificar status do cache
    const cacheStats = cache.getStats()
    console.log(`[CMS] Cache ${cacheStats.enabled ? 'ativado' : 'desativado'} - ${cacheStats.size} itens`)

    isInitialized = true
    console.log('[CMS] Sistema inicializado com sucesso')

  } catch (error) {
    console.error('[CMS] Erro na inicialização:', error)
  }
}

/**
 * Verifica se o CMS foi inicializado
 */
export function isCMSInitialized(): boolean {
  return isInitialized
}

/**
 * Força a reinicialização do CMS
 */
export function reinitializeCMS() {
  isInitialized = false
  initializeCMS()
}

// Auto-inicializar quando em ambiente de desenvolvimento
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  initializeCMS()
}
