/**
 * Exportações principais do CMS
 */

// Tipos
export * from './types'

// Configuração
export * from './config'

// Gerenciamento de conteúdo
export { contentManager } from './content-manager'

// Cache
export { cache, withCache, hashQuery } from './cache'

// Validação
export { validateContent, createValidator, CommonValidators } from './validation'

// Hooks
export { hookManager, executeBeforeHooks, executeAfterHooks, BuiltinHooks } from './hooks'

// Inicialização
export { initializeCMS, isCMSInitialized, reinitializeCMS } from './init'

// Re-export de hooks React
export { useCMSContent, useCMSItem, useCMSMutation } from '../../hooks/use-cms-content'

// Re-export de componentes
export { DynamicForm } from '../../components/cms/dynamic-form'
