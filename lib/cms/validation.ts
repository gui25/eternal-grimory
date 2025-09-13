/**
 * Sistema de validação baseado em schemas
 */
import { ContentSchema, ValidationResult, ValidationError, ValidationRule } from './types'

export class ContentValidator {
  constructor(private schema: ContentSchema) {}

  validate(data: any): ValidationResult {
    const errors: ValidationError[] = []

    // Validar cada campo do schema
    for (const field of this.schema.fields) {
      const value = data[field.id]
      const fieldErrors = this.validateField(field.id, value, field.validation || [])
      errors.push(...fieldErrors)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  private validateField(fieldId: string, value: any, rules: ValidationRule[]): ValidationError[] {
    const errors: ValidationError[] = []

    for (const rule of rules) {
      const error = this.validateRule(fieldId, value, rule)
      if (error) {
        errors.push(error)
      }
    }

    return errors
  }

  private validateRule(fieldId: string, value: any, rule: ValidationRule): ValidationError | null {
    switch (rule.type) {
      case 'required':
        if (this.isEmpty(value)) {
          return {
            field: fieldId,
            message: rule.message || `${fieldId} é obrigatório`,
            code: 'REQUIRED',
            value
          }
        }
        break

      case 'min':
        if (!this.isEmpty(value)) {
          if (typeof value === 'string' && value.length < rule.value) {
            return {
              field: fieldId,
              message: rule.message || `${fieldId} deve ter pelo menos ${rule.value} caracteres`,
              code: 'MIN_LENGTH',
              value
            }
          }
          if (typeof value === 'number' && value < rule.value) {
            return {
              field: fieldId,
              message: rule.message || `${fieldId} deve ser maior que ${rule.value}`,
              code: 'MIN_VALUE',
              value
            }
          }
          if (Array.isArray(value) && value.length < rule.value) {
            return {
              field: fieldId,
              message: rule.message || `${fieldId} deve ter pelo menos ${rule.value} itens`,
              code: 'MIN_ITEMS',
              value
            }
          }
        }
        break

      case 'max':
        if (!this.isEmpty(value)) {
          if (typeof value === 'string' && value.length > rule.value) {
            return {
              field: fieldId,
              message: rule.message || `${fieldId} deve ter no máximo ${rule.value} caracteres`,
              code: 'MAX_LENGTH',
              value
            }
          }
          if (typeof value === 'number' && value > rule.value) {
            return {
              field: fieldId,
              message: rule.message || `${fieldId} deve ser menor que ${rule.value}`,
              code: 'MAX_VALUE',
              value
            }
          }
          if (Array.isArray(value) && value.length > rule.value) {
            return {
              field: fieldId,
              message: rule.message || `${fieldId} deve ter no máximo ${rule.value} itens`,
              code: 'MAX_ITEMS',
              value
            }
          }
        }
        break

      case 'pattern':
        if (!this.isEmpty(value) && typeof value === 'string') {
          const regex = new RegExp(rule.value)
          if (!regex.test(value)) {
            return {
              field: fieldId,
              message: rule.message || `${fieldId} tem formato inválido`,
              code: 'INVALID_FORMAT',
              value
            }
          }
        }
        break

      case 'custom':
        if (rule.validator) {
          const result = rule.validator(value)
          if (result !== true) {
            return {
              field: fieldId,
              message: typeof result === 'string' ? result : (rule.message || `${fieldId} é inválido`),
              code: 'CUSTOM_VALIDATION',
              value
            }
          }
        }
        break
    }

    return null
  }

  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  }
}

// Validadores comuns
export const CommonValidators = {
  slug: (value: string): boolean | string => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(value)) {
      return 'Slug deve conter apenas letras minúsculas, números e hífens'
    }
    return true
  },

  email: (value: string): boolean | string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'E-mail inválido'
    }
    return true
  },

  url: (value: string): boolean | string => {
    try {
      new URL(value)
      return true
    } catch {
      return 'URL inválida'
    }
  },

  date: (value: string): boolean | string => {
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return 'Data inválida'
    }
    return true
  },

  positiveNumber: (value: number): boolean | string => {
    if (typeof value !== 'number' || value <= 0) {
      return 'Deve ser um número positivo'
    }
    return true
  },

  minWords: (min: number) => (value: string): boolean | string => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0)
    if (words.length < min) {
      return `Deve ter pelo menos ${min} palavras`
    }
    return true
  },

  uniqueSlug: (contentType: string, excludeSlug?: string) => async (value: string): Promise<boolean | string> => {
    // Esta função seria implementada para verificar unicidade no banco/arquivo
    // Por enquanto retorna true como placeholder
    return true
  }
}

// Função utilitária para criar validador baseado no schema
export function createValidator(schema: ContentSchema): ContentValidator {
  return new ContentValidator(schema)
}

// Função para validar dados rapidamente
export function validateContent(schema: ContentSchema, data: any): ValidationResult {
  const validator = new ContentValidator(schema)
  return validator.validate(data)
}

// Validação de slug único
export async function validateUniqueSlug(
  contentType: string, 
  slug: string, 
  campaignId?: string,
  excludeSlug?: string
): Promise<boolean> {
  // Esta função deve ser usada apenas no servidor
  // Para o lado cliente, sempre retorna true
  if (typeof window !== 'undefined') {
    return true
  }
  
  // Verificar se é o mesmo slug (para edição)
  if (excludeSlug && excludeSlug === slug) {
    return true
  }
  
  // TODO: Implementar verificação real via API no futuro
  // Por enquanto sempre retorna true para evitar problemas de build
  return true
}
