'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getQuestions } from '@/lib/actions/questions'

interface ChapterNameComboboxProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function ChapterNameCombobox({ 
  value, 
  onValueChange, 
  placeholder = "Select or type chapter name...",
  className 
}: ChapterNameComboboxProps) {
  const [open, setOpen] = useState(false)
  const [chapters, setChapters] = useState<string[]>([])
  const [inputValue, setInputValue] = useState(value)

  // Load unique chapter names on mount
  useEffect(() => {
    const loadChapters = async () => {
      try {
        // Get all questions to extract unique chapter names
        const result = await getQuestions(1, 1000) // Get a large number to get all chapters
        if (result.error) {
          console.error('Error loading chapters:', result.error)
        } else {
          // Extract unique chapter names
          const uniqueChapters = Array.from(
            new Set(
              result.data
                .map(q => q.chapter_name)
                .filter(Boolean)
                .sort()
            )
          )
          setChapters(uniqueChapters)
        }
      } catch (error) {
        console.error('Error loading chapters:', error)
      }
    }

    loadChapters()
  }, [])

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue)
    setInputValue(selectedValue)
    setOpen(false)
  }

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    onValueChange(newValue)
  }

  const filteredChapters = chapters.filter(chapter =>
    chapter.toLowerCase().includes(inputValue.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            className
          )}
        >
          {value ? (
            <span className="truncate">{value}</span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search or type chapter name..." 
            value={inputValue}
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-2">
                  {inputValue ? `No existing chapters found for &quot;${inputValue}&quot;` : 'No chapters found.'}
                </p>
                {inputValue && (
                  <p className="text-xs text-gray-400">
                    You can use &quot;{inputValue}&quot; as a new chapter name.
                  </p>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredChapters.map((chapter) => (
                <CommandItem
                  key={chapter}
                  value={chapter}
                  onSelect={() => handleSelect(chapter)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === chapter ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{chapter}</span>
                  </div>
                </CommandItem>
              ))}
              {inputValue && !filteredChapters.includes(inputValue) && (
                <CommandItem
                  onSelect={() => handleSelect(inputValue)}
                  className="text-blue-600 border-t border-gray-200 mt-2 pt-2"
                >
                  <span className="mr-2">+</span>
                  Create &quot;{inputValue}&quot;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
