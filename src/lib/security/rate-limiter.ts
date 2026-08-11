'use server'

import { createAdminClient } from '@/lib/supabase/admin'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (identifier: string) => string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private config: RateLimitConfig
  private store = new Map<string, RateLimitEntry>()

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async checkLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Clean up expired entries
    for (const [k, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(k)
      }
    }

    const entry = this.store.get(key)
    
    if (!entry || entry.resetTime < now) {
      // Create new entry
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.windowMs
      }
      this.store.set(key, newEntry)
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: newEntry.resetTime
      }
    }

    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Increment count
    entry.count++
    this.store.set(key, entry)

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }
}

// Predefined rate limiters
export const userActionLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 50, // 50 user actions per 15 minutes
  keyGenerator: (userId: string) => `user_actions:${userId}`
})

export const bulkActionLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 bulk actions per hour
  keyGenerator: (userId: string) => `bulk_actions:${userId}`
})

export const loginAttemptLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  keyGenerator: (ip: string) => `login_attempts:${ip}`
})

export const exportLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 20, // 20 exports per hour
  keyGenerator: (userId: string) => `exports:${userId}`
})

// Rate limiting middleware
export async function checkRateLimit(
  limiter: RateLimiter,
  identifier: string,
  action: string
): Promise<{ success: boolean; error?: string; remaining?: number; resetTime?: number }> {
  try {
    const result = await limiter.checkLimit(identifier)
    
    if (!result.allowed) {
      // Log rate limit violation
      const supabase = createAdminClient()
      await supabase.from('security_logs').insert({
        event_type: 'RATE_LIMIT_EXCEEDED',
        user_id: identifier,
        ip_address: 'unknown', // Will be set by caller
        user_agent: 'unknown', // Will be set by caller
        details: {
          action,
          limit: limiter['config'].maxRequests,
          window: limiter['config'].windowMs,
          remaining: result.remaining,
          resetTime: result.resetTime
        }
      })

      return {
        success: false,
        error: `Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000 / 60)} minutes.`,
        remaining: result.remaining,
        resetTime: result.resetTime
      }
    }

    return {
      success: true,
      remaining: result.remaining,
      resetTime: result.resetTime
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    return {
      success: false,
      error: 'Rate limit check failed'
    }
  }
}
