'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Search,
  Check,
  X,
  Filter,
  ChevronDown,
  BookOpen,
  Target,
  Tag,
  Zap,
  ArrowUpDown,
  Database,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UniversalContentRenderer } from '@/components/editors/UniversalContentRenderer'
import { getFilterOptions, searchQuestions } from '@/lib/actions/tests'
import type { Question } from '@/lib/types'

interface OptimizedQuestionSelectionModalProps {
  open: boolean
  onClose: () => void
  onSelectMultiple: (questions: Question[]) => void
  title?: string
}

export function OptimizedQuestionSelectionModal({
  open,
  onClose,
  onSelectMultiple,
  title = "Select Questions for Test"
}: OptimizedQuestionSelectionModalProps) {
  // State management
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string | number>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('id_asc')
  const [page, setPage] = useState(1)
  const [questions, setQuestions] = useState<Question[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [filterOptions, setFilterOptions] = useState({
    bookSources: [] as string[],
    chapters: [] as string[],
    tags: [] as string[],
    difficulties: ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard']
  })

  const pageSize = 10
  const totalPages = Math.ceil(total / pageSize)

  // Load filter options
  useEffect(() => {
    if (open) {
      loadFilterOptions()
      fetchQuestions()
    } else {
      // Reset state when modal closes
      setSelectedQuestions(new Set())
      setPage(1)
    }
  }, [open])

  // Fetch questions when filters or page changes
  useEffect(() => {
    if (open) {
      fetchQuestions()
    }
  }, [page, sortBy, selectedBooks, selectedChapters, selectedTags, selectedDifficulty, searchQuery])

  const loadFilterOptions = async () => {
    try {
      const options = await getFilterOptions()
      setFilterOptions({
        bookSources: options.bookSources || [],
        chapters: options.chapters || [],
        tags: options.tags || [],
        difficulties: options.difficulties || ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard']
      })
    } catch (error) {
      console.error('Failed to load filter options:', error)
    }
  }

  const fetchQuestions = async () => {
    setIsLoading(true)
    try {
      const { questions: fetchedQuestions, total: totalCount } = await searchQuestions({
        search: searchQuery || undefined,
        book_sources: selectedBooks.length > 0 ? selectedBooks : undefined,
        chapters: selectedChapters.length > 0 ? selectedChapters : undefined,
        difficulty: selectedDifficulty as any || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        page,
        pageSize,
      })
      setQuestions(fetchedQuestions)
      setTotal(totalCount)
    } catch (error) {
      console.error('Error fetching questions:', error)
      setQuestions([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectQuestion = (q: Question) => {
    const key = (q.id ?? q.question_id) as string | number
    setSelectedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (questions.every(q => selectedQuestions.has((q.id ?? q.question_id) as string | number))) {
      // Deselect all on current page
      questions.forEach(q => {
        selectedQuestions.delete((q.id ?? q.question_id) as string | number)
      })
      setSelectedQuestions(new Set(selectedQuestions))
    } else {
      // Select all on current page
      questions.forEach(q => {
        selectedQuestions.add((q.id ?? q.question_id) as string | number)
      })
      setSelectedQuestions(new Set(selectedQuestions))
    }
  }

  const handleConfirmSelection = () => {
    const selectedQuestionsList = questions.filter(q => {
      const key = (q.id ?? q.question_id) as string | number
      return selectedQuestions.has(key)
    })
    onSelectMultiple(selectedQuestionsList)
    onClose()
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedBooks([])
    setSelectedChapters([])
    setSelectedTags([])
    setSelectedDifficulty('')
    setSortBy('id_asc')
    setPage(1)
  }

  const activeFiltersCount = [
    searchQuery,
    selectedBooks.length,
    selectedChapters.length,
    selectedTags.length,
    selectedDifficulty,
    sortBy !== 'id_asc'
  ].filter(Boolean).length

  // Compact MultiSelect Component
  const CompactMultiSelect = ({
    options,
    selected,
    onSelectionChange,
    placeholder,
    icon: Icon
  }: {
    options: string[]
    selected: string[]
    onSelectionChange: (values: string[]) => void
    placeholder: string
    icon: React.ComponentType<{ className?: string }>
  }) => {
    const [open, setOpen] = useState(false)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-9 justify-between text-xs font-medium px-2 hover:bg-gray-50 w-full"
          >
            <div className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-gray-500" />
              <span className="truncate">
                {selected.length > 0 ? `${selected.length} selected` : placeholder}
              </span>
            </div>
            <ChevronDown className="ml-1 h-3.5 w-3.5 text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} className="h-8 text-xs" />
            <CommandList>
              <CommandEmpty className="py-2 text-center text-xs">No results found</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      const newSelection = selected.includes(option)
                        ? selected.filter(item => item !== option)
                        : [...selected, option]
                      onSelectionChange(newSelection)
                    }}
                    className="text-xs"
                  >
                    <div className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      selected.includes(option)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-gray-300"
                    )}>
                      <Check className={cn("h-3 w-3", selected.includes(option) ? "opacity-100" : "opacity-0")} />
                    </div>
                    <span className="truncate">{option}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0 gap-0"
        showCloseButton={false}
      >
        {/* Compact Header */}
        <DialogHeader className="px-4 py-3 border-b bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <DialogTitle className="text-lg font-semibold">
                {title}
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({selectedQuestions.size} selected)
                </span>
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Single-Line Filter Bar - Compact */}
        {showFilters && (
          <div className="px-4 py-2 border-b bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Search Bar - 60% width */}
              <div className="relative flex-1 max-w-[60%]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions, books, chapters, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              {/* Filter Dropdowns - Compact */}
              <div className="flex items-center gap-2 flex-1">
                <div className="w-32">
                  <CompactMultiSelect
                    options={filterOptions.bookSources}
                    selected={selectedBooks}
                    onSelectionChange={setSelectedBooks}
                    placeholder="Books"
                    icon={BookOpen}
                  />
                </div>
                <div className="w-32">
                  <CompactMultiSelect
                    options={filterOptions.chapters}
                    selected={selectedChapters}
                    onSelectionChange={setSelectedChapters}
                    placeholder="Chapters"
                    icon={Target}
                  />
                </div>
                <div className="w-32">
                  <CompactMultiSelect
                    options={filterOptions.tags}
                    selected={selectedTags}
                    onSelectionChange={setSelectedTags}
                    placeholder="Tags"
                    icon={Tag}
                  />
                </div>
                <div className="w-32">
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger className="h-9 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-gray-500" />
                        <SelectValue placeholder="Difficulty" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      {filterOptions.difficulties.map(diff => (
                        <SelectItem key={diff} value={diff} className="text-xs">{diff}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sort Dropdown - Right aligned */}
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-[140px] text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id_asc" className="text-xs">ID (Ascending)</SelectItem>
                    <SelectItem value="id_desc" className="text-xs">ID (Descending)</SelectItem>
                    <SelectItem value="created_at_desc" className="text-xs">Newest First</SelectItem>
                    <SelectItem value="difficulty_asc" className="text-xs">Easy → Hard</SelectItem>
                  </SelectContent>
                </Select>
                
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-9 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Reset
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-9 px-2 text-xs"
                >
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  {showFilters ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Question List - Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Results Header */}
          <div className="sticky top-0 bg-white border-b px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {total} questions available
              </span>
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="h-3 w-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  Loading...
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 px-3 text-xs font-medium"
            >
              {questions.every(q => selectedQuestions.has((q.id ?? q.question_id) as string | number))
                ? 'Deselect Page'
                : 'Select Page'}
            </Button>
          </div>

          {/* Questions */}
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Database className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-sm text-gray-600">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y">
              {questions.map((q) => {
                const key = (q.id ?? q.question_id) as string | number
                const isSelected = selectedQuestions.has(key)
                
                return (
                  <div
                    key={key}
                    className={cn(
                      "px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer",
                      isSelected && "bg-blue-50 hover:bg-blue-100"
                    )}
                    onClick={() => handleSelectQuestion(q)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectQuestion(q)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">#{q.question_id || q.id}</span>
                          <Badge variant="outline" className="text-xs">{q.chapter_name}</Badge>
                          {q.difficulty && (
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs",
                                q.difficulty === 'Easy' && "bg-green-100 text-green-700",
                                q.difficulty === 'Moderate' && "bg-yellow-100 text-yellow-700",
                                q.difficulty === 'Hard' && "bg-red-100 text-red-700"
                              )}
                            >
                              {q.difficulty}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-700 line-clamp-2">
                          <UniversalContentRenderer text={q.question_text} />
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>{q.book_source}</span>
                          {q.admin_tags && q.admin_tags.length > 0 && (
                            <span>Tags: {q.admin_tags.slice(0, 3).join(', ')}{q.admin_tags.length > 3 && '...'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer - Compact */}
        <div className="border-t bg-gray-50 px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Pagination */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="h-7 px-1.5"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-gray-600 min-w-[80px] text-center">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="h-7 px-1.5"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">
                {selectedQuestions.size} question{selectedQuestions.size !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="outline"
                onClick={onClose}
                className="h-8 px-3 text-sm"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSelection}
                disabled={selectedQuestions.size === 0}
                className="h-8 px-3 text-sm bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Select Questions
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}