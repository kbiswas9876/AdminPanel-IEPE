'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  X, 
  ChevronDown, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  AlertTriangle,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronDown as ChevronDownIcon
} from 'lucide-react'
import { ParsedQuestion } from '@/lib/utils/bulk-upload-parsers'
import { LatexRenderer } from '@/lib/utils/latex-renderer'
import { cn } from '@/lib/utils'
import BulkUploadEditModal from './bulk-upload-edit-modal'

interface BulkUploadReviewProps {
  questions: ParsedQuestion[]
  errors: Array<{ row: number; data: unknown; error: string }>
  onEditQuestion?: (question: ParsedQuestion, index: number) => void
  onDeleteQuestion?: (index: number) => void
  onBulkDelete?: (indices: number[]) => void
  onRetryUpload?: () => void
  onCancel?: () => void
}

export default function BulkUploadReview({
  questions,
  errors,
  onEditQuestion,
  onDeleteQuestion,
  onBulkDelete,
  onRetryUpload,
  onCancel
}: BulkUploadReviewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBook, setSelectedBook] = useState<string>('all')
  const [selectedChapter, setSelectedChapter] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set())
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  // Get unique values for filters
  const uniqueBooks = useMemo(() => {
    const books = new Set(questions.map(q => q.book_source))
    return Array.from(books).sort()
  }, [questions])

  const uniqueChapters = useMemo(() => {
    const chapters = new Set(questions.map(q => q.chapter_name))
    return Array.from(chapters).sort()
  }, [questions])

  const uniqueTags = useMemo(() => {
    const tags = new Set(questions.flatMap(q => q.admin_tags || []))
    return Array.from(tags).sort()
  }, [questions])

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          question.question_text?.toLowerCase().includes(searchLower) ||
          question.book_source?.toLowerCase().includes(searchLower) ||
          question.chapter_name?.toLowerCase().includes(searchLower) ||
          question.admin_tags?.some(tag => tag.toLowerCase().includes(searchLower))
        
        if (!matchesSearch) return false
      }

      // Book filter
      if (selectedBook !== 'all' && question.book_source !== selectedBook) {
        return false
      }

      // Chapter filter
      if (selectedChapter !== 'all' && question.chapter_name !== selectedChapter) {
        return false
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = selectedTags.some(tag => 
          question.admin_tags?.includes(tag)
        )
        if (!hasMatchingTag) return false
      }

      return true
    })
  }, [questions, searchTerm, selectedBook, selectedChapter, selectedTags])

  const toggleQuestionExpansion = (index: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const toggleQuestionSelection = (index: number) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set())
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map((_, index) => index)))
    }
  }

  const handleBulkDelete = () => {
    if (selectedQuestions.size > 0 && onBulkDelete) {
      const indices = Array.from(selectedQuestions)
      onBulkDelete(indices)
      setSelectedQuestions(new Set())
    }
  }

  const handleEditQuestion = (index: number) => {
    setEditingQuestion(index)
    setEditModalOpen(true)
  }

  const handleSaveEditedQuestion = (updatedQuestion: ParsedQuestion, index: number) => {
    if (onEditQuestion) {
      onEditQuestion(updatedQuestion, index)
    }
    setEditModalOpen(false)
    setEditingQuestion(null)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setEditingQuestion(null)
  }

  const isAllSelected = selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0
  const isPartiallySelected = selectedQuestions.size > 0 && selectedQuestions.size < filteredQuestions.length

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upload Review & Management</span>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600 font-semibold">
                {questions.length} Questions Ready
              </span>
              {errors.length > 0 && (
                <span className="text-red-600 font-semibold">
                  {errors.length} Errors
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-semibold mb-2">Upload Errors Detected:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {errors.map((error, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">Row {error.row}:</span> {error.error}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Book Filter */}
            <Select value={selectedBook} onValueChange={setSelectedBook}>
              <SelectTrigger>
                <SelectValue placeholder="All Books" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                {uniqueBooks.map(book => (
                  <SelectItem key={book} value={book}>{book}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Chapter Filter */}
            <Select value={selectedChapter} onValueChange={setSelectedChapter}>
              <SelectTrigger>
                <SelectValue placeholder="All Chapters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chapters</SelectItem>
                {uniqueChapters.map(chapter => (
                  <SelectItem key={chapter} value={chapter}>{chapter}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tags Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between">
                  {selectedTags.length > 0 
                    ? `${selectedTags.length} tags selected`
                    : "All Tags"
                  }
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <Command>
                  <CommandInput placeholder="Search tags..." />
                  <CommandList>
                    <CommandEmpty>No tags found.</CommandEmpty>
                    <CommandGroup>
                      {uniqueTags.map(tag => (
                        <CommandItem
                          key={tag}
                          onSelect={() => {
                            setSelectedTags(prev => 
                              prev.includes(tag) 
                                ? prev.filter(t => t !== tag)
                                : [...prev, tag]
                            )
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            {selectedTags.includes(tag) ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                            <span>{tag}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filters */}
          {(selectedBook !== 'all' || selectedChapter !== 'all' || selectedTags.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedBook !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Book: {selectedBook}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedBook('all')}
                  />
                </Badge>
              )}
              {selectedChapter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Chapter: {selectedChapter}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedChapter('all')}
                  />
                </Badge>
              )}
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                  />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Questions ({filteredQuestions.length} of {questions.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                {isAllSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : isPartiallySelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedQuestions.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete ({selectedQuestions.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question, index) => {
          const isExpanded = expandedQuestions.has(index)
          const isSelected = selectedQuestions.has(index)
          const isEditing = editingQuestion === index

          return (
            <Card key={index} className={cn(
              "transition-all duration-200",
              isSelected && "ring-2 ring-blue-500",
              isEditing && "ring-2 ring-green-500"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleQuestionSelection(index)}
                        className="rounded border-gray-300"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleQuestionExpansion(index)}
                        className="p-1 h-auto"
                      >
                        {isExpanded ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate">
                          {question.book_source} - {question.chapter_name} (Q{question.question_number_in_book})
                        </h3>
                        {question.question_id && (
                          <Badge variant="outline" className="text-xs">
                            {question.question_id}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-gray-600 mb-2">
                        <LatexRenderer text={question.question_text || ''} />
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {question.admin_tags?.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuestion(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {onDeleteQuestion && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteQuestion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Options */}
                    {question.options && (
                      <div>
                        <h4 className="font-medium mb-2">Options:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(question.options).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <Badge variant={question.correct_option === key ? "default" : "outline"}>
                                {key}
                              </Badge>
                              <LatexRenderer text={value} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Solution */}
                    {question.solution_text && (
                      <div>
                        <h4 className="font-medium mb-2">Solution:</h4>
                        <div className="p-3 bg-green-50 rounded border">
                          <LatexRenderer text={question.solution_text} />
                        </div>
                      </div>
                    )}
                    
                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      {question.exam_metadata && (
                        <div>
                          <span className="font-medium">Exam:</span> {question.exam_metadata}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredQuestions.length} questions ready for upload
            </div>
            <div className="flex gap-2">
              {onRetryUpload && (
                <Button onClick={onRetryUpload} className="bg-green-600 hover:bg-green-700">
                  Retry Upload
                </Button>
              )}
              {onCancel && (
                <Button onClick={onCancel} variant="outline">
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <BulkUploadEditModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        question={editingQuestion !== null ? questions[editingQuestion] : null}
        questionIndex={editingQuestion || 0}
        onSave={handleSaveEditedQuestion}
        availableBooks={uniqueBooks}
        availableChapters={uniqueChapters}
        availableTags={uniqueTags}
      />
    </div>
  )
}
