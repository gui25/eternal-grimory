import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Trunca um texto para garantir que ele caiba em uma única linha,
 * substituindo as últimas 3 letras por "..." quando necessário.
 * @param text O texto a ser truncado
 * @param maxLength O comprimento máximo do texto (incluindo os "...")
 * @returns O texto truncado
 */
export function truncateWithEllipsis(text: string, maxLength = 20): string {
  if (!text || text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength - 3) + "..."
}

