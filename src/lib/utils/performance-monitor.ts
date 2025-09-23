'use client'

// Performance monitoring utilities for Apple-inspired smooth navigation
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  private observers: PerformanceObserver[] = []

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Monitor navigation performance
  startNavigationTimer(route: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      this.recordMetric(`navigation_${route}`, duration)
      
      // Log slow navigations
      if (duration > 300) {
        console.warn(`Slow navigation to ${route}: ${duration.toFixed(2)}ms`)
      }
    }
  }

  // Monitor component render performance
  startRenderTimer(component: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      this.recordMetric(`render_${component}`, duration)
      
      // Log slow renders
      if (duration > 100) {
        console.warn(`Slow render for ${component}: ${duration.toFixed(2)}ms`)
      }
    }
  }

  // Monitor data fetching performance
  startDataFetchTimer(operation: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      this.recordMetric(`data_fetch_${operation}`, duration)
      
      // Log slow data fetches
      if (duration > 1000) {
        console.warn(`Slow data fetch for ${operation}: ${duration.toFixed(2)}ms`)
      }
    }
  }

  // Record a performance metric
  private recordMetric(key: string, value: number): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    
    const values = this.metrics.get(key)!
    values.push(value)
    
    // Keep only last 50 measurements
    if (values.length > 50) {
      values.shift()
    }
  }

  // Get performance statistics
  getStats(key: string): {
    average: number
    min: number
    max: number
    count: number
    p95: number
  } | null {
    const values = this.metrics.get(key)
    if (!values || values.length === 0) {
      return null
    }

    const sorted = [...values].sort((a, b) => a - b)
    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    const p95Index = Math.floor(sorted.length * 0.95)
    const p95 = sorted[p95Index]

    return {
      average: Math.round(average * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      count: values.length,
      p95: Math.round(p95 * 100) / 100
    }
  }

  // Get all performance metrics
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {}
    
    for (const [key] of this.metrics) {
      const stat = this.getStats(key)
      if (stat) {
        stats[key] = stat
      }
    }
    
    return stats
  }

  // Monitor Core Web Vitals
  observeCoreWebVitals(): void {
    if (typeof window === 'undefined') return

    try {
      // Monitor Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.recordMetric('lcp', lastEntry.startTime)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(lcpObserver)

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          this.recordMetric('fid', entry.processingStart - entry.startTime)
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
      this.observers.push(fidObserver)

      // Monitor Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.recordMetric('cls', clsValue)
          }
        })
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(clsObserver)

    } catch (error) {
      console.warn('Performance monitoring not supported:', error)
    }
  }

  // Monitor frame rate
  monitorFrameRate(): void {
    if (typeof window === 'undefined') return

    let frameCount = 0
    let lastTime = performance.now()

    const measureFrameRate = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        this.recordMetric('fps', fps)
        
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(measureFrameRate)
    }
    
    requestAnimationFrame(measureFrameRate)
  }

  // Cleanup observers
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }

  // Log performance report
  logReport(): void {
    const stats = this.getAllStats()
    console.group('🚀 Performance Report')
    
    // Navigation performance
    const navigationStats = Object.entries(stats)
      .filter(([key]) => key.startsWith('navigation_'))
      .map(([key, value]) => [key.replace('navigation_', ''), value])
    
    if (navigationStats.length > 0) {
      console.group('📱 Navigation Performance')
      navigationStats.forEach(([route, stats]) => {
        console.log(`${route}: ${stats.average}ms avg (${stats.p95}ms p95)`)
      })
      console.groupEnd()
    }

    // Render performance
    const renderStats = Object.entries(stats)
      .filter(([key]) => key.startsWith('render_'))
      .map(([key, value]) => [key.replace('render_', ''), value])
    
    if (renderStats.length > 0) {
      console.group('⚡ Render Performance')
      renderStats.forEach(([component, stats]) => {
        console.log(`${component}: ${stats.average}ms avg (${stats.p95}ms p95)`)
      })
      console.groupEnd()
    }

    // Core Web Vitals
    const lcp = stats.lcp
    const fid = stats.fid
    const cls = stats.cls
    const fps = stats.fps

    if (lcp || fid || cls || fps) {
      console.group('📊 Core Web Vitals')
      if (lcp) console.log(`LCP: ${lcp.average}ms`)
      if (fid) console.log(`FID: ${fid.average}ms`)
      if (cls) console.log(`CLS: ${cls.average}`)
      if (fps) console.log(`FPS: ${fps.average}`)
      console.groupEnd()
    }

    console.groupEnd()
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Performance monitoring hooks for React components
export const usePerformanceMonitor = () => {
  const startNavigationTimer = (route: string) => 
    performanceMonitor.startNavigationTimer(route)
  
  const startRenderTimer = (component: string) => 
    performanceMonitor.startRenderTimer(component)
  
  const startDataFetchTimer = (operation: string) => 
    performanceMonitor.startDataFetchTimer(operation)
  
  const getStats = (key: string) => 
    performanceMonitor.getStats(key)
  
  const logReport = () => 
    performanceMonitor.logReport()

  return {
    startNavigationTimer,
    startRenderTimer,
    startDataFetchTimer,
    getStats,
    logReport
  }
}
