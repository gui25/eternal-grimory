/**
 * Formulário dinâmico baseado em schema do CMS
 */
'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { ContentSchema, ContentField, ValidationResult } from '@/lib/cms/types'
import { validateContent } from '@/lib/cms/validation'
import { getContentType } from '@/lib/cms/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/ui/image-upload'
import { AlertCircle, Save, Eye, X } from 'lucide-react'
import { toast } from 'sonner'

interface DynamicFormProps {
  contentType: string
  initialData?: any
  onSubmit: (data: any) => Promise<boolean>
  onCancel?: () => void
  submitText?: string
  showPreview?: boolean
  disabled?: boolean
}

interface FieldProps {
  field: ContentField
  value: any
  onChange: (value: any) => void
  error?: string
  disabled?: boolean
}

// Componente para renderizar cada tipo de campo
function FieldRenderer({ field, value, onChange, error, disabled }: FieldProps) {
  const commonProps = {
    id: field.id,
    disabled,
    className: error ? 'border-red-500' : ''
  }

  switch (field.type) {
    case 'text':
      return (
        <Input
          {...commonProps}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.options?.placeholder}
        />
      )

    case 'textarea':
      return (
        <Textarea
          {...commonProps}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.options?.placeholder}
          rows={4}
        />
      )

    case 'markdown':
      return (
        <Textarea
          {...commonProps}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.options?.placeholder}
          rows={10}
          className={`font-mono text-sm ${error ? 'border-red-500' : ''}`}
        />
      )

    case 'number':
      return (
        <Input
          {...commonProps}
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          placeholder={field.options?.placeholder}
          min={field.options?.min}
          max={field.options?.max}
          step={field.options?.step}
        />
      )

    case 'select':
      return (
        <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className={error ? 'border-red-500' : ''}>
            <SelectValue placeholder={`Selecione ${field.name.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case 'multiselect':
      const selectedValues = Array.isArray(value) ? value : []
      const availableOptions = field.options?.options || []

      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1 min-h-[2rem] p-2 border rounded-md">
            {selectedValues.length > 0 ? (
              selectedValues.map((val, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {val}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => {
                        const newValues = selectedValues.filter((_, i) => i !== index)
                        onChange(newValues)
                      }}
                      className="ml-1 hover:bg-red-500 hover:text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">
                Nenhum item selecionado
              </span>
            )}
          </div>
          {!disabled && availableOptions.length > 0 && (
            <Select
              onValueChange={(newValue) => {
                if (newValue && !selectedValues.includes(newValue)) {
                  onChange([...selectedValues, newValue])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Adicionar item..." />
              </SelectTrigger>
              <SelectContent>
                {availableOptions
                  .filter(option => !selectedValues.includes(option.value))
                  .map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )

    case 'date':
      return (
        <Input
          {...commonProps}
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.id}
            checked={value || false}
            onCheckedChange={onChange}
            disabled={disabled}
          />
          <Label htmlFor={field.id} className="text-sm">
            {field.name}
          </Label>
        </div>
      )

    case 'image':
      return (
        <ImageUpload
          value={value || ''}
          onChange={onChange}
          type={field.id}
          slug="novo-item"
          label={`Imagem ${field.name}`}
          disabled={disabled}
        />
      )

    default:
      return (
        <Input
          {...commonProps}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.options?.placeholder}
        />
      )
  }
}

export function DynamicForm({
  contentType,
  initialData = {},
  onSubmit,
  onCancel,
  submitText = 'Salvar',
  showPreview = false,
  disabled = false
}: DynamicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationResult | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  // Obter schema do tipo de conteúdo
  const contentTypeConfig = getContentType(contentType)
  if (!contentTypeConfig) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Tipo de conteúdo inválido: {contentType}
        </AlertDescription>
      </Alert>
    )
  }

  const schema = contentTypeConfig.schema

  // Configurar formulário
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      ...schema.fields.reduce((acc, field) => {
        acc[field.id] = field.default || (field.type === 'multiselect' ? [] : '')
        return acc
      }, {} as any),
      ...initialData
    }
  })

  const watchedValues = watch()

  // Validar formulário em tempo real
  useEffect(() => {
    if (showValidation) {
      const validation = validateContent(schema, watchedValues)
      setValidationErrors(validation)
    }
  }, [watchedValues, schema, showValidation])

  // Gerar slug automaticamente se for um campo nome
  useEffect(() => {
    if (watchedValues.name && !initialData.slug) {
      const slug = generateSlug(watchedValues.name)
      setValue('slug', slug)
    }
  }, [watchedValues.name, setValue, initialData.slug])

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true)
    setShowValidation(true)

    try {
      // Validar dados
      const validation = validateContent(schema, data)
      setValidationErrors(validation)

      if (!validation.valid) {
        toast.error('Existem erros no formulário. Corrija-os antes de continuar.')
        return
      }

      // Submeter dados
      const success = await onSubmit(data)
      
      if (success) {
        toast.success(`${contentTypeConfig.name} salvo com sucesso!`)
        setShowValidation(false)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Erro ao salvar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold">
          {initialData.slug ? 'Editar' : 'Criar'} {contentTypeConfig.name}
        </h2>
        <p className="text-muted-foreground">
          {schema.description}
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados Básicos</CardTitle>
            <CardDescription>
              Preencha as informações principais do {contentTypeConfig.name.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {schema.fields.map((field) => {
              const fieldError = validationErrors?.errors.find(e => e.field === field.id)
              
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="flex items-center gap-2">
                    {field.name}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  
                  <Controller
                    name={field.id}
                    control={control}
                    rules={{ required: field.required }}
                    render={({ field: { value, onChange } }) => (
                      <FieldRenderer
                        field={field}
                        value={value}
                        onChange={onChange}
                        error={fieldError?.message}
                        disabled={disabled}
                      />
                    )}
                  />
                  
                  {fieldError && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldError.message}
                    </p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Erros de validação */}
        {validationErrors && !validationErrors.valid && showValidation && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div>Corrija os seguintes erros:</div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.errors.map((error, index) => (
                    <li key={index} className="text-sm">
                      {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Botões */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || disabled}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Salvando...' : submitText}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}

          {showPreview && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowValidation(!showValidation)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showValidation ? 'Ocultar' : 'Mostrar'} Validação
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
