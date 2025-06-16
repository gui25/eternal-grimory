/**
 * Utilitários para funcionalidades de desenvolvimento
 */

/**
 * Verifica se estamos em ambiente de desenvolvimento
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Verifica se estamos rodando localmente (localhost)
 */
export function isLocalhost(): boolean {
  if (typeof window === 'undefined') {
    // No servidor, verificar se estamos em desenvolvimento
    return isDevelopment()
  }
  
  // No cliente, verificar se é localhost
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname === '0.0.0.0'
}

/**
 * Verifica se as funcionalidades de admin devem estar disponíveis
 */
export function isAdminMode(): boolean {
  return isDevelopment() && isLocalhost()
} 