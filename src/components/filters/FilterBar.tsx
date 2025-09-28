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
  Bookmark,
  BookOpen,
  Target,
  Tag,
  Sparkles,
  Zap,
  TrendingUp,
  ArrowUpDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterOptions {
  books: string[]
  chapters: string[]
  tags: string[]
  difficulties: string[]
  exams: string[]
}

export function FilterBar({ compact = false }: { compact?: boolean } = {}) {
  const {
    search,
    book_sources,
    chapters,
    tags,
    difficulty,
    exams,
    sort_by,
    setSearch,
    setBookSources,
    setChapters,
    setTags,
    setDifficulty,
    setExams,
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
    difficulties: ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard'],
    exams: []
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
          difficulties: options.difficulties || ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard'],
          exams: options.exams || []
        })
      } catch (error) {
        console.error('Failed to load filter options:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOptions()
  }, [])

  // Multi-select component (shared visuals)
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
            className={cn("group w-full justify-between bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200/50 transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-300", compact ? "h-9 px-4" : "h-12 px-6")}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200 flex-shrink-0" />
              {selected.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600 truncate">
                    {selected.length} selected
                  </span>
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
                </div>
              ) : (
                <span className="text-gray-500 font-medium truncate">{placeholder}</span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-all duration-200 group-hover:rotate-180" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl overflow-hidden">
          <Command className="rounded-2xl">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <CommandInput 
                  placeholder={`Search ${placeholder.toLowerCase()}...`} 
                  className="h-10 bg-gray-50/50 border border-gray-200/50 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-300/50 transition-all duration-200 pl-9 pr-3" 
                />
              </div>
            </div>
            <CommandList className="max-h-64">
              <CommandEmpty className="py-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <Icon className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No {placeholder.toLowerCase()} found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
              </CommandEmpty>
              <CommandGroup className="p-2">
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                    className={cn(
                      "group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 font-medium",
                      selected.includes(option) 
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 border border-blue-200/50 shadow-sm" 
                        : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-5 h-5 rounded-lg border-2 transition-all duration-200",
                      selected.includes(option)
                        ? "border-blue-400 bg-blue-400 shadow-sm"
                        : "border-gray-300 group-hover:border-blue-300"
                    )}>
                      <Check
                        className={cn(
                          "h-3 w-3 text-white transition-all duration-200",
                          selected.includes(option) ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        )}
                      />
                    </div>
                    <span className="flex-1 text-sm">{option}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }

  // Single-select with shared visual style (for Difficulty)
  const SingleSelect = ({
    options,
    value,
    onChange,
    placeholder,
    icon: Icon
  }: {
    options: string[]
    value: string
    onChange: (value: string) => void
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
            className={cn("group w-full justify-between bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-200/50 transition-all duration-200 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300", compact ? "h-9 px-4" : "h-12 px-6")}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon className="h-4 w-4 text-gray-400 group-hover:text-emerald-500 transition-colors duration-200 flex-shrink-0" />
              <span className="text-gray-700 font-medium truncate">
                {value && value !== 'all' ? value : placeholder}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 text-gray-400 group-hover:text-emerald-500 transition-all duration-200 group-hover:rotate-180" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl overflow-hidden">
          <Command className="rounded-2xl">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <CommandInput 
                  placeholder={`Search ${placeholder.toLowerCase()}...`} 
                  className="h-10 bg-gray-50/50 border border-gray-200/50 rounded-xl text-sm font-medium focus:bg-white focus:border-emerald-300/50 transition-all duration-200 pl-9 pr-3" 
                />
              </div>
            </div>
            <CommandList className="max-h-64">
              <CommandGroup className="p-2">
                <CommandItem
                  key="all"
                  value="all"
                  onSelect={() => onChange('all')}
                  className="group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 font-medium hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-gray-300" />
                  <span className="flex-1 text-sm">All Difficulties</span>
                </CommandItem>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => onChange(option)}
                    className={cn(
                      "group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 font-medium",
                      value === option
                        ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-900 border border-emerald-200/50 shadow-sm"
                        : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-5 h-5 rounded-full border-2",
                      value === option ? "border-emerald-400 bg-emerald-400" : "border-gray-300 group-hover:border-emerald-300"
                    )}>
                      <Check className={cn("h-3 w-3 text-white", value === option ? "opacity-100" : "opacity-0")}/>
                    </div>
                    <span className="flex-1 text-sm">{option}</span>
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
    <div className={cn("relative", compact && "[&_h2]:text-lg [&_p]:text-[13px]") }>
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 rounded-3xl blur-3xl -z-10 scale-105" />
      
      <div
        className={cn(
          "bg-white/90 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl shadow-blue-500/5 hover:shadow-blue-500/10 transition-all duration-700",
          compact ? "px-3 md:px-4 py-1.5" : "px-6 md:px-8 py-6"
        )}
      >
        {/* Header Section - Completely hidden for compact design */}

        {/* Two-Tiered Responsive Layout for Compact Mode */}
        {compact ? (
          <div className="space-y-3">
            {/* Primary Control Bar - Fixed Layout */}
            <div className="flex items-center justify-between w-full">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md mr-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl blur-lg" />
                <div className="relative flex items-center bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 focus-within:shadow-md focus-within:border-blue-300/50">
                  <Search className="absolute left-3 h-4 w-4 text-gray-400 transition-colors duration-200" />
                  <Input
                    placeholder="Search questions, books, chapters, or tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-gray-400 font-medium rounded-xl py-2 text-sm"
                  />
                </div>
              </div>

              {/* Filter and Sort Controls */}
              <div className="flex items-center gap-3">
                <div className="min-w-[120px]">
                  <MultiSelect
                    options={filterOptions.books}
                    selected={book_sources}
                    onSelectionChange={setBookSources}
                    placeholder="Books"
                    icon={BookOpen}
                  />
                </div>
                <div className="min-w-[120px]">
                  <MultiSelect
                    options={filterOptions.chapters}
                    selected={chapters}
                    onSelectionChange={setChapters}
                    placeholder="Chapters"
                    icon={Target}
                  />
                </div>
                <div className="min-w-[120px]">
                  <MultiSelect
                    options={filterOptions.tags}
                    selected={tags}
                    onSelectionChange={setTags}
                    placeholder="Tags"
                    icon={Tag}
                  />
                </div>
                <div className="min-w-[140px]">
                  <SingleSelect 
                    options={filterOptions.difficulties}
                    value={difficulty}
                    onChange={setDifficulty}
                    placeholder="All Difficulties"
                    icon={Zap}
                  />
                </div>
                <div className="min-w-[150px]">
                  <Select value={sort_by} onValueChange={setSortBy}>
                    <SelectTrigger className="group w-full h-9 justify-between bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200/50 transition-all duration-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 px-4">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200 flex-shrink-0" />
                        <SelectValue className="font-medium text-xs" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl">
                      <SelectItem value="id_asc" className="font-medium text-sm">ID (Ascending)</SelectItem>
                      <SelectItem value="id_desc" className="font-medium text-sm">ID (Descending)</SelectItem>
                      <SelectItem value="created_at_asc" className="font-medium text-sm">Oldest First</SelectItem>
                      <SelectItem value="created_at_desc" className="font-medium text-sm">Newest First</SelectItem>
                      <SelectItem value="difficulty_asc" className="font-medium text-sm">Easy → Hard</SelectItem>
                      <SelectItem value="difficulty_desc" className="font-medium text-sm">Hard → Easy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Presets Button - Fixed Position */}
                <Popover open={showPresets} onOpenChange={setShowPresets}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 px-3 text-xs bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white hover:border-blue-200/50 hover:shadow-md transition-all duration-300 rounded-xl"
                    >
                      <Bookmark className="h-3.5 w-3.5 mr-1" />
                      Presets
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900">Filter Presets</h4>
                        <Button 
                          size="sm" 
                          onClick={handleSavePreset}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl h-8 px-3"
                        >
                          <Save className="h-3 w-3 mr-2" />
                          Save Current
                        </Button>
                      </div>
                      {presets.length > 0 ? (
                        <div className="space-y-2">
                          {presets.map((preset) => (
                            <div key={preset} className="group flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  loadPreset(preset)
                                  setShowPresets(false)
                                }}
                                className="justify-start flex-1 font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                              >
                                {preset}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deletePreset(preset)}
                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg h-8 w-8 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <Bookmark className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No presets saved yet</p>
                          <p className="text-gray-400 text-sm mt-1">Save your current filters to create a preset</p>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Secondary Dynamic Bar - Only when filters are active */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center justify-between w-full bg-gray-50/50 backdrop-blur-sm border border-gray-200/30 rounded-xl px-4 py-2">
                {/* Active Filters Title and Badges */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">Active Filters</span>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                      {activeFiltersCount} applied
                    </span>
                  </div>
                  
                  {/* Filter Badges - Responsive wrapping */}
                  <div className="flex flex-wrap gap-2 flex-1">
                    {search && (
                      <div className="group inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200">
                        <Search className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
                        <span className="text-xs font-medium text-blue-800">"{search}"</span>
                        <button
                          className="ml-2 p-0.5 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSearch('')
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {book_sources.map((book) => (
                      <div key={book} className="group inline-flex items-center bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 rounded-xl px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200">
                        <BookOpen className="h-3.5 w-3.5 text-orange-600 mr-1.5" />
                        <span className="text-xs font-medium text-orange-800">{book}</span>
                        <button
                          className="ml-2 p-0.5 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            setBookSources(book_sources.filter(b => b !== book))
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {chapters.map((chapter) => (
                      <div key={chapter} className="group inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200">
                        <Target className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
                        <span className="text-xs font-medium text-blue-800">{chapter}</span>
                        <button
                          className="ml-2 p-0.5 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            setChapters(chapters.filter(c => c !== chapter))
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {tags.map((tag) => (
                      <div key={tag} className="group inline-flex items-center bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200">
                        <Tag className="h-3.5 w-3.5 text-purple-600 mr-1.5" />
                        <span className="text-xs font-medium text-purple-800">{tag}</span>
                        <button
                          className="ml-2 p-0.5 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            setTags(tags.filter(t => t !== tag))
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {difficulty && difficulty !== 'all' && (
                      <div className="group inline-flex items-center bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 rounded-xl px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200">
                        <Zap className="h-3.5 w-3.5 text-emerald-600 mr-1.5" />
                        <span className="text-xs font-medium text-emerald-800">{difficulty}</span>
                        <button
                          className="ml-2 p-0.5 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDifficulty('all')
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {sort_by !== 'id_asc' && (
                      <div className="group inline-flex items-center bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200/50 rounded-xl px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200">
                        <ArrowUpDown className="h-3.5 w-3.5 text-gray-600 mr-1.5" />
                        <span className="text-xs font-medium text-gray-800">{sort_by.replace('_', ' ')}</span>
                        <button
                          className="ml-2 p-0.5 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSortBy('id_asc')
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reset Button - Fixed Position on Right */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200/50 hover:border-red-300/50 transition-all duration-200 rounded-xl ml-4 flex-shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset All
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Search Section */}
            <div className="mb-6">
              <div className="relative max-w-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl" />
                <div className="relative flex items-center bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 focus-within:shadow-xl focus-within:border-blue-300/50">
                  <Search className="absolute left-6 h-5 w-5 text-gray-400 transition-colors duration-200" />
                  <Input
                    placeholder="Search questions, books, chapters, or tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-14 pr-6 bg-transparent border-0 focus:ring-0 focus:outline-none placeholder:text-gray-400 font-medium rounded-2xl py-4 text-base"
                  />
                </div>
              </div>
            </div>

            {/* Filter Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-6">
          {/* Books Filter */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-red-100/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className={cn("relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-orange-200/50",
              compact ? "p-1 min-h-[48px]" : "p-4 min-h-[120px]"
            )}>
              <div className={cn("flex items-center space-x-2", compact ? "mb-0.5" : "mb-4") }>
                <div className={cn("bg-gradient-to-br from-orange-100 to-red-100 rounded-xl", compact ? "p-2" : "p-2.5") }>
                  <BookOpen className={cn("text-orange-600", compact ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                <div>
                  <h3 className={cn("font-semibold text-gray-900", compact ? "text-sm" : undefined)}>Books</h3>
                  <p className={cn("text-gray-500", compact ? "text-[11px]" : "text-xs")}>Source materials</p>
                </div>
              </div>
              <MultiSelect
                options={filterOptions.books}
                selected={book_sources}
                onSelectionChange={setBookSources}
                placeholder="Select books"
                icon={BookOpen}
              />
            </div>
          </div>

          {/* Chapters Filter */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className={cn("relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-blue-200/50",
              compact ? "p-1 min-h-[48px]" : "p-4 min-h-[120px]"
            )}>
              <div className={cn("flex items-center space-x-2", compact ? "mb-0.5" : "mb-4") }>
                <div className={cn("bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl", compact ? "p-2" : "p-2.5") }>
                  <Target className={cn("text-blue-600", compact ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                <div>
                  <h3 className={cn("font-semibold text-gray-900", compact ? "text-sm" : undefined)}>Chapters</h3>
                  <p className={cn("text-gray-500", compact ? "text-[11px]" : "text-xs")}>Topic sections</p>
                </div>
              </div>
              <MultiSelect
                options={filterOptions.chapters}
                selected={chapters}
                onSelectionChange={setChapters}
                placeholder="Select chapters"
                icon={Target}
              />
            </div>
          </div>

          {/* Tags Filter */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className={cn("relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-purple-200/50",
              compact ? "p-1 min-h-[48px]" : "p-4 min-h-[120px]"
            )}>
              <div className={cn("flex items-center space-x-2", compact ? "mb-0.5" : "mb-4") }>
                <div className={cn("bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl", compact ? "p-2" : "p-2.5") }>
                  <Tag className={cn("text-purple-600", compact ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                <div>
                  <h3 className={cn("font-semibold text-gray-900", compact ? "text-sm" : undefined)}>Tags</h3>
                  <p className={cn("text-gray-500", compact ? "text-[11px]" : "text-xs")}>Content labels</p>
                </div>
              </div>
              <MultiSelect
                options={filterOptions.tags}
                selected={tags}
                onSelectionChange={setTags}
                placeholder="Select tags"
                icon={Tag}
              />
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-green-100/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className={cn("relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-emerald-200/50",
              compact ? "p-1 min-h-[48px]" : "p-4 min-h-[120px]"
            )}>
              <div className={cn("flex items-center space-x-2", compact ? "mb-0.5" : "mb-4") }>
                <div className={cn("bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl", compact ? "p-2" : "p-2.5") }>
                  <Zap className={cn("text-emerald-600", compact ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                <div>
                  <h3 className={cn("font-semibold text-gray-900", compact ? "text-sm" : undefined)}>Difficulty</h3>
                  <p className={cn("text-gray-500", compact ? "text-[11px]" : "text-xs")}>Challenge level</p>
                </div>
              </div>
              <SingleSelect 
                options={filterOptions.difficulties}
                value={difficulty}
                onChange={setDifficulty}
                placeholder="All Difficulties"
                icon={TrendingUp}
              />
            </div>
          </div>

          </div>
          </>
        )}

        {/* Sorting Section - Integrated with Filters in compact mode */}
        {!compact && (
        <div className={cn("border-t border-gray-100", "pt-8 mb-8") }>
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
              <ArrowUpDown className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Result Ordering</h3>
              <p className="text-sm text-gray-500">Choose how to sort the results</p>
            </div>
          </div>
          
          <div className="w-fit">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-indigo-200/50">
                <Select value={sort_by} onValueChange={setSortBy}>
                  <SelectTrigger className={cn("group w-[180px] justify-between bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200/50 transition-all duration-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300",
                    compact ? "h-9" : "h-12"
                  )}>
                    <div className="flex items-center gap-3">
                      <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" />
                      <SelectValue className="font-medium truncate" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl">
                    <SelectItem value="id_asc" className="font-medium">ID (Ascending)</SelectItem>
                    <SelectItem value="id_desc" className="font-medium">ID (Descending)</SelectItem>
                    <SelectItem value="created_at_asc" className="font-medium">Oldest First</SelectItem>
                    <SelectItem value="created_at_desc" className="font-medium">Newest First</SelectItem>
                    <SelectItem value="difficulty_asc" className="font-medium">Easy → Hard</SelectItem>
                    <SelectItem value="difficulty_desc" className="font-medium">Hard → Easy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Active Filters Display - Only shown in non-compact mode */}
        {!compact && activeFiltersCount > 0 && (
          <div className="border-t border-gray-100 pt-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <Filter className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Active Filters</h3>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                {activeFiltersCount} applied
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {search && (
                <div className="group inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
                  <Search className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Search: "{search}"</span>
                  <button
                    className="ml-3 p-1 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSearch('')
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {book_sources.map((book) => (
                <div key={book} className="group inline-flex items-center bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
                  <BookOpen className="h-4 w-4 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-800">Book: {book}</span>
                  <button
                    className="ml-3 p-1 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      setBookSources(book_sources.filter(b => b !== book))
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {chapters.map((chapter) => (
                <div key={chapter} className="group inline-flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
                  <Target className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-800">Chapter: {chapter}</span>
                  <button
                    className="ml-3 p-1 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      setChapters(chapters.filter(c => c !== chapter))
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {tags.map((tag) => (
                <div key={tag} className="group inline-flex items-center bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
                  <Tag className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-800">Tag: {tag}</span>
                  <button
                    className="ml-3 p-1 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      setTags(tags.filter(t => t !== tag))
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {difficulty && difficulty !== 'all' && (
                <div className="group inline-flex items-center bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
                  <Zap className="h-4 w-4 text-emerald-600 mr-2" />
                  <span className="text-sm font-medium text-emerald-800">Difficulty: {difficulty}</span>
                  <button
                    className="ml-3 p-1 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDifficulty('all')
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {sort_by !== 'id_asc' && (
                <div className="group inline-flex items-center bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200/50 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
                  <Filter className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-800">Sort: {sort_by.replace('_', ' ')}</span>
                  <button
                    className="ml-3 p-1 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSortBy('id_asc')
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
