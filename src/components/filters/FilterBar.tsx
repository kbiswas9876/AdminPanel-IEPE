'use client'

import React, { useState, useEffect } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { getFilterOptions } from '@/lib/actions/tests'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command'
import { 
  Check, 
  ChevronDown, 
  X, 
  Search, 
  Filter, 
  RotateCcw,
  Save,
  Bookmark
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterOptions {
  books: string[]
  chapters: string[]
  tags: string[]
  difficulties: string[]
}

export function FilterBar() {
  const {
    search,
    book_sources,
    chapters,
    tags,
    difficulty,
    sort_by,
    setSearch,
    setBookSources,
    setChapters,
    setTags,
    setDifficulty,
    setSortBy,
    clearAllFilters,
    savePreset,
    loadPreset,
    deletePreset,
    getPresets
  } = useFilterStore()

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    books: [],
    chapters: [],
    tags: [],
    difficulties: ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard']
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showPresets, setShowPresets] = useState(false)

  // Load filter options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const options = await getFilterOptions()
        setFilterOptions({
          books: options.bookSources || [],
          chapters: options.chapters || [],
          tags: options.tags || [],
          difficulties: ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard']
        })
      } catch (error) {
        console.error('Failed to load filter options:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOptions()
  }, [])

  // Multi-select component
  const MultiSelect = ({ 
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

    const handleSelect = (value: string) => {
      const newSelection = selected.includes(value)
        ? selected.filter(item => item !== value)
        : [...selected, value]
      onSelectionChange(newSelection)
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-9 min-w-[120px]"
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {selected.length > 0 ? (
                <span className="truncate">
                  {selected.length} selected
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  // Count active filters
  const activeFiltersCount = [
    search,
    book_sources.length,
    chapters.length,
    tags.length,
    difficulty && difficulty !== 'all',
    sort_by !== 'id_asc'
  ].filter(Boolean).length

  // Handle preset operations
  const handleSavePreset = () => {
    const name = prompt('Enter preset name:')
    if (name) {
      savePreset(name)
    }
  }

  const presets = getPresets()

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">Loading filters...</span>
      </div>
    )
  }

  return (
    <div className="p-2 border-b bg-gray-50/50">
      {/* Ultra-Compact Single Row Layout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* Books */}
        <div className="w-32">
          <MultiSelect
            options={filterOptions.books}
            selected={book_sources}
            onSelectionChange={setBookSources}
            placeholder="Books"
            icon={Filter}
          />
        </div>

        {/* Chapters */}
        <div className="w-32">
          <MultiSelect
            options={filterOptions.chapters}
            selected={chapters}
            onSelectionChange={setChapters}
            placeholder="Chapters"
            icon={Filter}
          />
        </div>

        {/* Tags */}
        <div className="w-32">
          <MultiSelect
            options={filterOptions.tags}
            selected={tags}
            onSelectionChange={setTags}
            placeholder="Tags"
            icon={Filter}
          />
        </div>

        {/* Difficulty & Sort */}
        <div className="flex gap-2">
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="h-8 w-24">
              <SelectValue placeholder="Diff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {filterOptions.difficulties.map((diff) => (
                <SelectItem key={diff} value={diff}>
                  {diff}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sort_by} onValueChange={setSortBy}>
            <SelectTrigger className="h-8 w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id_asc">ID ↑</SelectItem>
              <SelectItem value="id_desc">ID ↓</SelectItem>
              <SelectItem value="created_at_asc">Oldest</SelectItem>
              <SelectItem value="created_at_desc">Newest</SelectItem>
              <SelectItem value="difficulty_asc">Easy→Hard</SelectItem>
              <SelectItem value="difficulty_desc">Hard→Easy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Popover open={showPresets} onOpenChange={setShowPresets}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Bookmark className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filter Presets</h4>
                  <Button size="sm" onClick={handleSavePreset}>
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
                {presets.length > 0 ? (
                  <div className="space-y-1">
                    {presets.map((preset) => (
                      <div key={preset} className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            loadPreset(preset)
                            setShowPresets(false)
                          }}
                          className="justify-start"
                        >
                          {preset}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePreset(preset)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No presets saved</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Active Filters</label>
          <div className="flex flex-wrap gap-2">
            {search && (
              <Badge variant="secondary" className="gap-1 pr-1">
                Search: {search}
                <button
                  className="ml-1 p-0.5 rounded-sm hover:bg-destructive/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSearch('')
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {book_sources.map((book) => (
              <Badge key={book} variant="secondary" className="gap-1 pr-1">
                Book: {book}
                <button
                  className="ml-1 p-0.5 rounded-sm hover:bg-destructive/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setBookSources(book_sources.filter(b => b !== book))
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {chapters.map((chapter) => (
              <Badge key={chapter} variant="secondary" className="gap-1 pr-1">
                Chapter: {chapter}
                <button
                  className="ml-1 p-0.5 rounded-sm hover:bg-destructive/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setChapters(chapters.filter(c => c !== chapter))
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                Tag: {tag}
                <button
                  className="ml-1 p-0.5 rounded-sm hover:bg-destructive/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setTags(tags.filter(t => t !== tag))
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {difficulty && difficulty !== 'all' && (
              <Badge variant="secondary" className="gap-1 pr-1">
                Difficulty: {difficulty}
                <button
                  className="ml-1 p-0.5 rounded-sm hover:bg-destructive/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDifficulty('all')
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {sort_by !== 'id_asc' && (
              <Badge variant="secondary" className="gap-1 pr-1">
                Sort: {sort_by.replace('_', ' ')}
                <button
                  className="ml-1 p-0.5 rounded-sm hover:bg-destructive/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSortBy('id_asc')
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
