'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  BookOpen,
  Hash,
  Target,
  FileQuestion,
  Database,
  Eye,
  EyeOff,
  CheckCircle,
  Plus,
  Minus
} from 'lucide-react'
import type { UIQuestion } from '@/lib/types'
import { getFilterOptions } from '@/lib/actions/tests'
// getAllBookSourcesWithCodes is now available in uniform-id-generator
import { updateQuestionInPlace } from '@/lib/actions/questions'
import { createBookSource } from '@/lib/actions/book-sources'
import { createChapter } from '@/lib/actions/chapters'
import { generateUniqueQuestionId, generateUniqueBookCode } from '@/lib/utils/uniform-id-generator'
import { getBookCodeByName, getAllBookSourcesWithCodes } from '@/lib/actions/id-generation'
import { toast } from 'sonner'
import { LatexRenderer } from '@/lib/utils/latex-renderer'

interface QuestionEditFormProps {
  question: UIQuestion
  onSave: (updatedQuestion: UIQuestion) => void
  onCancel: () => void
}

interface FilterOptions {
  bookSources: string[]
  chapters: string[]
  tags: string[]
  difficulties: string[]
}

export function QuestionEditForm({ question, onSave, onCancel }: QuestionEditFormProps) {
  const [formData, setFormData] = useState({
    question_id: question.question_id || '',
    book_source: question.book_source || '',
    chapter_name: question.chapter_name || '',
    question_number_in_book: question.question_number_in_book || '',
    question_text: question.question_text || '',
    option_a: question.options?.a || '',
    option_b: question.options?.b || '',
    option_c: question.options?.c || '',
    option_d: question.options?.d || '',
    correct_option: question.correct_option || '',
    solution_text: question.solution_text || '',
    exam_metadata: question.exam_metadata || '',
    admin_tags: question.admin_tags || [],
    difficulty: question.difficulty || ''
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
  
  // New state for premium UI features
  const [showLatexPreview, setShowLatexPreview] = useState(true)
  const [isSolutionExpanded, setIsSolutionExpanded] = useState(false)

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

  // Handle Save function
  const handleSave = useCallback(async () => {
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

      // Prepare updated question data
      const updatedQuestion: UIQuestion = {
        ...question,
        question_id: formData.question_id,
        book_source: formData.book_source,
        chapter_name: formData.chapter_name,
        question_number_in_book: formData.question_number_in_book ? parseInt(formData.question_number_in_book.toString()) : null,
        question_text: formData.question_text,
        options: {
          a: formData.option_a,
          b: formData.option_b,
          c: formData.option_c,
          d: formData.option_d
        },
        correct_option: formData.correct_option,
        solution_text: formData.solution_text,
        exam_metadata: formData.exam_metadata,
        admin_tags: formData.admin_tags,
        difficulty: formData.difficulty as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard' | null
      }

      // Update in database
      const result = await updateQuestionInPlace(updatedQuestion)
      
      if (result.success) {
        toast.success('Question updated successfully!')
        onSave(updatedQuestion)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error updating question:', error)
      toast.error('Failed to update question')
    } finally {
      setIsLoading(false)
    }
  }, [formData, question, onSave])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, onCancel])

  // LaTeX Preview Component
  const LatexPreview = useCallback(({ content, className = "" }: { content: string; className?: string }) => {
    if (!content || !showLatexPreview) return null
    
    return (
      <div className={`mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Eye className="h-3 w-3 text-slate-500" />
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Preview</span>
        </div>
        <div className="text-sm">
          <LatexRenderer text={content} />
        </div>
      </div>
    )
  }, [showLatexPreview])

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

  return (
    <div className="min-h-screen bg-slate-50/30 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Premium Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden mb-6">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/20">
                  <FileQuestion className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Question</h2>
                  <p className="text-sm text-gray-600 font-medium">Premium question editor with live LaTeX preview</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLatexPreview(!showLatexPreview)}
                  className="gap-2"
                >
                  {showLatexPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showLatexPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>

          {/* Section 1: Metadata - Two Column Layout */}
          <div className="px-8 py-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
              <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Metadata</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Question ID */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <Hash className="h-4 w-4" />
                    Question ID
                  </label>
                  <Input
                    value={formData.question_id}
                    readOnly
                    className="bg-slate-50 cursor-not-allowed font-mono text-sm border-slate-200"
                    placeholder="Auto-generated based on selections"
                  />
                  <p className="text-xs text-slate-500">
                    {formData.question_id 
                      ? (formData.book_source && formData.chapter_name && formData.question_number_in_book 
                          ? "Final auto-generated question ID" 
                          : "Preview of question ID")
                      : "Question ID will be auto-generated based on your selections"
                    }
                  </p>
                </div>

                {/* Book Source */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <BookOpen className="h-4 w-4" />
                    Book Source *
                  </label>
                  <Select value={formData.book_source} onValueChange={(value) => {
                    if (value === 'add_new_book') {
                      setShowNewBookInput(true)
                    } else {
                      handleInputChange('book_source', value)
                    }
                  }}>
                    <SelectTrigger className="border-slate-200">
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
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <BookOpen className="h-4 w-4" />
                    Chapter *
                  </label>
                  <Select value={formData.chapter_name} onValueChange={(value) => {
                    if (value === 'add_new_chapter') {
                      setShowNewChapterInput(true)
                    } else {
                      handleInputChange('chapter_name', value)
                    }
                  }}>
                    <SelectTrigger className="border-slate-200">
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

                {/* Question Number */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <Hash className="h-4 w-4" />
                    Question Number
                  </label>
                  <Input
                    type="number"
                    value={formData.question_number_in_book}
                    onChange={(e) => handleInputChange('question_number_in_book', e.target.value)}
                    placeholder="Optional"
                    className="border-slate-200"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Difficulty */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <Target className="h-4 w-4" />
                    Difficulty
                  </label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <SelectTrigger className="border-slate-200">
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
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <CheckCircle className="h-4 w-4" />
                    Correct Option *
                  </label>
                  <Select value={formData.correct_option} onValueChange={(value) => handleInputChange('correct_option', value)}>
                    <SelectTrigger className="border-slate-200">
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

                {/* Exam Metadata */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <Database className="h-4 w-4" />
                    Exam Metadata
                  </label>
                  <Input
                    value={formData.exam_metadata}
                    onChange={(e) => handleInputChange('exam_metadata', e.target.value)}
                    placeholder="e.g., CAT 2022 Slot 1"
                    className="border-slate-200"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <Tag className="h-4 w-4" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.admin_tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 pr-1 bg-blue-50 text-blue-700 border-blue-200">
                        {tag}
                        <button
                          className="ml-1 p-0.5 rounded-sm hover:bg-red-100 transition-colors"
                          onClick={() => handleTagRemove(tag)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start border-slate-200">
                        <Plus className="h-4 w-4 mr-2" />
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
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Question Text */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden mb-6">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-green-50/30">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-sm"></div>
              <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Question Text</h3>
            </div>
          </div>
          <div className="px-8 py-6">
            <div className="space-y-4">
              <Textarea
                value={formData.question_text}
                onChange={(e) => handleInputChange('question_text', e.target.value)}
                placeholder="Enter the question text (supports LaTeX with $...$ or $$...$$)"
                rows={4}
                className="text-base font-mono border-slate-200 resize-none"
              />
              <LatexPreview content={formData.question_text} />
            </div>
          </div>
        </div>

        {/* Section 3: Options - 2x2 Grid */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden mb-6">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-purple-50/30">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full shadow-sm"></div>
              <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Options</h3>
            </div>
          </div>
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Option A */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    formData.correct_option === 'a' 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    A
                  </div>
                  <label className="text-sm font-semibold text-gray-700">Option A</label>
                  {formData.correct_option === 'a' && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <Textarea
                  value={formData.option_a}
                  onChange={(e) => handleInputChange('option_a', e.target.value)}
                  placeholder="Option A (supports LaTeX)"
                  rows={3}
                  className={`text-sm font-mono border-slate-200 resize-none ${
                    formData.correct_option === 'a' ? 'border-green-300 bg-green-50/30' : ''
                  }`}
                />
                <LatexPreview content={formData.option_a} />
              </div>

              {/* Option B */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    formData.correct_option === 'b' 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    B
                  </div>
                  <label className="text-sm font-semibold text-gray-700">Option B</label>
                  {formData.correct_option === 'b' && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <Textarea
                  value={formData.option_b}
                  onChange={(e) => handleInputChange('option_b', e.target.value)}
                  placeholder="Option B (supports LaTeX)"
                  rows={3}
                  className={`text-sm font-mono border-slate-200 resize-none ${
                    formData.correct_option === 'b' ? 'border-green-300 bg-green-50/30' : ''
                  }`}
                />
                <LatexPreview content={formData.option_b} />
              </div>

              {/* Option C */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    formData.correct_option === 'c' 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    C
                  </div>
                  <label className="text-sm font-semibold text-gray-700">Option C</label>
                  {formData.correct_option === 'c' && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <Textarea
                  value={formData.option_c}
                  onChange={(e) => handleInputChange('option_c', e.target.value)}
                  placeholder="Option C (supports LaTeX)"
                  rows={3}
                  className={`text-sm font-mono border-slate-200 resize-none ${
                    formData.correct_option === 'c' ? 'border-green-300 bg-green-50/30' : ''
                  }`}
                />
                <LatexPreview content={formData.option_c} />
              </div>

              {/* Option D */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    formData.correct_option === 'd' 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    D
                  </div>
                  <label className="text-sm font-semibold text-gray-700">Option D</label>
                  {formData.correct_option === 'd' && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <Textarea
                  value={formData.option_d}
                  onChange={(e) => handleInputChange('option_d', e.target.value)}
                  placeholder="Option D (supports LaTeX)"
                  rows={3}
                  className={`text-sm font-mono border-slate-200 resize-none ${
                    formData.correct_option === 'd' ? 'border-green-300 bg-green-50/30' : ''
                  }`}
                />
                <LatexPreview content={formData.option_d} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Solution - Collapsible */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden mb-6">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-orange-50/30">
            <button
              onClick={() => setIsSolutionExpanded(!isSolutionExpanded)}
              className="flex items-center justify-between w-full group"
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Solution</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Click to {isSolutionExpanded ? 'collapse' : 'expand'}</span>
                {isSolutionExpanded ? <Minus className="h-4 w-4 text-gray-500" /> : <Plus className="h-4 w-4 text-gray-500" />}
              </div>
            </button>
          </div>
          {isSolutionExpanded && (
            <div className="px-8 py-6 animate-in fade-in-0 duration-200">
              <div className="space-y-4">
                <Textarea
                  value={formData.solution_text}
                  onChange={(e) => handleInputChange('solution_text', e.target.value)}
                  placeholder="Enter the solution/explanation (supports LaTeX)"
                  rows={4}
                  className="text-base font-mono border-slate-200 resize-none"
                />
                <LatexPreview content={formData.solution_text} />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 rounded-t-2xl shadow-lg">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>💡 <strong>Keyboard Shortcuts:</strong> Ctrl+S to save, Esc to cancel</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
