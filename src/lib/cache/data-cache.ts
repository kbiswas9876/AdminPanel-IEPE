'use client'

import { createAdminClient } from '@/lib/supabase/admin'

// Cache interface for type safety
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

// Global cache store
class DataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Get cache stats for debugging
  getStats() {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    const valid = entries.filter(([_, entry]) => now - entry.timestamp <= entry.ttl)
    const expired = entries.filter(([_, entry]) => now - entry.timestamp > entry.ttl)

    return {
      total: entries.length,
      valid: valid.length,
      expired: expired.length,
      keys: entries.map(([key]) => key)
    }
  }
}

// Global cache instance
export const dataCache = new DataCache()

// Cache keys for consistency
export const CACHE_KEYS = {
  DASHBOARD_STATS: 'dashboard_stats',
  RECENT_ACTIVITY: 'recent_activity',
  STUDENT_USERS: 'student_users',
  STUDENT_USERS_WITH_EMAILS: 'student_users_with_emails',
  QUESTIONS_LIST: 'questions_list',
  ERROR_REPORTS: 'error_reports',
  TEST_LIST: 'test_list'
} as const

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000,    // 2 minutes
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 15 * 60 * 1000,     // 15 minutes
  VERY_LONG: 60 * 60 * 1000 // 1 hour
} as const

// Enhanced cache with automatic invalidation
export class SmartCache {
  private cache = new DataCache()
  private invalidationCallbacks = new Map<string, Set<() => void>>()

  // Set data with automatic invalidation callbacks
  set<T>(key: string, data: T, ttl: number = CACHE_TTL.MEDIUM): void {
    this.cache.set(key, data, ttl)
  }

  get<T>(key: string): T | null {
    return this.cache.get<T>(key)
  }

  // Invalidate cache and trigger callbacks
  invalidate(key: string): void {
    this.cache.delete(key)
    const callbacks = this.invalidationCallbacks.get(key)
    if (callbacks) {
      callbacks.forEach(callback => callback())
    }
  }

  // Register invalidation callback
  onInvalidate(key: string, callback: () => void): () => void {
    if (!this.invalidationCallbacks.has(key)) {
      this.invalidationCallbacks.set(key, new Set())
    }
    this.invalidationCallbacks.get(key)!.add(callback)

    // Return cleanup function
    return () => {
      this.invalidationCallbacks.get(key)?.delete(callback)
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    this.invalidationCallbacks.clear()
  }
}

// Global smart cache instance
export const smartCache = new SmartCache()

// Utility functions for common cache operations
export const cacheUtils = {
  // Get or fetch with cache
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    const cached = dataCache.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetchFn()
    dataCache.set(key, data, ttl)
    return data
  },

  // Preload data for instant access
  async preload<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<void> {
    try {
      const data = await fetchFn()
      dataCache.set(key, data, ttl)
    } catch (error) {
      console.warn(`Failed to preload cache for key: ${key}`, error)
    }
  },

  // Batch preload multiple keys
  async preloadBatch(
    entries: Array<{
      key: string
      fetchFn: () => Promise<any>
      ttl?: number
    }>
  ): Promise<void> {
    const promises = entries.map(({ key, fetchFn, ttl = CACHE_TTL.MEDIUM }) =>
      this.preload(key, fetchFn, ttl)
    )
    
    await Promise.allSettled(promises)
  }
}
