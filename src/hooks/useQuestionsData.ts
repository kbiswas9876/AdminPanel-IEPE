'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { searchQuestions } from '@/lib/actions/tests'
import { useFilterStore } from '@/stores/filterStore'

export function useQuestionsData() {
  const {
    search,
    book_sources,
    chapters,
    tags,
    difficulty,
    sort_by,
    page,
    pageSize,
    isHydrated
  } = useFilterStore()

  // Create stable query key for React Query caching
  const queryKey = useMemo(() => {
    if (!isHydrated) return ['questions', 'loading']
    
    return [
      'questions',
      {
        search: search || '',
        book_sources: book_sources || [],
        chapters: chapters || [],
        tags: tags || [],
        difficulty: difficulty === 'all' ? undefined : (difficulty as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard') || undefined,
        sort_by: sort_by || 'id_asc',
        page: page || 1,
        pageSize: pageSize || 25
      }
    ]
  }, [search, book_sources, chapters, tags, difficulty, sort_by, page, pageSize, isHydrated])

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!isHydrated) {
        return { questions: [], total: 0 }
      }

      // Sequential filtering: Book → Chapter → Difficulty → Tags → Search
      const result = await searchQuestions({
        search: search || '',
        book_sources: book_sources || [],
        chapters: chapters || [],
        tags: tags || [],
        difficulty: difficulty === 'all' ? undefined : (difficulty as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard') || undefined,
        sort_by: sort_by || 'id_asc',
        page: page || 1,
        pageSize: pageSize || 25
      })

      return result
    },
    enabled: isHydrated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2
  })

  // Calculate derived state
  const hasActiveFilters = useMemo(() => {
    return !!(
      search ||
      book_sources.length > 0 ||
      chapters.length > 0 ||
      tags.length > 0 ||
      (difficulty && difficulty !== 'all') ||
      sort_by !== 'id_asc'
    )
  }, [search, book_sources, chapters, tags, difficulty, sort_by])

  const totalPages = useMemo(() => {
    if (!query.data?.total || !pageSize) return 0
    return Math.ceil(query.data.total / pageSize)
  }, [query.data?.total, pageSize])

  return {
    // Data
    questions: query.data?.questions || [],
    total: query.data?.total || 0,
    
    // Loading states
    isLoading: query.isLoading || !isHydrated,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    
    // Actions
    refetch: query.refetch,
    
    // Derived state
    hasActiveFilters,
    totalPages,
    currentPage: page,
    pageSize
  }
}
