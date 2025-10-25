/**
 * Server Action Wrapper for handling Next.js hot reload issues
 * 
 * This wrapper handles the "Failed to find Server Action" errors that occur
 * during development hot reloading by implementing retry logic and graceful fallbacks.
 */

export async function withServerActionRetry<T>(
  serverAction: () => Promise<T>,
  maxRetries: number = 2,
  retryDelay: number = 1000
): Promise<T | null> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await serverAction()
    } catch (error) {
      lastError = error as Error
      
      // Check if it's a server action error during hot reload
      if (error instanceof Error && error.message.includes('Failed to find Server Action')) {
        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          continue
        } else {
          // Max retries reached, return null gracefully
          console.warn('Server Action temporarily unavailable after retries, skipping...')
          return null
        }
      } else {
        // Re-throw non-server-action errors
        throw error
      }
    }
  }
  
  // This should never be reached, but just in case
  throw lastError
}

/**
 * Hook for handling server actions with automatic retry logic
 */
export function useServerActionWithRetry() {
  const executeWithRetry = async <T>(
    serverAction: () => Promise<T>,
    options?: {
      maxRetries?: number
      retryDelay?: number
      onError?: (error: Error) => void
    }
  ): Promise<T | null> => {
    const { maxRetries = 2, retryDelay = 1000, onError } = options || {}
    
    try {
      return await withServerActionRetry(serverAction, maxRetries, retryDelay)
    } catch (error) {
      const err = error as Error
      if (onError) {
        onError(err)
      } else {
        console.error('Server action failed:', err)
      }
      return null
    }
  }
  
  return { executeWithRetry }
}
