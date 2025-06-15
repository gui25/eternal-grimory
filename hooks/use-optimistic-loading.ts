"use client"

import { useState, useEffect, useCallback } from "react"

interface UseOptimisticLoadingOptions {
  minLoadingTime?: number // Minimum time to show loading state
  maxLoadingTime?: number // Maximum time before showing error
  debounceTime?: number   // Debounce rapid state changes
}

interface OptimisticLoadingState {
  isLoading: boolean
  error: Error | null
  data: any
  startLoading: () => void
  stopLoading: (data?: any) => void
  setError: (error: Error) => void
  reset: () => void
}

export function useOptimisticLoading(options: UseOptimisticLoadingOptions = {}): OptimisticLoadingState {
  const {
    minLoadingTime = 300,
    maxLoadingTime = 10000,
    debounceTime = 100
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState(null)
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setLoadingStartTime(Date.now())
  }, [])

  const stopLoading = useCallback((newData?: any) => {
    const now = Date.now()
    const elapsed = loadingStartTime ? now - loadingStartTime : 0
    
    if (elapsed < minLoadingTime) {
      // Keep loading for minimum time to avoid flickering
      setTimeout(() => {
        setIsLoading(false)
        if (newData !== undefined) setData(newData)
      }, minLoadingTime - elapsed)
    } else {
      setIsLoading(false)
      if (newData !== undefined) setData(newData)
    }
  }, [loadingStartTime, minLoadingTime])

  const handleError = useCallback((error: Error) => {
    setError(error)
    setIsLoading(false)
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setData(null)
    setLoadingStartTime(null)
  }, [])

  // Auto-timeout for loading states
  useEffect(() => {
    if (!isLoading || !loadingStartTime) return

    const timeout = setTimeout(() => {
      setError(new Error('Timeout: A operação demorou mais que o esperado'))
      setIsLoading(false)
    }, maxLoadingTime)

    return () => clearTimeout(timeout)
  }, [isLoading, loadingStartTime, maxLoadingTime])

  return {
    isLoading,
    error,
    data,
    startLoading,
    stopLoading,
    setError: handleError,
    reset
  }
}

// Hook especializado para operações de busca
export function useOptimisticFetch<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options: UseOptimisticLoadingOptions = {}
) {
  const loading = useOptimisticLoading(options)
  
  const refetch = useCallback(async () => {
    loading.startLoading()
    try {
      const result = await fetchFn()
      loading.stopLoading(result)
      return result
    } catch (error) {
      loading.setError(error as Error)
      throw error
    }
  }, [fetchFn, loading])
  
  useEffect(() => {
    refetch()
  }, dependencies)
  
  return {
    ...loading,
    refetch
  }
} 