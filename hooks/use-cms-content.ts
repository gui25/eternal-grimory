/**
 * Hook para gerenciamento de conteúdo do CMS
 */
import { useState, useEffect, useCallback } from 'react'
import { ApiResponse, ContentQuery } from '@/lib/cms/types'

interface UseCMSContentOptions {
  enabled?: boolean
  refetchOnMount?: boolean
  refetchInterval?: number
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

interface UseCMSContentResult<T> {
  data: T[] | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  meta: {
    total: number
    page: number
    hasMore: boolean
  } | null
}

export function useCMSContent<T = any>(
  query: ContentQuery,
  options: UseCMSContentOptions = {}
): UseCMSContentResult<T> {
  const {
    enabled = true,
    refetchOnMount = true,
    refetchInterval,
    onSuccess,
    onError
  } = options

  const [data, setData] = useState<T[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<{
    total: number
    page: number
    hasMore: boolean
  } | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled || !query.type) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      if (query.campaign) params.set('campaign', query.campaign)
      if (query.status) params.set('status', query.status)
      if (query.tags?.length) params.set('tags', query.tags.join(','))
      if (query.search) params.set('search', query.search)
      if (query.limit) params.set('limit', query.limit.toString())
      if (query.offset) params.set('offset', query.offset.toString())
      if (query.sortBy) params.set('sortBy', query.sortBy)
      if (query.sortOrder) params.set('sortOrder', query.sortOrder)
      if (query.include?.length) params.set('include', query.include.join(','))

      const response = await fetch(`/api/v2/content/${query.type}?${params.toString()}`)
      const result: ApiResponse<T[]> = await response.json()

      if (result.success && result.data) {
        setData(result.data)
        setMeta({
          total: result.meta?.total || 0,
          page: result.meta?.page || 1,
          hasMore: result.meta?.hasMore || false
        })
        onSuccess?.(result.data)
      } else {
        const errorMessage = result.error?.message || 'Erro ao carregar conteúdo'
        setError(errorMessage)
        onError?.(result.error)
      }
    } catch (err) {
      const errorMessage = 'Erro de conexão'
      setError(errorMessage)
      onError?.(err)
    } finally {
      setIsLoading(false)
    }
  }, [query, enabled, onSuccess, onError])

  useEffect(() => {
    if (refetchOnMount) {
      fetchData()
    }
  }, [fetchData, refetchOnMount])

  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(fetchData, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refetchInterval])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    meta
  }
}

interface UseCMSItemOptions {
  enabled?: boolean
  includeContent?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

interface UseCMSItemResult<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCMSItem<T = any>(
  type: string,
  slug: string,
  campaign?: string,
  options: UseCMSItemOptions = {}
): UseCMSItemResult<T> {
  const {
    enabled = true,
    includeContent = true,
    onSuccess,
    onError
  } = options

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled || !type || !slug) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (campaign) params.set('campaign', campaign)
      if (!includeContent) params.set('includeContent', 'false')

      const response = await fetch(`/api/v2/content/${type}/${slug}?${params.toString()}`)
      const result: ApiResponse<T> = await response.json()

      if (result.success && result.data) {
        setData(result.data)
        onSuccess?.(result.data)
      } else {
        const errorMessage = result.error?.message || 'Erro ao carregar item'
        setError(errorMessage)
        onError?.(result.error)
      }
    } catch (err) {
      const errorMessage = 'Erro de conexão'
      setError(errorMessage)
      onError?.(err)
    } finally {
      setIsLoading(false)
    }
  }, [type, slug, campaign, enabled, includeContent, onSuccess, onError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  }
}

interface UseCMSMutationOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

interface UseCMSMutationResult {
  create: (data: any) => Promise<boolean>
  update: (data: any) => Promise<boolean>
  delete: (slug: string, campaign?: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
}

export function useCMSMutation(
  type: string,
  options: UseCMSMutationOptions = {}
): UseCMSMutationResult {
  const { onSuccess, onError } = options
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (data: any): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v2/content/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        onSuccess?.(result.data)
        return true
      } else {
        const errorMessage = result.error?.message || 'Erro ao criar conteúdo'
        setError(errorMessage)
        onError?.(result.error)
        return false
      }
    } catch (err) {
      const errorMessage = 'Erro de conexão'
      setError(errorMessage)
      onError?.(err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [type, onSuccess, onError])

  const update = useCallback(async (data: any): Promise<boolean> => {
    if (!data.slug) {
      setError('Slug é obrigatório para atualização')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v2/content/${type}/${data.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        onSuccess?.(result.data)
        return true
      } else {
        const errorMessage = result.error?.message || 'Erro ao atualizar conteúdo'
        setError(errorMessage)
        onError?.(result.error)
        return false
      }
    } catch (err) {
      const errorMessage = 'Erro de conexão'
      setError(errorMessage)
      onError?.(err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [type, onSuccess, onError])

  const deleteItem = useCallback(async (slug: string, campaign?: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (campaign) params.set('campaign', campaign)

      const response = await fetch(`/api/v2/content/${type}/${slug}?${params.toString()}`, {
        method: 'DELETE'
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        onSuccess?.(null)
        return true
      } else {
        const errorMessage = result.error?.message || 'Erro ao deletar conteúdo'
        setError(errorMessage)
        onError?.(result.error)
        return false
      }
    } catch (err) {
      const errorMessage = 'Erro de conexão'
      setError(errorMessage)
      onError?.(err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [type, onSuccess, onError])

  return {
    create,
    update,
    delete: deleteItem,
    isLoading,
    error
  }
}
