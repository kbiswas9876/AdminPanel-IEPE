'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Filter schema matching our project structure
export interface FilterState {
  // Core filters
  search: string
  book_sources: string[]
  chapters: string[]
  tags: string[]
  difficulty: string
  
  // Sorting and pagination
  sort_by: string
  page: number
  pageSize: number
  
  // UI state
  isHydrated: boolean
}

// Filter actions
interface FilterActions {
  // Core filter updates
  setSearch: (search: string) => void
  setBookSources: (sources: string[]) => void
  setChapters: (chapters: string[]) => void
  setTags: (tags: string[]) => void
  setDifficulty: (difficulty: string) => void
  
  // Sorting and pagination
  setSortBy: (sortBy: string) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  
  // Bulk operations
  clearAllFilters: () => void
  setFilters: (filters: Partial<FilterState>) => void
  
  // Persistence
  hydrateFromURL: (urlParams: URLSearchParams) => void
  setHydrated: (hydrated: boolean) => void
  
  // Presets
  savePreset: (name: string) => void
  loadPreset: (name: string) => void
  deletePreset: (name: string) => void
  getPresets: () => string[]
}

// Initial state
const initialState: FilterState = {
  search: '',
  book_sources: [],
  chapters: [],
  tags: [],
  difficulty: 'all',
  sort_by: 'id_asc',
  page: 1,
  pageSize: 25,
  isHydrated: false
}

// Create the store with persistence
export const useFilterStore = create<FilterState & FilterActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      
      // Core filter updates
      setSearch: (search: string) => set((state) => {
        state.search = search
        state.page = 1 // Reset to first page when filtering
      }),
      
      setBookSources: (sources: string[]) => set((state) => {
        state.book_sources = sources
        state.page = 1
      }),
      
      setChapters: (chapters: string[]) => set((state) => {
        state.chapters = chapters
        state.page = 1
      }),
      
      setTags: (tags: string[]) => set((state) => {
        state.tags = tags
        state.page = 1
      }),
      
      setDifficulty: (difficulty: string) => set((state) => {
        state.difficulty = difficulty
        state.page = 1
      }),
      
      // Sorting and pagination
      setSortBy: (sortBy: string) => set((state) => {
        state.sort_by = sortBy
        state.page = 1
      }),
      
      setPage: (page: number) => set((state) => {
        state.page = page
      }),
      
      setPageSize: (pageSize: number) => set((state) => {
        state.pageSize = pageSize
        state.page = 1
      }),
      
      // Bulk operations
      clearAllFilters: () => set((state) => {
        Object.assign(state, initialState)
        state.isHydrated = true
      }),
      
      setFilters: (filters: Partial<FilterState>) => set((state) => {
        Object.assign(state, filters)
        state.page = 1
      }),
      
      // Persistence
      hydrateFromURL: (urlParams: URLSearchParams) => set((state) => {
        // Parse search
        const search = urlParams.get('search')
        if (search) state.search = search
        
        // Parse book sources
        const bookSources = urlParams.get('book_sources')
        if (bookSources) {
          state.book_sources = bookSources.split(',').map(s => 
            decodeURIComponent(s.replace(/\+/g, ' '))
          ).filter(Boolean)
        }
        
        // Parse chapters
        const chapters = urlParams.get('chapters')
        if (chapters) {
          state.chapters = chapters.split(',').map(s => 
            decodeURIComponent(s.replace(/\+/g, ' '))
          ).filter(Boolean)
        }
        
        // Parse tags
        const tags = urlParams.get('tags')
        if (tags) {
          state.tags = tags.split(',').map(s => 
            decodeURIComponent(s.replace(/\+/g, ' '))
          ).filter(Boolean)
        }
        
        // Parse difficulty
        const difficulty = urlParams.get('difficulty')
        if (difficulty) state.difficulty = difficulty
        
        // Parse sort by
        const sortBy = urlParams.get('sort_by')
        if (sortBy) state.sort_by = sortBy
        
        // Parse page
        const page = urlParams.get('page')
        if (page) {
          const pageNum = parseInt(page, 10)
          if (!isNaN(pageNum) && pageNum > 0) state.page = pageNum
        }
        
        // Parse page size
        const pageSize = urlParams.get('pageSize')
        if (pageSize) {
          const pageSizeNum = parseInt(pageSize, 10)
          if (!isNaN(pageSizeNum) && pageSizeNum > 0) state.pageSize = pageSizeNum
        }
      }),
      
      setHydrated: (hydrated: boolean) => set((state) => {
        state.isHydrated = hydrated
      }),
      
      // Presets
      savePreset: (name: string) => {
        const state = get()
        const presets = JSON.parse(localStorage.getItem('filter-presets') || '{}')
        presets[name] = {
          search: state.search,
          book_sources: state.book_sources,
          chapters: state.chapters,
          tags: state.tags,
          difficulty: state.difficulty,
          sort_by: state.sort_by,
          pageSize: state.pageSize
        }
        localStorage.setItem('filter-presets', JSON.stringify(presets))
      },
      
      loadPreset: (name: string) => {
        const presets = JSON.parse(localStorage.getItem('filter-presets') || '{}')
        const preset = presets[name]
        if (preset) {
          set((state) => {
            Object.assign(state, preset)
            state.page = 1
          })
        }
      },
      
      deletePreset: (name: string) => {
        const presets = JSON.parse(localStorage.getItem('filter-presets') || '{}')
        delete presets[name]
        localStorage.setItem('filter-presets', JSON.stringify(presets))
      },
      
      getPresets: () => {
        const presets = JSON.parse(localStorage.getItem('filter-presets') || '{}')
        return Object.keys(presets)
      }
    })),
    {
      name: 'filter-store',
      partialize: (state) => ({
        search: state.search,
        book_sources: state.book_sources,
        chapters: state.chapters,
        tags: state.tags,
        difficulty: state.difficulty,
        sort_by: state.sort_by,
        pageSize: state.pageSize
      })
    }
  )
)
