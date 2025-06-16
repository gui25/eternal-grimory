import { useState, useCallback } from 'react'
import { useDebounce } from './use-debounce'
import { toast } from 'sonner'

interface UseNameValidationProps {
  type: string
  excludeSlug?: string
  onValidation?: (isValid: boolean, message: string) => void
}

export function useNameValidation({ type, excludeSlug, onValidation }: UseNameValidationProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const [isValid, setIsValid] = useState(true)

  const validateName = useCallback(async (name: string) => {
    if (!name.trim()) {
      setValidationMessage('')
      setIsValid(true)
      onValidation?.(true, '')
      return
    }

    setIsValidating(true)
    
    try {
      const response = await fetch('/api/admin/validate-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          name: name.trim(),
          excludeSlug
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        const isNameValid = !result.exists
        setIsValid(isNameValid)
        setValidationMessage(result.message)
        onValidation?.(isNameValid, result.message)
        
        // Mostrar popup explicativo quando há erro
        if (result.exists) {
          toast.error(`Nome "${name}" já está em uso`, {
            description: result.message + '. Escolha um nome diferente para continuar.',
            duration: 5000,
          })
        }
      } else {
        setIsValid(true)
        setValidationMessage('')
        onValidation?.(true, '')
      }
    } catch (error) {
      console.error('Error validating name:', error)
      setIsValid(true)
      setValidationMessage('')
      onValidation?.(true, '')
    } finally {
      setIsValidating(false)
    }
  }, [type, excludeSlug, onValidation])

  const debouncedValidate = useDebounce(validateName, 500)

  return {
    validateName: debouncedValidate,
    isValidating,
    validationMessage,
    isValid
  }
} 