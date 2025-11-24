'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFilterStore } from '@/stores/filterStore'

export function useFilterSync() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    isHydrated,
    setHydrated,
    hydrateFromURL,
    search,
    book_sources,
    chapters,
    tags,
    difficulty,
    sort_by,
    page,
    pageSize
  } = useFilterStore()

  // Hydrate from URL on mount
  useEffect(() => {
    if (!isHydrated) {
      hydrateFromURL(searchParams)
      setHydrated(true)
    }
  }, [isHydrated, hydrateFromURL, setHydrated, searchParams])

  // Update URL when filters change
  useEffect(() => {
    if (!isHydrated) return

    const updateURL = () => {
      const params = new URLSearchParams()

      // Add search
      if (search) {
        params.set('search', search)
      }

      // Add book sources
      if (book_sources.length > 0) {
        const encodedSources = book_sources
          .map(s => encodeURIComponent(s).replace(/%20/g, '+'))
          .join(',')
        params.set('book_sources', encodedSources)
      }

      // Add chapters
      if (chapters.length > 0) {
        const encodedChapters = chapters
          .map(s => encodeURIComponent(s).replace(/%20/g, '+'))
          .join(',')
        params.set('chapters', encodedChapters)
      }

      // Add tags
      if (tags.length > 0) {
        const encodedTags = tags
          .map(s => encodeURIComponent(s).replace(/%20/g, '+'))
          .join(',')
        params.set('tags', encodedTags)
      }

      // Add difficulty
      if (difficulty && difficulty !== 'all') {
        params.set('difficulty', difficulty)
      }

      // Add sort by
      if (sort_by && sort_by !== 'id_asc') {
        params.set('sort_by', sort_by)
      }

      // Add page
      if (page > 1) {
        params.set('page', page.toString())
      }

      // Add page size
      if (pageSize !== 25) {
        params.set('pageSize', pageSize.toString())
      }

      const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname
      
      // Only update URL if it's different
      if (newURL !== window.location.search) {
        router.push(newURL)
      }
    }

    updateURL()
  }, [
    isHydrated,
    search,
    book_sources,
    chapters,
    tags,
    difficulty,
    sort_by,
    page,
    pageSize,
    router
  ])

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      hydrateFromURL(new URLSearchParams(window.location.search))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [hydrateFromURL])

  return {
    isHydrated
  }
}
