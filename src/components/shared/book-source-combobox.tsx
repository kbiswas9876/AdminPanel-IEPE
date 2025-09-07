'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getBookSources, createBookSource } from '@/lib/actions/book-sources'
import { toast } from 'sonner'
import type { BookSource } from '@/lib/actions/book-sources'

interface BookSourceComboboxProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function BookSourceCombobox({ 
  value, 
  onValueChange, 
  placeholder = "Select book source...",
  className 
}: BookSourceComboboxProps) {
  const [open, setOpen] = useState(false)
  const [bookSources, setBookSources] = useState<BookSource[]>([])
  const [addBookOpen, setAddBookOpen] = useState(false)
  const [newBookName, setNewBookName] = useState('')
  const [newBookCode, setNewBookCode] = useState('')
  const [creating, setCreating] = useState(false)

  // Load book sources on mount
  useEffect(() => {
    const loadBookSources = async () => {
      try {
        const result = await getBookSources()
        if (result.error) {
          toast.error(result.error)
        } else {
          setBookSources(result.data)
        }
      } catch (error) {
        console.error('Error loading book sources:', error)
        toast.error('Failed to load book sources')
      }
    }

    loadBookSources()
  }, [])

  const handleCreateBook = async () => {
    if (!newBookName.trim() || !newBookCode.trim()) {
      toast.error('Please enter both book name and code')
      return
    }

    setCreating(true)
    try {
      const result = await createBookSource(newBookName.trim(), newBookCode.trim())
      
      if (result.success && result.data) {
        toast.success(result.message)
        setBookSources(prev => [...prev, result.data!])
        onValueChange(newBookName.trim())
        setAddBookOpen(false)
        setNewBookName('')
        setNewBookCode('')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error creating book source:', error)
      toast.error('Failed to create book source')
    } finally {
      setCreating(false)
    }
  }

  const selectedBook = bookSources.find(book => book.name === value)

  return (
    <>
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
            {selectedBook ? (
              <span className="flex items-center gap-2">
                <span className="font-medium">{selectedBook.name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {selectedBook.code}
                </span>
              </span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search book sources..." />
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-2">No book sources found.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddBookOpen(true)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Book
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {bookSources.map((book) => (
                  <CommandItem
                    key={book.id}
                    value={book.name}
                    onSelect={(currentValue) => {
                      onValueChange(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === book.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="font-medium">{book.name}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {book.code}
                      </span>
                    </div>
                  </CommandItem>
                ))}
                <CommandItem
                  onSelect={() => setAddBookOpen(true)}
                  className="text-blue-600 border-t border-gray-200 mt-2 pt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Book
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Add New Book Dialog */}
      <Dialog open={addBookOpen} onOpenChange={setAddBookOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Book Source</DialogTitle>
            <DialogDescription>
              Create a new book source that can be used when creating questions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="book-name" className="text-right">
                Book Name
              </Label>
              <Input
                id="book-name"
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                placeholder="e.g., NCERT Class 10"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="book-code" className="text-right">
                Book Code
              </Label>
              <Input
                id="book-code"
                value={newBookCode}
                onChange={(e) => setNewBookCode(e.target.value)}
                placeholder="e.g., NCERT10"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddBookOpen(false)
                setNewBookName('')
                setNewBookCode('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBook}
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {creating ? 'Creating...' : 'Create Book'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
