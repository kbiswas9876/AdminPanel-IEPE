'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

interface PerformanceMetrics {
  renderTime: number
  searchTime: number
  filterTime: number
  bulkOperationTime: number
  memoryUsage: number
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    searchTime: 0,
    filterTime: 0,
    bulkOperationTime: 0,
    memoryUsage: 0
  })

  const [isMonitoring, setIsMonitoring] = useState(false)

  const startTimer = useCallback(() => {
    return performance.now()
  }, [])

  const endTimer = useCallback((startTime: number, operation: keyof PerformanceMetrics) => {
    const endTime = performance.now()
    const duration = endTime - startTime
    
    setMetrics(prev => ({
      ...prev,
      [operation]: duration
    }))
    
    return duration
  }, [])

  const measureRender = useCallback((renderFn: () => void) => {
    const start = startTimer()
    renderFn()
    endTimer(start, 'renderTime')
  }, [startTimer, endTimer])

  const measureSearch = useCallback(async (searchFn: () => Promise<any>) => {
    const start = startTimer()
    const result = await searchFn()
    endTimer(start, 'searchTime')
    return result
  }, [startTimer, endTimer])

  const measureFilter = useCallback((filterFn: () => void) => {
    const start = startTimer()
    filterFn()
    endTimer(start, 'filterTime')
  }, [startTimer, endTimer])

  const measureBulkOperation = useCallback(async (operationFn: () => Promise<any>) => {
    const start = startTimer()
    const result = await operationFn()
    endTimer(start, 'bulkOperationTime')
    return result
  }, [startTimer, endTimer])

  // Monitor memory usage
  useEffect(() => {
    if (!isMonitoring) return

    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
        }))
      }
    }

    const interval = setInterval(updateMemoryUsage, 1000)
    return () => clearInterval(interval)
  }, [isMonitoring])

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
  }, [])

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  const resetMetrics = useCallback(() => {
    setMetrics({
      renderTime: 0,
      searchTime: 0,
      filterTime: 0,
      bulkOperationTime: 0,
      memoryUsage: 0
    })
  }, [])

  return {
    metrics,
    isMonitoring,
    startTimer,
    endTimer,
    measureRender,
    measureSearch,
    measureFilter,
    measureBulkOperation,
    startMonitoring,
    stopMonitoring,
    resetMetrics
  }
}

// Debounced search hook
export function useDebouncedSearch<T>(
  searchTerm: string,
  delay: number = 300
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(searchTerm as T)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(searchTerm as T)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, delay])

  return debouncedValue
}

// Memoization hook for expensive computations
export function useMemoizedValue<T>(
  computeFn: () => T,
  deps: React.DependencyList
): T {
  return useMemo(computeFn, deps)
}

// Virtual scrolling hook
export function useVirtualScrolling(
  items: any[],
  containerHeight: number,
  itemHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )
    
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex)
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight

  return {
    visibleItems,
    visibleRange,
    totalHeight,
    setScrollTop
  }
}