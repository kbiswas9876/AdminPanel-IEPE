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
            className="w-full justify-between min-w-[200px]"
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
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Popover open={showPresets} onOpenChange={setShowPresets}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Presets
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
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filter Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Books</label>
          <MultiSelect
            options={filterOptions.books}
            selected={book_sources}
            onSelectionChange={setBookSources}
            placeholder="Select books"
            icon={Filter}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Chapters</label>
          <MultiSelect
            options={filterOptions.chapters}
            selected={chapters}
            onSelectionChange={setChapters}
            placeholder="Select chapters"
            icon={Filter}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <MultiSelect
            options={filterOptions.tags}
            selected={tags}
            onSelectionChange={setTags}
            placeholder="Select tags"
            icon={Filter}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Difficulty</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {filterOptions.difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Sort By</label>
        <Select value={sort_by} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id_asc">ID (Ascending)</SelectItem>
            <SelectItem value="id_desc">ID (Descending)</SelectItem>
            <SelectItem value="created_at_asc">Created (Oldest)</SelectItem>
            <SelectItem value="created_at_desc">Created (Newest)</SelectItem>
            <SelectItem value="difficulty_asc">Difficulty (Easy to Hard)</SelectItem>
            <SelectItem value="difficulty_desc">Difficulty (Hard to Easy)</SelectItem>
          </SelectContent>
        </Select>
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
