'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteButtonProps {
  type: 'player' | 'npc' | 'monster' | 'item' | 'session' | 'note'
  slug: string
  name: string
  campaignId: string
  redirectPath?: string
  className?: string
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function DeleteButton({
  type,
  slug,
  name,
  campaignId,
  redirectPath,
  className,
  size = 'default'
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/admin/delete?type=${type}&slug=${slug}&campaignId=${campaignId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao deletar')
      }

      const data = await response.json()
      toast.success(data.message || `${type} deletado com sucesso`)
      
      // Redirecionar após delete bem-sucedido
      if (redirectPath) {
        router.push(redirectPath)
      } else {
        // Redirecionar para a lista baseada no tipo
        const typeToPath: Record<string, string> = {
          'player': '/characters/players',
          'npc': '/characters/npcs',
          'monster': '/characters/monsters',
          'item': '/items',
          'session': '/sessions',
          'note': '/notes'
        }
        router.push(typeToPath[type])
      }
    } catch (error) {
      console.error('Erro ao deletar:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao deletar')
    } finally {
      setIsDeleting(false)
    }
  }

  const typeLabels: Record<string, string> = {
    'player': 'jogador',
    'npc': 'NPC',
    'monster': 'monstro',
    'item': 'item',
    'session': 'sessão',
    'note': 'anotação'
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size={size}
          className={className}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Deletar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja deletar o {typeLabels[type]} <strong>"{name}"</strong>?
            <br />
            <span className="text-red-600 font-medium">
              Esta ação não pode ser desfeita.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deletando...
              </>
            ) : (
              'Deletar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 