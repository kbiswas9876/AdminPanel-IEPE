'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { UserProfile } from '@/lib/supabase/admin'

export interface StudentFilters {
  search: string
  status: string[]
  role: string[]
  dateRange: {
    from: Date | null
    to: Date | null
  }
  sortBy: 'name' | 'email' | 'created_at' | 'updated_at'
  sortOrder: 'asc' | 'desc'
}

export interface FilterPreset {
  id: string
  name: string
  filters: StudentFilters
  createdAt: Date
}

const defaultFilters: StudentFilters = {
  search: '',
  status: [],
  role: [],
  dateRange: {
    from: null,
    to: null
  },
  sortBy: 'created_at',
  sortOrder: 'desc'
}

export function useStudentFilters(users: UserProfile[]) {
  const [filters, setFilters] = useState<StudentFilters>(defaultFilters)
  const [presets, setPresets] = useState<FilterPreset[]>([])
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  // Load presets from localStorage on mount
  useEffect(() => {
    const savedPresets = localStorage.getItem('student-filter-presets')
    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets)
        setPresets(parsed.map((p: any) => ({
          ...p,
          filters: {
            ...p.filters,
            dateRange: {
              from: p.filters.dateRange.from ? new Date(p.filters.dateRange.from) : null,
              to: p.filters.dateRange.to ? new Date(p.filters.dateRange.to) : null
            }
          }
        })))
      } catch (error) {
        console.error('Failed to load filter presets:', error)
      }
    }
  }, [])

  // Save presets to localStorage
  const savePreset = useCallback((name: string) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters: { ...filters },
      createdAt: new Date()
    }
    
    const updatedPresets = [...presets, newPreset]
    setPresets(updatedPresets)
    localStorage.setItem('student-filter-presets', JSON.stringify(updatedPresets))
  }, [filters, presets])

  // Load preset
  const loadPreset = useCallback((preset: FilterPreset) => {
    setFilters(preset.filters)
  }, [])

  // Delete preset
  const deletePreset = useCallback((presetId: string) => {
    const updatedPresets = presets.filter(p => p.id !== presetId)
    setPresets(updatedPresets)
    localStorage.setItem('student-filter-presets', JSON.stringify(updatedPresets))
  }, [presets])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  // Update individual filter
  const updateFilter = useCallback(<K extends keyof StudentFilters>(
    key: K,
    value: StudentFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [filters.search])

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = [...users]

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase()
      result = result.filter(user => 
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter(user => filters.status.includes(user.status))
    }

    // Apply role filter
    if (filters.role.length > 0) {
      result = result.filter(user => filters.role.includes(user.role))
    }

    // Apply date range filter
    if (filters.dateRange.from) {
      result = result.filter(user => 
        new Date(user.created_at) >= filters.dateRange.from!
      )
    }
    if (filters.dateRange.to) {
      result = result.filter(user => 
        new Date(user.created_at) <= filters.dateRange.to!
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.full_name || ''
          bValue = b.full_name || ''
          break
        case 'email':
          aValue = a.email || ''
          bValue = b.email || ''
          break
        case 'created_at':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'updated_at':
          aValue = new Date(a.updated_at || a.created_at)
          bValue = new Date(b.updated_at || b.created_at)
          break
        default:
          return 0
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [users, debouncedSearch, filters])

  // Get filter summary
  const filterSummary = useMemo(() => {
    const activeFilters = []
    
    if (debouncedSearch) activeFilters.push(`Search: "${debouncedSearch}"`)
    if (filters.status.length > 0) activeFilters.push(`Status: ${filters.status.join(', ')}`)
    if (filters.role.length > 0) activeFilters.push(`Role: ${filters.role.join(', ')}`)
    if (filters.dateRange.from) activeFilters.push(`From: ${filters.dateRange.from.toLocaleDateString()}`)
    if (filters.dateRange.to) activeFilters.push(`To: ${filters.dateRange.to.toLocaleDateString()}`)
    
    return activeFilters
  }, [debouncedSearch, filters])

  return {
    filters,
    filteredUsers,
    presets,
    isAdvancedOpen,
    setIsAdvancedOpen,
    updateFilter,
    clearFilters,
    savePreset,
    loadPreset,
    deletePreset,
    filterSummary,
    hasActiveFilters: filterSummary.length > 0
  }
}
