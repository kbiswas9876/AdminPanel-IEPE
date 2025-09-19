'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { Textarea } from '@/components/ui/textarea'
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
  X, 
  Save, 
  XCircle,
  Tag,
  ArrowLeft
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
// getAllBookSourcesWithCodes is now available in uniform-id-generator
import { getFilterOptions } from '@/lib/actions/tests'
import { createBookSource } from '@/lib/actions/book-sources'
import { createChapter } from '@/lib/actions/chapters'
import { generateUniqueQuestionId, generateUniqueBookCode } from '@/lib/utils/uniform-id-generator'
import { getBookCodeByName, getAllBookSourcesWithCodes } from '@/lib/actions/id-generation'
import { createQuestion } from '@/lib/actions/questions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ClientOnlyAdvancedTipTapEditor } from '@/components/editors/ClientOnlyAdvancedTipTapEditor'

interface FilterOptions {
  bookSources: string[]
  chapters: string[]
  tags: string[]
  difficulties: string[]
}

export function NewQuestionForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    question_id: '',
    book_source: '',
    chapter_name: '',
    question_number_in_book: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: '',
    solution_text: '',
    exam_metadata: '',
    admin_tags: [] as string[],
    difficulty: ''
  })

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    bookSources: [],
    chapters: [],
    tags: [],
    difficulties: ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard']
  })

  const [isLoading, setIsLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false)
  const [showNewBookInput, setShowNewBookInput] = useState(false)
  const [newBookName, setNewBookName] = useState('')
  const [showNewChapterInput, setShowNewChapterInput] = useState(false)
  const [newChapterName, setNewChapterName] = useState('')
  const [isCreatingBook, setIsCreatingBook] = useState(false)
  const [isCreatingChapter, setIsCreatingChapter] = useState(false)

  // Load filter options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Get all books from Books manager
        const booksWithCodes = await getAllBookSourcesWithCodes()
        const bookNames = booksWithCodes.map(book => book.name)
        
        // Get all chapters from all books
        const options = await getFilterOptions()
        
        setFilterOptions({
          bookSources: bookNames,
          chapters: options.chapters,
          tags: options.tags,
          difficulties: options.difficulties
        })
      } catch (error) {
        console.error('Failed to load filter options:', error)
      }
    }
    loadOptions()
  }, [])

  // Auto-generate question ID when relevant fields change
  useEffect(() => {
    const generateId = async () => {
      if (formData.book_source && formData.chapter_name && formData.question_number_in_book) {
        try {
          // Get the actual book code from the database
          const bookCode = await getBookCodeByName(formData.book_source)
          
          if (!bookCode) {
            // Fallback: generate a simple book code if not found in database
            const fallbackBookCode = formData.book_source
              .replace(/[^\w\s]/g, '')
              .replace(/\b(and|the|of|in|on|at|to|for|with|by|class|grade)\b/gi, '')
              .trim()
              .split(/\s+/)
              .filter(word => word.length > 0)
              .slice(0, 2)
              .map(word => word.substring(0, 4))
              .join('')
              .toUpperCase()
              .substring(0, 8) || 'BOOK'

            const generatedId = await generateUniqueQuestionId(
              fallbackBookCode,
              formData.chapter_name,
              parseInt(formData.question_number_in_book.toString())
            )
            setFormData(prev => ({
              ...prev,
              question_id: generatedId
            }))
            return
          }

          const generatedId = await generateUniqueQuestionId(
            bookCode,
            formData.chapter_name,
            parseInt(formData.question_number_in_book.toString())
          )
          setFormData(prev => ({
            ...prev,
            question_id: generatedId
          }))
        } catch (error) {
          console.error('Error generating question ID:', error)
          // Fallback to a simple ID
          const fallbackId = `${formData.book_source.substring(0, 4).toUpperCase()}_${formData.chapter_name.substring(0, 4).toUpperCase()}_${String(formData.question_number_in_book).padStart(3, '0')}`
          setFormData(prev => ({
            ...prev,
            question_id: fallbackId
          }))
        }
      } else {
        // Show preview when some fields are filled
        let previewId = ''
        if (formData.book_source || formData.chapter_name || formData.question_number_in_book) {
          // Generate book code preview
          let bookPart = 'BOOK'
          if (formData.book_source) {
            const words = formData.book_source.replace(/[^\w\s]/g, '').replace(/\b(and|the|of|in|on|at|to|for|with|by|class|grade)\b/gi, '').trim().split(/\s+/).filter(word => word.length > 0)
            if (words.length === 1) {
              bookPart = words[0].substring(0, 6).toUpperCase()
            } else if (words.length === 2) {
              const first = words[0].substring(0, 3)
              const second = words[1].substring(0, 3)
              bookPart = (first + second).toUpperCase()
            } else {
              const first = words[0].substring(0, 2)
              const second = words[1].substring(0, 2)
              const third = words[2] ? words[2].substring(0, 2) : ''
              bookPart = (first + second + third).toUpperCase()
            }
            // Add numbers if found
            const numbers = formData.book_source.match(/\d+/g)
            if (numbers && numbers.length > 0) {
              bookPart += numbers[0]
            }
          }
          
          // Generate chapter code preview
          let chapterPart = 'CHAP'
          if (formData.chapter_name) {
            const words = formData.chapter_name.replace(/[^\w\s]/g, '').replace(/\b(and|the|of|in|on|at|to|for|with|by|class|grade)\b/gi, '').trim().split(/\s+/).filter(word => word.length > 0)
            if (words.length === 1) {
              chapterPart = words[0].substring(0, 4).toUpperCase()
            } else if (words.length === 2) {
              const first = words[0].substring(0, 2)
              const second = words[1].substring(0, 2)
              chapterPart = (first + second).toUpperCase()
            } else {
              chapterPart = words.slice(0, 3).map((word, index) => {
                if (index < 2) return word.charAt(0)
                else return word.substring(0, 2)
              }).join('').toUpperCase()
            }
          }
          
          const numberPart = formData.question_number_in_book ? String(formData.question_number_in_book).padStart(3, '0') : '001'
          previewId = `${bookPart}-${chapterPart}-${numberPart}`
        }
        setFormData(prev => ({
          ...prev,
          question_id: previewId
        }))
      }
    }

    generateId()
  }, [formData.book_source, formData.chapter_name, formData.question_number_in_book])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.admin_tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        admin_tags: [...prev.admin_tags, tag]
      }))
    }
    setTagInput('')
    setIsTagPopoverOpen(false)
  }

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      admin_tags: prev.admin_tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTagAdd(tagInput)
    }
  }

  const handleCreateNewBook = async () => {
    if (!newBookName.trim()) {
      toast.error('Please enter a book name')
      return
    }

    setIsCreatingBook(true)
    try {
      // Generate a unique book code using the enhanced algorithm
      const bookCode = await generateUniqueBookCode(newBookName.trim())
      const result = await createBookSource(newBookName.trim(), bookCode)
      
      if (result.success) {
        toast.success('New book created successfully!')
        setFormData(prev => ({ ...prev, book_source: newBookName.trim() }))
        setNewBookName('')
        setShowNewBookInput(false)
        // Reload filter options to include the new book
        const booksWithCodes = await getAllBookSourcesWithCodes()
        const bookNames = booksWithCodes.map(book => book.name)
        const options = await getFilterOptions()
        setFilterOptions({
          bookSources: bookNames,
          chapters: options.chapters,
          tags: options.tags,
          difficulties: options.difficulties
        })
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error creating book:', error)
      toast.error('Failed to create new book')
    } finally {
      setIsCreatingBook(false)
    }
  }

  const handleCreateNewChapter = async () => {
    if (!newChapterName.trim()) {
      toast.error('Please enter a chapter name')
      return
    }

    if (!formData.book_source) {
      toast.error('Please select a book source first')
      return
    }

    setIsCreatingChapter(true)
    try {
      const result = await createChapter(newChapterName.trim(), formData.book_source)
      
      if (result.success) {
        toast.success('New chapter created successfully!')
        setFormData(prev => ({ ...prev, chapter_name: newChapterName.trim() }))
        setNewChapterName('')
        setShowNewChapterInput(false)
        // Reload filter options to include the new chapter
        const booksWithCodes = await getAllBookSourcesWithCodes()
        const bookNames = booksWithCodes.map(book => book.name)
        const options = await getFilterOptions()
        setFilterOptions({
          bookSources: bookNames,
          chapters: options.chapters,
          tags: options.tags,
          difficulties: options.difficulties
        })
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error creating chapter:', error)
      toast.error('Failed to create new chapter')
    } finally {
      setIsCreatingChapter(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Validate required fields
      if (!formData.question_text || !formData.book_source || !formData.chapter_name) {
        toast.error('Please fill in all required fields')
        return
      }

      if (!formData.option_a || !formData.option_b || !formData.option_c || !formData.option_d) {
        toast.error('Please fill in all options')
        return
      }

      if (!formData.correct_option) {
        toast.error('Please select the correct option')
        return
      }

      // Create FormData for the server action
      const formDataForSubmission = new FormData()
      formDataForSubmission.append('question_id', formData.question_id)
      formDataForSubmission.append('book_source', formData.book_source)
      formDataForSubmission.append('chapter_name', formData.chapter_name)
      formDataForSubmission.append('question_number_in_book', formData.question_number_in_book)
      formDataForSubmission.append('question_text', formData.question_text)
      formDataForSubmission.append('option_a', formData.option_a)
      formDataForSubmission.append('option_b', formData.option_b)
      formDataForSubmission.append('option_c', formData.option_c)
      formDataForSubmission.append('option_d', formData.option_d)
      formDataForSubmission.append('correct_option', formData.correct_option)
      formDataForSubmission.append('solution_text', formData.solution_text)
      formDataForSubmission.append('exam_metadata', formData.exam_metadata)
      formDataForSubmission.append('admin_tags', formData.admin_tags.join(','))
      formDataForSubmission.append('difficulty', formData.difficulty)

      // Create the question
      await createQuestion(formDataForSubmission)
      
      toast.success('Question created successfully!')
      router.push('/content')
    } catch (error) {
      console.error('Error creating question:', error)
      toast.error('Failed to create question')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/content">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Content
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Question</h1>
          <p className="text-muted-foreground">
            Create a new question with auto-generated ID and dynamic book/chapter management.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Question Information</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/content')}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create Question'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Question ID</label>
              <Input
                value={formData.question_id}
                readOnly
                className="bg-muted cursor-not-allowed font-mono"
                placeholder="Select book, chapter, and question number to see preview"
              />
              <p className="text-xs text-muted-foreground">
                {formData.question_id 
                  ? (formData.book_source && formData.chapter_name && formData.question_number_in_book 
                      ? "Final auto-generated question ID" 
                      : "Preview of question ID")
                  : "Question ID will be auto-generated based on your selections"
                }
              </p>
            </div>

            {/* Book Source */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Book Source *</label>
              <Select value={formData.book_source} onValueChange={(value) => {
                if (value === 'add_new_book') {
                  setShowNewBookInput(true)
                } else {
                  handleInputChange('book_source', value)
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select book source" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.bookSources.map((book) => (
                    <SelectItem key={book} value={book}>
                      {book}
                    </SelectItem>
                  ))}
                  <SelectItem value="add_new_book" className="text-blue-600 font-medium">
                    + Add New Book
                  </SelectItem>
                </SelectContent>
              </Select>
              {showNewBookInput && (
                <div className="flex gap-2">
                  <Input
                    value={newBookName}
                    onChange={(e) => setNewBookName(e.target.value)}
                    placeholder="Enter new book name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateNewBook()
                      } else if (e.key === 'Escape') {
                        setShowNewBookInput(false)
                        setNewBookName('')
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleCreateNewBook}
                    disabled={isCreatingBook || !newBookName.trim()}
                  >
                    {isCreatingBook ? 'Creating...' : 'Add'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowNewBookInput(false)
                      setNewBookName('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Chapter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chapter *</label>
              <Select value={formData.chapter_name} onValueChange={(value) => {
                if (value === 'add_new_chapter') {
                  setShowNewChapterInput(true)
                } else {
                  handleInputChange('chapter_name', value)
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.chapters.map((chapter) => (
                    <SelectItem key={chapter} value={chapter}>
                      {chapter}
                    </SelectItem>
                  ))}
                  <SelectItem value="add_new_chapter" className="text-blue-600 font-medium">
                    + Add New Chapter
                  </SelectItem>
                </SelectContent>
              </Select>
              {showNewChapterInput && (
                <div className="flex gap-2">
                  <Input
                    value={newChapterName}
                    onChange={(e) => setNewChapterName(e.target.value)}
                    placeholder="Enter new chapter name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateNewChapter()
                      } else if (e.key === 'Escape') {
                        setShowNewChapterInput(false)
                        setNewChapterName('')
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleCreateNewChapter}
                    disabled={isCreatingChapter || !newChapterName.trim() || !formData.book_source}
                  >
                    {isCreatingChapter ? 'Creating...' : 'Add'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowNewChapterInput(false)
                      setNewChapterName('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Question Number in Book */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Question Number in Book</label>
              <Input
                type="number"
                value={formData.question_number_in_book}
                onChange={(e) => handleInputChange('question_number_in_book', e.target.value)}
                placeholder="Optional"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Correct Option */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Correct Option *</label>
              <Select value={formData.correct_option} onValueChange={(value) => handleInputChange('correct_option', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select correct option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">A</SelectItem>
                  <SelectItem value="b">B</SelectItem>
                  <SelectItem value="c">C</SelectItem>
                  <SelectItem value="d">D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Question Text *</label>
            <ClientOnlyAdvancedTipTapEditor
              value={formData.question_text}
              onChange={(value: string) => handleInputChange('question_text', value)}
              placeholder="Enter the question text (supports LaTeX math and images)"
              showToolbar={true}
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Options *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm">Option A</label>
                <ClientOnlyAdvancedTipTapEditor
                  value={formData.option_a}
                  onChange={(value: string) => handleInputChange('option_a', value)}
                  placeholder="Option A (supports LaTeX and images)"
                  compact={true}
                  showToolbar={false}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Option B</label>
                <ClientOnlyAdvancedTipTapEditor
                  value={formData.option_b}
                  onChange={(value: string) => handleInputChange('option_b', value)}
                  placeholder="Option B (supports LaTeX and images)"
                  compact={true}
                  showToolbar={false}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Option C</label>
                <ClientOnlyAdvancedTipTapEditor
                  value={formData.option_c}
                  onChange={(value: string) => handleInputChange('option_c', value)}
                  placeholder="Option C (supports LaTeX and images)"
                  compact={true}
                  showToolbar={false}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Option D</label>
                <ClientOnlyAdvancedTipTapEditor
                  value={formData.option_d}
                  onChange={(value: string) => handleInputChange('option_d', value)}
                  placeholder="Option D (supports LaTeX and images)"
                  compact={true}
                  showToolbar={false}
                />
              </div>
            </div>
          </div>

          {/* Solution */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Solution</label>
            <ClientOnlyAdvancedTipTapEditor
              value={formData.solution_text}
              onChange={(value: string) => handleInputChange('solution_text', value)}
              placeholder="Enter the solution/explanation (supports LaTeX math and images)"
              showToolbar={true}
            />
          </div>

          {/* Exam Metadata */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Exam Metadata</label>
            <Input
              value={formData.exam_metadata}
              onChange={(e) => handleInputChange('exam_metadata', e.target.value)}
              placeholder="Additional exam information"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.admin_tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                  {tag}
                  <button
                    className="ml-1 p-0.5 rounded-sm hover:bg-destructive/20 transition-colors"
                    onClick={() => handleTagRemove(tag)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <Command>
                  <CommandInput
                    placeholder="Search or add tags..."
                    value={tagInput}
                    onValueChange={setTagInput}
                    onKeyDown={handleTagInputKeyPress}
                  />
                  <CommandList>
                    <CommandEmpty>No tags found.</CommandEmpty>
                    <CommandGroup>
                      {filterOptions.tags
                        .filter(tag => !formData.admin_tags.includes(tag))
                        .map((tag) => (
                          <CommandItem
                            key={tag}
                            value={tag}
                            onSelect={() => handleTagAdd(tag)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            {tag}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
