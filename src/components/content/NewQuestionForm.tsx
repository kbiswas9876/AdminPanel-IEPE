'use client'

import React, { useState, useEffect } from 'react'
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
  X, 
  Save, 
  XCircle,
  Tag,
  ArrowLeft,
  Eye,
  EyeOff,
  Monitor,
  BookOpen,
  Hash,
  Target,
  FileQuestion,
  Database,
  CheckCircle,
  Plus,
  Minus,
  Sparkles,
  Zap,
  Shield,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { getFilterOptions } from '@/lib/actions/tests'
import { createBookSource } from '@/lib/actions/book-sources'
import { createChapter } from '@/lib/actions/chapters'
import { generateUniqueQuestionId, generateUniqueBookCode } from '@/lib/utils/uniform-id-generator'
import { getBookCodeByName, getAllBookSourcesWithCodes } from '@/lib/actions/id-generation'
import { createQuestion } from '@/lib/actions/questions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ClientOnlyAdvancedTipTapEditor } from '@/components/editors/ClientOnlyAdvancedTipTapEditor'
import { LivePreviewRenderer } from '@/components/editors/LivePreviewRenderer'

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
  
  // Premium UI state
  const [showPreview, setShowPreview] = useState(true)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/content">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-slate-100 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Question</h1>
                  <p className="text-sm text-gray-600 font-medium">Professional editor with live preview</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2 hover:bg-slate-50 transition-colors"
                title="Toggle live preview"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Hide preview' : 'Show preview'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/content')}
                disabled={isLoading}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create Question'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Section 1: Question Metadata */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden mb-6">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-blue-50/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Question Information</h2>
            </div>
          </div>
          <div className="p-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Question ID */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-600" />
                  Question ID
                </label>
                <Input
                  value={formData.question_id}
                  readOnly
                  className="bg-slate-50 cursor-not-allowed font-mono text-sm border-slate-200 focus:border-blue-300 transition-colors"
                  placeholder="Select book, chapter, and question number to see preview"
                />
                <p className="text-xs text-gray-500">
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
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Book Source *
                </label>
                <Select value={formData.book_source} onValueChange={(value) => {
                  if (value === 'add_new_book') {
                    setShowNewBookInput(true)
                  } else {
                    handleInputChange('book_source', value)
                  }
                }}>
                  <SelectTrigger className="border-slate-200 focus:border-blue-300 transition-colors">
                    <SelectValue placeholder="Select book source" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.bookSources.map((book) => (
                      <SelectItem key={book} value={book}>
                        {book}
                      </SelectItem>
                    ))}
                    <SelectItem value="add_new_book" className="text-blue-600 font-medium">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Book
                    </SelectItem>
                  </SelectContent>
                </Select>
                {showNewBookInput && (
                  <div className="flex gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Input
                      value={newBookName}
                      onChange={(e) => setNewBookName(e.target.value)}
                      placeholder="Enter new book name"
                      className="border-blue-200 focus:border-blue-400"
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
                      className="bg-blue-600 hover:bg-blue-700"
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
                      className="border-blue-200 hover:bg-blue-50"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Chapter */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Chapter *
                </label>
                <Select value={formData.chapter_name} onValueChange={(value) => {
                  if (value === 'add_new_chapter') {
                    setShowNewChapterInput(true)
                  } else {
                    handleInputChange('chapter_name', value)
                  }
                }}>
                  <SelectTrigger className="border-slate-200 focus:border-blue-300 transition-colors">
                    <SelectValue placeholder="Select chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.chapters.map((chapter) => (
                      <SelectItem key={chapter} value={chapter}>
                        {chapter}
                      </SelectItem>
                    ))}
                    <SelectItem value="add_new_chapter" className="text-blue-600 font-medium">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Chapter
                    </SelectItem>
                  </SelectContent>
                </Select>
                {showNewChapterInput && (
                  <div className="flex gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Input
                      value={newChapterName}
                      onChange={(e) => setNewChapterName(e.target.value)}
                      placeholder="Enter new chapter name"
                      className="border-blue-200 focus:border-blue-400"
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
                      className="bg-blue-600 hover:bg-blue-700"
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
                      className="border-blue-200 hover:bg-blue-50"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Question Number in Book */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-600" />
                  Question Number in Book
                </label>
                <Input
                  type="number"
                  value={formData.question_number_in_book}
                  onChange={(e) => handleInputChange('question_number_in_book', e.target.value)}
                  placeholder="Optional"
                  className="border-slate-200 focus:border-blue-300 transition-colors"
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  Difficulty
                </label>
                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                  <SelectTrigger className="border-slate-200 focus:border-blue-300 transition-colors">
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
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Correct Option *
                </label>
                <Select value={formData.correct_option} onValueChange={(value) => handleInputChange('correct_option', value)}>
                  <SelectTrigger className="border-slate-200 focus:border-blue-300 transition-colors">
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
          </div>
        </div>

        {/* Section 2: Question Text with Live Preview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden mb-6">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-green-50/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FileQuestion className="h-4 w-4 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Question Text</h2>
            </div>
          </div>
          <div className="p-8">
            <ClientOnlyAdvancedTipTapEditor
              value={formData.question_text}
              onChange={(value: string) => handleInputChange('question_text', value)}
              placeholder="Enter the question text (supports LaTeX math and images)"
              showToolbar={true}
            />
            
            {/* Live Preview for Question Text */}
            {showPreview && formData.question_text && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Live preview</span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <LivePreviewRenderer content={formData.question_text} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Options with Live Preview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden mb-6">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-purple-50/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Options</h2>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">A</span>
                  Option A
                </label>
                <ClientOnlyAdvancedTipTapEditor
                  value={formData.option_a}
                  onChange={(value: string) => handleInputChange('option_a', value)}
                  placeholder="Option A (supports LaTeX and images)"
                  compact={true}
                  showToolbar={false}
                />
                
                {/* Live Preview for Option A */}
                {showPreview && formData.option_a && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="h-3 w-3 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700">Preview</span>
                    </div>
                    <div className="prose prose-xs max-w-none">
                      <LivePreviewRenderer content={formData.option_a} />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">B</span>
                  Option B
                </label>
                <ClientOnlyAdvancedTipTapEditor
                  value={formData.option_b}
                  onChange={(value: string) => handleInputChange('option_b', value)}
                  placeholder="Option B (supports LaTeX and images)"
                  compact={true}
                  showToolbar={false}
                />
                
                {/* Live Preview for Option B */}
                {showPreview && formData.option_b && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="h-3 w-3 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700">Preview</span>
                    </div>
                    <div className="prose prose-xs max-w-none">
                      <LivePreviewRenderer content={formData.option_b} />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">C</span>
                  Option C
                </label>
                <ClientOnlyAdvancedTipTapEditor
                  value={formData.option_c}
                  onChange={(value: string) => handleInputChange('option_c', value)}
                  placeholder="Option C (supports LaTeX and images)"
                  compact={true}
                  showToolbar={false}
                />
                
                {/* Live Preview for Option C */}
                {showPreview && formData.option_c && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="h-3 w-3 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700">Preview</span>
                    </div>
                    <div className="prose prose-xs max-w-none">
                      <LivePreviewRenderer content={formData.option_c} />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">D</span>
                  Option D
                </label>
                <ClientOnlyAdvancedTipTapEditor
                  value={formData.option_d}
                  onChange={(value: string) => handleInputChange('option_d', value)}
                  placeholder="Option D (supports LaTeX and images)"
                  compact={true}
                  showToolbar={false}
                />
                
                {/* Live Preview for Option D */}
                {showPreview && formData.option_d && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="h-3 w-3 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700">Preview</span>
                    </div>
                    <div className="prose prose-xs max-w-none">
                      <LivePreviewRenderer content={formData.option_d} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Solution with Live Preview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden mb-6">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-orange-50/30">
            <button
              onClick={() => setIsSolutionExpanded(!isSolutionExpanded)}
              className="flex items-center gap-3 w-full text-left hover:bg-orange-50/50 p-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Solution</h2>
              <div className="ml-auto">
                {isSolutionExpanded ? <Minus className="h-4 w-4 text-gray-500" /> : <Plus className="h-4 w-4 text-gray-500" />}
              </div>
            </button>
          </div>
          {isSolutionExpanded && (
            <div className="p-8">
              <ClientOnlyAdvancedTipTapEditor
                value={formData.solution_text}
                onChange={(value: string) => handleInputChange('solution_text', value)}
                placeholder="Enter the solution/explanation (supports LaTeX math and images)"
                showToolbar={true}
              />
              
              {/* Live Preview for Solution */}
              {showPreview && formData.solution_text && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Live preview</span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <LivePreviewRenderer content={formData.solution_text} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 5: Additional Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden mb-6">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-slate-50/50 to-indigo-50/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
            </div>
          </div>
          <div className="p-8 space-y-6">
            {/* Exam Metadata */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-600" />
                Exam Metadata
              </label>
              <Input
                value={formData.exam_metadata}
                onChange={(e) => handleInputChange('exam_metadata', e.target.value)}
                placeholder="Additional exam information"
                className="border-slate-200 focus:border-indigo-300 transition-colors"
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-600" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.admin_tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 transition-colors">
                    {tag}
                    <button
                      className="ml-1 p-0.5 rounded-sm hover:bg-indigo-200 transition-colors"
                      onClick={() => handleTagRemove(tag)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
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
          </div>
        </div>
      </div>
    </div>
  )
}
