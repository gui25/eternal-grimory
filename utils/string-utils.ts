/**
 * Trunca um texto para um número máximo de caracteres, adicionando "..." no final
 * @param text - O texto a ser truncado
 * @param maxLength - Número máximo de caracteres (padrão: 32)
 * @returns O texto truncado com "..." se necessário
 */
export function truncateText(text: string, maxLength: number = 31): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Trunca um texto para um número máximo de palavras
 * @param text - O texto a ser truncado
 * @param maxWords - Número máximo de palavras
 * @returns O texto truncado com "..." se necessário
 */
export function truncateWords(text: string, maxWords: number): string {
  if (!text) return text;
  
  const words = text.split(' ');
  if (words.length <= maxWords) {
    return text;
  }
  
  return words.slice(0, maxWords).join(' ') + "...";
}

/**
 * Capitaliza a primeira letra de uma string
 * @param text - O texto a ser capitalizado
 * @returns O texto com a primeira letra maiúscula
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Converte texto para slug (URL-friendly)
 * @param text - O texto a ser convertido
 * @returns O texto convertido para slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
} 