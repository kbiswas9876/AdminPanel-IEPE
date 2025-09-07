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
    <div className="bg-white border rounded-lg p-4 space-y-3">
      {/* Compact Filter Controls - Single Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Book Source Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Book:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 min-w-[120px] justify-between">
                {selectedBooks.length > 0 ? `${selectedBooks.length} selected` : 'All'}
                <Filter className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-64 overflow-y-auto">
              {filterOptions.bookSources.map((book) => (
                <DropdownMenuCheckboxItem
                  key={book}
                  checked={selectedBooks.includes(book)}
                  onCheckedChange={() => toggleBookSelection(book)}
                >
                  {book}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chapter Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Chapter:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 min-w-[120px] justify-between">
                {selectedChapters.length > 0 ? `${selectedChapters.length} selected` : 'All'}
                <Filter className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-64 overflow-y-auto">
              {filterOptions.chapters.map((chapter) => (
                <DropdownMenuCheckboxItem
                  key={chapter}
                  checked={selectedChapters.includes(chapter)}
                  onCheckedChange={() => toggleChapterSelection(chapter)}
                >
                  {chapter}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Difficulty:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 min-w-[120px] justify-between">
                {selectedDifficulties.length > 0 ? `${selectedDifficulties.length} selected` : 'All'}
                <Filter className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              {filterOptions.difficulties.map((difficulty) => (
                <DropdownMenuCheckboxItem
                  key={difficulty}
                  checked={selectedDifficulties.includes(difficulty)}
                  onCheckedChange={() => toggleDifficultySelection(difficulty)}
                >
                  {difficulty}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tags Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Tags:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 min-w-[120px] justify-between">
                {selectedTags.length > 0 ? `${selectedTags.length} selected` : 'All'}
                <Filter className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-64 overflow-y-auto">
              {filterOptions.tags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => toggleTagSelection(tag)}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {cascading && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>Updating...</span>
            </div>
          )}
          
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={resetFilters} className="h-8">
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
          
          <Button 
            onClick={applyFilters} 
            disabled={loading}
            size="sm"
            className="h-8 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Applying...' : 'Apply'}
          </Button>
        </div>
      </div>

      {/* Active Filter Badges - Compact Row */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {selectedBooks.map((book) => (
            <Badge key={book} variant="secondary" className="text-xs flex items-center gap-1">
              Book: {book}
              <button onClick={() => removeBook(book)} className="hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedChapters.map((chapter) => (
            <Badge key={chapter} variant="secondary" className="text-xs flex items-center gap-1">
              Chapter: {chapter}
              <button onClick={() => removeChapter(chapter)} className="hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedDifficulties.map((difficulty) => (
            <Badge key={difficulty} variant="secondary" className="text-xs flex items-center gap-1">
              Difficulty: {difficulty}
              <button onClick={() => removeDifficulty(difficulty)} className="hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1">
              Tag: {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Smart Filtering Info */}
      {(selectedBooks.length > 0 || selectedChapters.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
          <p className="text-xs text-blue-800">
            <strong>Smart Filtering:</strong> Chapter and tag options are automatically updated based on your selections.
          </p>
        </div>
      )}
    </div>
  )
}

