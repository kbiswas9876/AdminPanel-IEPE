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
import { Filter, X, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown, Sparkles } from 'lucide-react'
import { getFilterOptions, searchQuestions } from '@/lib/actions/tests'
import type { Question } from '@/lib/types'

interface FilterOptions {
  bookSources: string[]
  chapters: string[]
  tags: string[]
  difficulties: string[]
}

type SortOption = {
  value: string
  label: string
  icon: React.ReactNode
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'id_asc', label: 'ID (Ascending)', icon: <ArrowUp className="h-3 w-3" /> },
  { value: 'id_desc', label: 'ID (Descending)', icon: <ArrowDown className="h-3 w-3" /> },
  { value: 'question_text_asc', label: 'Question Text (A-Z)', icon: <ArrowUp className="h-3 w-3" /> },
  { value: 'question_text_desc', label: 'Question Text (Z-A)', icon: <ArrowDown className="h-3 w-3" /> },
  { value: 'book_source_asc', label: 'Book Source (A-Z)', icon: <ArrowUp className="h-3 w-3" /> },
  { value: 'book_source_desc', label: 'Book Source (Z-A)', icon: <ArrowDown className="h-3 w-3" /> },
  { value: 'chapter_asc', label: 'Chapter (A-Z)', icon: <ArrowUp className="h-3 w-3" /> },
  { value: 'chapter_desc', label: 'Chapter (Z-A)', icon: <ArrowDown className="h-3 w-3" /> },
  { value: 'difficulty_asc', label: 'Difficulty (Easy to Hard)', icon: <ArrowUp className="h-3 w-3" /> },
  { value: 'difficulty_desc', label: 'Difficulty (Hard to Easy)', icon: <ArrowDown className="h-3 w-3" /> },
]

interface CompactFilterBarProps {
  onFiltersApplied: (questions: Question[], total: number) => void
  onLoadingChange: (loading: boolean) => void
}

export function CompactFilterBar({ onFiltersApplied, onLoadingChange }: CompactFilterBarProps) {
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>('id_asc')
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
    // Only run cascading if there are actual selections
    if (selectedBooks.length === 0 && selectedChapters.length === 0) {
      return
    }
    
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
    // Only set up the timer if there are actual selections
    if (selectedBooks.length > 0 || selectedChapters.length > 0) {
      const timer = setTimeout(() => {
        loadCascadingOptions()
      }, 300) // Debounce cascading calls

      return () => clearTimeout(timer)
    }
  }, [loadCascadingOptions, selectedBooks.length, selectedChapters.length])

  const applyFilters = async () => {
    setLoading(true)
    onLoadingChange(true)
    
    try {
      const { questions, total } = await searchQuestions({
        book_sources: selectedBooks.length > 0 ? selectedBooks : undefined,
        chapters: selectedChapters.length > 0 ? selectedChapters : undefined,
        difficulty: selectedDifficulties.length === 1 ? selectedDifficulties[0] as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard' : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        sort_by: sortBy,
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
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-indigo-400/10 rounded-xl sm:rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 pointer-events-none"></div>
      <div className="relative bg-white/90 backdrop-blur-xl border border-white/30 rounded-xl sm:rounded-2xl shadow-2xl shadow-blue-500/10 hover:shadow-3xl hover:shadow-blue-500/20 transition-all duration-500 p-4 sm:p-6 space-y-4">
        {/* Premium Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg sm:rounded-xl blur-sm opacity-60 pointer-events-none"></div>
              <div className="relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 shadow-lg">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900">Smart Filtering & Sorting</h3>
              <p className="text-xs text-gray-600">Refine your question search with precision</p>
            </div>
          </div>
        </div>

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

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 min-w-[140px] justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3 w-3" />
                  <span className="truncate">
                    {SORT_OPTIONS.find(option => option.value === sortBy)?.label || 'ID (Ascending)'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={sortBy === option.value}
                  onCheckedChange={() => setSortBy(option.value)}
                  className="flex items-center gap-2"
                >
                  {option.icon}
                  {option.label}
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
            <Button variant="outline" size="sm" onClick={resetFilters} className="h-8 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500/0 via-gray-500/5 to-gray-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
              <RotateCcw className="h-3 w-3 mr-1 relative z-10" />
              <span className="relative z-10">Reset</span>
            </Button>
          )}
          
          <Button 
            onClick={applyFilters} 
            disabled={loading}
            size="sm"
            className="group relative overflow-hidden h-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
            <span className="relative z-10 font-semibold">{loading ? 'Applying...' : 'Apply'}</span>
          </Button>
        </div>
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

