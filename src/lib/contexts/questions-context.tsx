'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { getQuestions } from '@/lib/actions/questions'
import type { Question } from '@/lib/types'

interface QuestionsContextType {
  // State
  questions: Question[]
  totalCount: number
  isLoading: boolean
  error: string | null
  lastFetched: number | null
  
  // Actions
  fetchQuestions: (page?: number, limit?: number, search?: string) => Promise<void>
  refreshQuestions: () => Promise<void>
  updateQuestionInCache: (updatedQuestion: Question) => void
  removeQuestionFromCache: (questionId: number) => void
  clearCache: () => void
  
  // Cache management
  isStale: () => boolean
  getCachedQuestions: () => Question[]
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined)

interface QuestionsProviderProps {
  children: ReactNode
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

export function QuestionsProvider({ children }: QuestionsProviderProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<number | null>(null)

  const fetchQuestions = useCallback(async (page: number = 1, limit: number = 20, search?: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await getQuestions(page, limit, search)
      
      if (result.error) {
        setError(result.error)
        setQuestions([])
        setTotalCount(0)
      } else {
        setQuestions(result.data)
        setTotalCount(result.count)
        setLastFetched(Date.now())
      }
    } catch (err) {
      console.error('Error fetching questions:', err)
      setError('An unexpected error occurred while fetching questions')
      setQuestions([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshQuestions = useCallback(async () => {
    // Force refresh by clearing cache timestamp
    setLastFetched(null)
    await fetchQuestions()
  }, [fetchQuestions])

  const updateQuestionInCache = useCallback((updatedQuestion: Question) => {
    setQuestions(prev => 
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    )
  }, [])

  const removeQuestionFromCache = useCallback((questionId: number) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId))
    setTotalCount(prev => Math.max(0, prev - 1))
  }, [])

  const clearCache = useCallback(() => {
    setQuestions([])
    setTotalCount(0)
    setLastFetched(null)
    setError(null)
  }, [])

  const isStale = useCallback(() => {
    if (!lastFetched) return true
    return Date.now() - lastFetched > CACHE_DURATION
  }, [lastFetched])

  const getCachedQuestions = useCallback(() => {
    return questions
  }, [questions])

  const value: QuestionsContextType = {
    questions,
    totalCount,
    isLoading,
    error,
    lastFetched,
    fetchQuestions,
    refreshQuestions,
    updateQuestionInCache,
    removeQuestionFromCache,
    clearCache,
    isStale,
    getCachedQuestions
  }

  return (
    <QuestionsContext.Provider value={value}>
      {children}
    </QuestionsContext.Provider>
  )
}

export function useQuestions() {
  const context = useContext(QuestionsContext)
  if (context === undefined) {
    throw new Error('useQuestions must be used within a QuestionsProvider')
  }
  return context
}
