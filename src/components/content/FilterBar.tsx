'use client'

import { useState, useEffect } from 'react'
import { useFilterStore } from '@/stores/filterStore'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { X, Filter, Save, Download, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface Book {
  id: string
  name: string
  code?: string
}

interface Chapter {
  id: string
  book_id: string
  chapter_number: number
  name: string
}

export function FilterBar() {
  const { 
    search,
    book_sources,
    chapters,
    tags,
    difficulty,
    sort_by,
    setBookSources,
    setChapters,
    setTags,
    setDifficulty,
    clearAllFilters,
    savePreset
  } = useFilterStore()
  const [books, setBooks] = useState<Book[]>([])
  const [availableChapters, setAvailableChapters] = useState<Chapter[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [showPresetDialog, setShowPresetDialog] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState({
    books: false,
    chapters: false,
    tags: false
  })

  const supabase = createClient()

  // Fetch books on mount
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(prev => ({ ...prev, books: true }))
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .order('name')
        
        if (!error) {
          setBooks(data || [])
        }
      } catch (error) {
        console.error('Error fetching books:', error)
      } finally {
        setLoading(prev => ({ ...prev, books: false }))
      }
    }
    fetchBooks()
  }, [supabase])

  // Fetch chapters when book changes
  useEffect(() => {
    if (book_sources.length > 0) {
      const fetchChapters = async () => {
        setLoading(prev => ({ ...prev, chapters: true }))
        try {
          const { data, error } = await supabase
            .from('chapters')
            .select('*')
            .eq('book_id', book_sources[0])
            .order('chapter_number')
          
          if (!error) {
            setAvailableChapters(data || [])
          }
        } catch (error) {
          console.error('Error fetching chapters:', error)
        } finally {
          setLoading(prev => ({ ...prev, chapters: false }))
        }
      }
      fetchChapters()
    } else {
      setAvailableChapters([])
    }
  }, [book_sources, supabase])

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(prev => ({ ...prev, tags: true }))
      try {
        const { data, error } = await supabase.rpc('get_unique_tags')
        if (!error) {
          setAvailableTags(data?.map((item: { tag: string }) => item.tag) || [])
        }
      } catch (error) {
        console.error('Error fetching tags:', error)
      } finally {
        setLoading(prev => ({ ...prev, tags: false }))
      }
    }
    fetchTags()
  }, [supabase])

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim())
      setPresetName('')
      setShowPresetDialog(false)
    }
  }

  const activeFiltersCount = (search ? 1 : 0) + 
    book_sources.length + 
    chapters.length + 
    tags.length + 
    (difficulty && difficulty !== 'all' ? 1 : 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filters
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeFiltersCount > 0 
                    ? `${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''} active`
                    : 'No filters applied'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearAllFilters()
                  }}
                >
                  Clear All
                </Button>
              )}
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-6">
            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Book Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Book</Label>
                <Select
                  value={book_sources[0] || ''}
                  onValueChange={(value) => {
                    setBookSources(value ? [value] : [])
                    setChapters([]) // Reset chapter when book changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select book" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Books</SelectItem>
                    {loading.books ? (
                      <SelectItem value="" disabled>Loading...</SelectItem>
                    ) : (
                      books.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Chapter Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Chapter</Label>
                <Select
                  value={chapters[0] || ''}
                  onValueChange={(value) => setChapters(value ? [value] : [])}
                  disabled={book_sources.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Chapters</SelectItem>
                    {loading.chapters ? (
                      <SelectItem value="" disabled>Loading...</SelectItem>
                    ) : (
                      availableChapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          Chapter {chapter.chapter_number}: {chapter.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Difficulty</Label>
                <Select
                  value={difficulty || ''}
                  onValueChange={(value) => setDifficulty(value || 'all')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[38px] bg-white dark:bg-gray-700">
                  {tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      {tag}
                      <X
                        className="w-3 h-3 ml-1"
                        onClick={() => {
                          setTags(tags.filter(t => t !== tag))
                        }}
                      />
                    </Badge>
                  ))}
                  <select
                    className="bg-transparent border-0 outline-none text-sm flex-1 min-w-[100px]"
                    onChange={(e) => {
                      if (e.target.value && !tags?.includes(e.target.value)) {
                        setTags([...(tags || []), e.target.value])
                      }
                      e.target.value = ''
                    }}
                  >
                    <option value="">Add tag...</option>
                    {loading.tags ? (
                      <option value="" disabled>Loading...</option>
                    ) : (
                      availableTags.filter(tag => !tags?.includes(tag)).map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>


            {/* Preset Management */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPresetDialog(true)}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save Preset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Export filters as JSON
                    const dataStr = JSON.stringify({
                      search,
                      book_sources,
                      chapters,
                      tags,
                      difficulty,
                      sort_by
                    }, null, 2)
                    const dataBlob = new Blob([dataStr], { type: 'application/json' })
                    const url = URL.createObjectURL(dataBlob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = 'content-filters.json'
                    link.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Preset Save Dialog */}
      {showPresetDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Filter Preset</h3>
            <Input
              placeholder="Enter preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPresetDialog(false)
                  setPresetName('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
