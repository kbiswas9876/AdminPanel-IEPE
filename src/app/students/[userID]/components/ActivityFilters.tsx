'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Search, Filter, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivityType } from '@/lib/types/analytics'
import type { ComponentType } from 'react'

interface FilterOption {
  value: ActivityType | 'all'
  label: string
  count: number | null
}

interface ActivityFiltersProps {
  onFilterChange: (filter: ActivityType | 'all') => void
  onSearchChange: (searchTerm: string) => void
}

const filterOptions: FilterOption[] = [
  { value: 'all', label: 'All Activities', count: null },
  { value: 'PRACTICE_SESSION_COMPLETED', label: 'Practice Sessions', count: null },
  { value: 'MOCK_TEST_COMPLETED', label: 'Mock Tests', count: null },
  { value: 'QUESTION_BOOKMARKED', label: 'Bookmarks', count: null },
  { value: 'REVIEW_SESSION_COMPLETED', label: 'Reviews', count: null },
]

export function ActivityFilters({ onFilterChange, onSearchChange }: ActivityFiltersProps) {
  const [selectedFilter, setSelectedFilter] = useState<ActivityType | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, onSearchChange])

  const handleFilterSelect = (value: ActivityType | 'all') => {
    setSelectedFilter(value)
    onFilterChange(value)
    setOpen(false)
  }

  const selectedLabel = filterOptions.find(opt => opt.value === selectedFilter)?.label || 'All Activities'

  return (
    <motion.div 
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:max-w-md">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        <Input
          placeholder="Search activities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 sm:pl-11 h-10 sm:h-11 bg-gray-50 border-gray-300 focus:bg-white focus:border-blue-500 transition-all duration-300 rounded-lg sm:rounded-xl text-sm sm:text-base"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-full hover:bg-gray-200 transition-all"
            onClick={() => setSearchTerm('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 h-10 sm:h-11 px-3 sm:px-4 w-full sm:w-auto bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:border-blue-300 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 rounded-lg sm:rounded-xl"
          >
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span className="font-medium text-sm sm:text-base truncate">{selectedLabel}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0 shadow-xl border-gray-200" align="end">
          <Command>
            <CommandInput placeholder="Search filters..." className="h-12" />
            <CommandList>
              <CommandEmpty className="py-6 text-center text-gray-500">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                No filters found.
              </CommandEmpty>
              <CommandGroup>
                {filterOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleFilterSelect(option.value)}
                    className={cn(
                      "cursor-pointer rounded-lg mx-2 my-1",
                      selectedFilter === option.value && "bg-blue-100 text-blue-700 font-medium"
                    )}
                  >
                    <span className="flex-1">{option.label}</span>
                    {option.count !== null && (
                      <Badge variant="secondary" className="ml-auto bg-gray-100 text-gray-700">
                        {option.count}
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badge */}
      <AnimatePresence>
        {selectedFilter !== 'all' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 self-start"
          >
            <Badge 
              variant="default" 
              className="gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 px-3 py-1.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
            >
              <span className="truncate max-w-[150px] sm:max-w-none">{selectedLabel}</span>
              <button
                onClick={() => {
                  setSelectedFilter('all')
                  onFilterChange('all')
                }}
                className="ml-1 hover:bg-white/30 rounded-full p-0.5 transition-all flex-shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

