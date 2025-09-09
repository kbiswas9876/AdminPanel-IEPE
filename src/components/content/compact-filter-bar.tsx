'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Filter, X, RotateCcw } from 'lucide-react'
import { getFilterOptions, searchQuestions } from '@/lib/actions/tests'
import type { Question } from '@/lib/types'

interface FilterOptions {
  bookSources: string[]
  chapters: string[]
  tags: string[]
  difficulties: string[]
}

interface CompactFilterBarProps {
  onFiltersApplied: (questions: Question[], total: number) => void
  onLoadingChange: (loading: boolean) => void
}

export function CompactFilterBar({ onFiltersApplied, onLoadingChange }: CompactFilterBarProps) {
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    bookSources: [],
    chapters: [],
    tags: [],
    difficulties: ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard']
  })
  const [loading, setLoading] = useState(false)
  const [cascading, setCascading] = useState(false)

  // Load initial filter options
  useEffect(() => {
    const loadInitialOptions = async () => {
      try {
        const options = await getFilterOptions()
        setFilterOptions(options)
      } catch (error) {
        console.error('Failed to load filter options:', error)
      }
    }
    loadInitialOptions()
  }, [])

  // Load cascading filter options when book or chapter selection changes
  const loadCascadingOptions = useCallback(async () => {
    setCascading(true)
    try {
      const options = await getFilterOptions({
        bookSources: selectedBooks.length > 0 ? selectedBooks : undefined,
        chapters: selectedChapters.length > 0 ? selectedChapters : undefined
      })
      
      setFilterOptions(options)
      
      // Remove invalid selections after cascade
      setSelectedChapters(prev => {
        const valid = prev.filter(chapter => options.chapters.includes(chapter))
        return valid
      })
      
      setSelectedTags(prev => {
        const valid = prev.filter(tag => options.tags.includes(tag))
        return valid
      })
    } catch (error) {
      console.error('Failed to load cascading options:', error)
    } finally {
      setCascading(false)
    }
  }, [selectedBooks, selectedChapters])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCascadingOptions()
    }, 300) // Debounce cascading calls

    return () => clearTimeout(timer)
  }, [loadCascadingOptions])

  const applyFilters = async () => {
    setLoading(true)
    onLoadingChange(true)
    
    try {
      const { questions, total } = await searchQuestions({
        book_sources: selectedBooks.length > 0 ? selectedBooks : undefined,
        chapters: selectedChapters.length > 0 ? selectedChapters : undefined,
        difficulty: selectedDifficulties.length === 1 ? selectedDifficulties[0] as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard' : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        page: 1,
        pageSize: 1000 // Get all results for now, pagination can be added later
      })
      
      onFiltersApplied(questions, total)
    } catch (error) {
      console.error('Failed to apply filters:', error)
      onFiltersApplied([], 0)
    } finally {
      setLoading(false)
      onLoadingChange(false)
    }
  }

  const resetFilters = () => {
    setSelectedBooks([])
    setSelectedChapters([])
    setSelectedDifficulties([])
    setSelectedTags([])
  }

  const toggleBookSelection = (book: string) => {
    setSelectedBooks(prev => 
      prev.includes(book) 
        ? prev.filter(b => b !== book)
        : [...prev, book]
    )
  }

  const toggleChapterSelection = (chapter: string) => {
    setSelectedChapters(prev => 
      prev.includes(chapter) 
        ? prev.filter(c => c !== chapter)
        : [...prev, chapter]
    )
  }

  const toggleDifficultySelection = (difficulty: string) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    )
  }

  const toggleTagSelection = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const removeBook = (book: string) => {
    setSelectedBooks(prev => prev.filter(b => b !== book))
  }

  const removeChapter = (chapter: string) => {
    setSelectedChapters(prev => prev.filter(c => c !== chapter))
  }

  const removeDifficulty = (difficulty: string) => {
    setSelectedDifficulties(prev => prev.filter(d => d !== difficulty))
  }

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  const hasActiveFilters = selectedBooks.length > 0 || selectedChapters.length > 0 || selectedDifficulties.length > 0 || selectedTags.length > 0

  return (
    <div className="bg-white border border-gray-200/60 rounded-xl mobile-p shadow-sm">
      {/* Compact Mobile-First Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mobile-gap">
        {/* Book Source Filter */}
        <div className="space-y-1">
          <label className="mobile-text-xs font-medium text-gray-600">Book Source</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-8 justify-between bg-white hover:bg-gray-50 border-gray-300">
                <span className="truncate mobile-text-sm">
                  {selectedBooks.length > 0 ? `${selectedBooks.length} selected` : 'All Books'}
                </span>
                <Filter className="h-3 w-3 ml-2 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[200px] max-h-64 overflow-y-auto">
              {filterOptions.bookSources.map((book) => (
                <DropdownMenuCheckboxItem
                  key={book}
                  checked={selectedBooks.includes(book)}
                  onCheckedChange={() => toggleBookSelection(book)}
                  className="touch-target"
                >
                  {book}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chapter Filter */}
        <div className="space-y-1">
          <label className="mobile-text-xs font-medium text-gray-600">Chapter</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-8 justify-between bg-white hover:bg-gray-50 border-gray-300">
                <span className="truncate mobile-text-sm">
                  {selectedChapters.length > 0 ? `${selectedChapters.length} selected` : 'All Chapters'}
                </span>
                <Filter className="h-3 w-3 ml-2 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[200px] max-h-64 overflow-y-auto">
              {filterOptions.chapters.map((chapter) => (
                <DropdownMenuCheckboxItem
                  key={chapter}
                  checked={selectedChapters.includes(chapter)}
                  onCheckedChange={() => toggleChapterSelection(chapter)}
                  className="touch-target"
                >
                  {chapter}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-1">
          <label className="mobile-text-xs font-medium text-gray-600">Difficulty</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-8 justify-between bg-white hover:bg-gray-50 border-gray-300">
                <span className="truncate mobile-text-sm">
                  {selectedDifficulties.length > 0 ? `${selectedDifficulties.length} selected` : 'All Levels'}
                </span>
                <Filter className="h-3 w-3 ml-2 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[200px]">
              {filterOptions.difficulties.map((difficulty) => (
                <DropdownMenuCheckboxItem
                  key={difficulty}
                  checked={selectedDifficulties.includes(difficulty)}
                  onCheckedChange={() => toggleDifficultySelection(difficulty)}
                  className="touch-target"
                >
                  {difficulty}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tags Filter */}
        <div className="space-y-1">
          <label className="mobile-text-xs font-medium text-gray-600">Tags</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-8 justify-between bg-white hover:bg-gray-50 border-gray-300">
                <span className="truncate mobile-text-sm">
                  {selectedTags.length > 0 ? `${selectedTags.length} selected` : 'All Tags'}
                </span>
                <Filter className="h-3 w-3 ml-2 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[200px] max-h-64 overflow-y-auto">
              {filterOptions.tags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => toggleTagSelection(tag)}
                  className="touch-target"
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>

      {/* Compact Action Buttons */}
      <div className="flex flex-col sm:flex-row mobile-gap">
        {cascading && (
          <div className="flex items-center gap-2 mobile-text-sm text-blue-600">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span>Updating...</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row mobile-gap w-full sm:w-auto">
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFilters} 
              className="w-full sm:w-auto h-8 touch-target mobile-text-sm"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
          
          <Button 
            onClick={applyFilters} 
            disabled={loading}
            size="sm"
            className="w-full sm:w-auto h-8 bg-blue-600 hover:bg-blue-700 touch-target mobile-text-sm"
          >
            {loading ? 'Applying...' : 'Apply'}
          </Button>
        </div>
      </div>

      {/* Compact Active Filter Badges */}
      {hasActiveFilters && (
        <div className="mobile-space-y-sm">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 bg-blue-500 rounded-full"></div>
            <span className="mobile-text-xs font-medium text-gray-600">Active Filters</span>
          </div>
          <div className="flex flex-wrap mobile-gap-sm">
            {selectedBooks.map((book) => (
              <Badge key={book} variant="secondary" className="mobile-text-xs flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                <span className="font-medium">Book:</span>
                <span className="truncate max-w-[100px]">{book}</span>
                <button 
                  onClick={() => removeBook(book)} 
                  className="hover:text-red-600 hover:bg-red-50 rounded-full p-0.5 transition-colors touch-target"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            ))}
            {selectedChapters.map((chapter) => (
              <Badge key={chapter} variant="secondary" className="mobile-text-xs flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full">
                <span className="font-medium">Ch:</span>
                <span className="truncate max-w-[100px]">{chapter}</span>
                <button 
                  onClick={() => removeChapter(chapter)} 
                  className="hover:text-red-600 hover:bg-red-50 rounded-full p-0.5 transition-colors touch-target"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            ))}
            {selectedDifficulties.map((difficulty) => (
              <Badge key={difficulty} variant="secondary" className="mobile-text-xs flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full">
                <span className="font-medium">Level:</span>
                <span className="truncate max-w-[100px]">{difficulty}</span>
                <button 
                  onClick={() => removeDifficulty(difficulty)} 
                  className="hover:text-red-600 hover:bg-red-50 rounded-full p-0.5 transition-colors touch-target"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            ))}
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="mobile-text-xs flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                <span className="font-medium">Tag:</span>
                <span className="truncate max-w-[100px]">{tag}</span>
                <button 
                  onClick={() => removeTag(tag)} 
                  className="hover:text-red-600 hover:bg-red-50 rounded-full p-0.5 transition-colors touch-target"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Compact Smart Filtering Info */}
      {(selectedBooks.length > 0 || selectedChapters.length > 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-lg mobile-p-sm">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            </div>
            <div>
              <p className="mobile-text-xs font-medium text-blue-800 mb-1">Smart Filtering Active</p>
              <p className="mobile-text-xs text-blue-700">
                Options are automatically updated for more relevant results.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

