"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, X, Image as ImageIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ImageUploadProps {
  value?: string
  onChange?: (value: string) => void
  type: 'session' | 'item' | 'monster' | 'npc' | 'player'
  slug: string
  className?: string
  label?: string
  disabled?: boolean
  onTempImageReady?: (moveToSaved: () => Promise<void>) => void
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  type,
  slug,
  className,
  label = "Imagem",
  disabled = false,
  onTempImageReady
}) => {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const onChangeRef = useRef(onChange)
  const hasNotifiedRef = useRef<string | null>(null)
  
  // Update ref when onChange changes
  useEffect(() => {
    onChangeRef.current = onChange
  })
  
  // Simplified - just notify parent once when temp image is ready
  useEffect(() => {
    if (value && value.startsWith('/temp-images/') && onTempImageReady && hasNotifiedRef.current !== value) {
      hasNotifiedRef.current = value
      
      const moveToSaved = async () => {
        try {
          const response = await fetch('/api/move-temp-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tempUrl: value }),
          })

          const result = await response.json()

          if (result.success) {
            onChangeRef.current?.(result.imageUrl)
            console.log('Imagem movida para pasta definitiva:', result.imageUrl)
          } else {
            console.error('Erro ao mover imagem:', result.error)
          }
        } catch (error) {
          console.error('Erro ao mover imagem:', error)
        }
      }
      
      onTempImageReady(moveToSaved)
    }
  }, [value]) // Removido onTempImageReady das dependências para evitar chamadas duplas

  const handleUpload = useCallback(async (file: File) => {
    if (!file) return

    // Validar arquivo no cliente também
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.log('ImageUpload - Invalid file type:', file.type);
      toast.error('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.log('ImageUpload - File too large:', file.size);
      toast.error('Arquivo muito grande. Máximo 5MB')
      return
    }

    console.log('ImageUpload - Starting upload process...');
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('slug', slug)
      formData.append('temporary', 'true') // Upload temporário para preview

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        onChange?.(result.imageUrl)
        toast.success('Imagem carregada! Clique em Salvar para confirmar.')
      } else {
        toast.error(result.error || 'Erro ao enviar imagem')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }, [type, slug, onChange])

  const handleRemoveImage = useCallback(async () => {
    if (!value) return

    // Se é uma imagem temporária ou URL externa, apenas limpa o valor
    if (!value.startsWith('/saved-images/')) {
      onChange?.('')
      toast.success('Imagem removida')
      return
    }

    try {
      const response = await fetch(`/api/delete-image?filename=${encodeURIComponent(value)}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        onChange?.('')
        toast.success('Imagem removida com sucesso!')
      } else {
        toast.error(result.error || 'Erro ao remover imagem')
      }
    } catch (error) {
      console.error('Erro ao remover imagem:', error)
      toast.error('Erro ao remover imagem')
    }
  }, [value, onChange])

  const handleFileSelect = useCallback((file: File) => {
    handleUpload(file)
  }, [handleUpload])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
      // Reset o input para permitir re-upload do mesmo arquivo
      e.target.value = ''
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleFileSelect(imageFile)
    } else {
      toast.error('Por favor, envie apenas arquivos de imagem')
    }
  }, [handleFileSelect])

  const handleUrlChange = (url: string) => {
    onChange?.(url)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label>{label}</Label>}
      
      {/* Preview da imagem atual */}
      {value && (
        <div className="relative group">
          <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.jpg'
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload área */}
      <div
        className={cn(
          "border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center transition-colors",
          dragOver && "border-primary bg-primary/5",
          disabled && "opacity-50 pointer-events-none"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="mx-auto w-12 h-12 text-muted-foreground mb-4">
          {uploading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          ) : (
            <Upload className="w-12 h-12 mx-auto" />
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {uploading ? 'Enviando...' : 'Arraste uma imagem aqui ou clique para selecionar'}
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG ou WebP até 5MB
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || disabled}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Selecionar arquivo
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading || disabled}
        />
      </div>

      {/* Campo de URL alternativo */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">
          Ou insira uma URL de imagem:
        </Label>
        <Input
          type={value?.startsWith('/') ? "text" : "url"}
          value={value || ''}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
          disabled={disabled}
        />
      </div>
    </div>
  )
} 