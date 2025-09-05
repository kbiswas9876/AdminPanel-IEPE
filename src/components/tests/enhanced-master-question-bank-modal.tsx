'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Search, ChevronLeft, ChevronRight, Eye, EyeOff, Check } from 'lucide-react'
import { InlineMath, BlockMath } from 'react-katex'
import { searchQuestions } from '@/lib/actions/tests'
import type { Question } from '@/lib/types'

interface EnhancedMasterQuestionBankModalProps {
  open: boolean
  onClose: () => void
  onSelect: (q: Question) => void
  initialChapter?: string
}

export function EnhancedMasterQuestionBankModal({ 
  open, 
  onClose, 
  onSelect, 
  initialChapter 
}: EnhancedMasterQuestionBankModalProps) {
  const [search, setSearch] = useState('')
  const [bookSource, setBookSource] = useState('')
  const [chapterName, setChapterName] = useState(initialChapter || '')
  const [difficulty, setDifficulty] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null | undefined>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const pageSize = 10
  const totalPages = Math.ceil(total / pageSize)

  // Available filter options - filtered to ensure no empty values
  const difficultyLevels = ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard'].filter(Boolean)
  const bookSources = ['NCERT', 'RD Sharma', 'RS Aggarwal', 'Arihant', 'Other'].filter(Boolean)
  const availableTags = ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics', 'Probability'].filter(Boolean)

  const renderMathContent = (text: string) => {
    if (text.includes('$') || text.includes('\\(') || text.includes('\\[')) {
      if (text.includes('$$') || text.includes('\\[')) {
        return <BlockMath math={text.replace(/\$\$/g, '').replace(/\\\[/g, '').replace(/\\\]/g, '')} />
      } else {
        return <InlineMath math={text.replace(/\$/g, '')} />
      }
    }
    return <span>{text}</span>
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { questions, total } = await searchQuestions({
        search: search || undefined,
        book_source: bookSource || undefined,
        chapter_name: chapterName || undefined,
        difficulty: (difficulty as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard') || undefined,
        tags: selectedTags.filter(Boolean).length > 0 ? selectedTags.filter(Boolean) : undefined,
        page,
        pageSize,
      })
      setQuestions(questions)
      setTotal(total)
    } catch (error) {
      console.error('Error fetching questions:', error)
      setQuestions([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [search, bookSource, chapterName, difficulty, selectedTags, page, pageSize])

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, fetchData])

  const handleTagToggle = (tag: string) => {
    // Ensure tag is not empty before processing
    if (!tag || tag.trim() === '') return
    
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSelect = (question: Question) => {
    onSelect(question)
    onClose()
  }

  const resetFilters = () => {
    setSearch('')
    setBookSource('')
    setChapterName(initialChapter || '')
    setDifficulty('')
    setSelectedTags([])
    setPage(1)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Master Question Bank</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Sidebar with Filters */}
          <div className="w-80 bg-gray-50 rounded-lg p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
            
            <div className="space-y-4">
              {/* Search */}
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search questions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Book Source */}
              <div>
                <Label>Book Source</Label>
                <Select value={bookSource} onValueChange={setBookSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Books" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Books</SelectItem>
                    {bookSources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Chapter */}
              <div>
                <Label htmlFor="chapter">Chapter</Label>
                <Input
                  id="chapter"
                  placeholder="Chapter name..."
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                />
              </div>

              {/* Difficulty */}
              <div>
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Difficulties</SelectItem>
                    {difficultyLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="space-y-2">
                  {availableTags.map(tag => (
                    <div key={tag} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`tag-${tag}`}
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        className="rounded"
                      />
                      <Label htmlFor={`tag-${tag}`} className="text-sm">{tag}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" onClick={resetFilters} className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  {total} questions found
                  {loading && <span className="ml-2">Loading...</span>}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {questions.map((question) => {
                const isExpanded = expandedQuestion === question.id
                const options = question.options || { a: '', b: '', c: '', d: '' }
                const optionKeys = Object.keys(options) as Array<'a' | 'b' | 'c' | 'd'>
                
                return (
                  <Card key={question.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-900">
                            Q{question.id}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {question.chapter_name}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {(question as unknown as { difficulty?: string }).difficulty || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedQuestion(isExpanded ? null : question.id || null)}
                          >
                            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {isExpanded ? 'Hide' : 'Preview'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSelect(question)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Select
                          </Button>
                        </div>
                      </div>

                      {/* Question Text Preview */}
                      <div className="mb-3">
                        <div className="prose prose-sm max-w-none text-gray-700">
                          {renderMathContent(question.question_text.substring(0, 200))}
                          {question.question_text.length > 200 && !isExpanded && '...'}
                        </div>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="border-t pt-4 mt-4">
                          {/* Full Question Text */}
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Question:</h5>
                            <div className="prose prose-sm max-w-none">
                              {renderMathContent(question.question_text)}
                            </div>
                          </div>

                          {/* Options */}
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Options:</h5>
                            <div className="space-y-2">
                              {optionKeys.map((optionKey) => {
                                const optionText = options[optionKey]
                                const isCorrect = question.correct_option === optionKey
                                
                                return (
                                  <div
                                    key={optionKey}
                                    className={`flex items-start space-x-3 p-2 rounded ${
                                      isCorrect 
                                        ? 'bg-green-50 border border-green-200' 
                                        : 'bg-gray-50'
                                    }`}
                                  >
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                                      isCorrect
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {optionKey.toUpperCase()}
                                      {isCorrect && <Check className="h-3 w-3 ml-1" />}
                                    </div>
                                    <div className="flex-1 prose prose-sm max-w-none">
                                      {renderMathContent(optionText)}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="bg-gray-50 rounded p-3 text-xs text-gray-600">
                            <div className="grid grid-cols-2 gap-2">
                              <div><strong>Book:</strong> {question.book_source || '—'}</div>
                              <div><strong>Question #:</strong> {question.question_number_in_book || '—'}</div>
                              <div><strong>Tags:</strong> {(question.admin_tags || []).join(', ') || '—'}</div>
                              <div><strong>Solution:</strong> {question.solution_text || '—'}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}

              {questions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No questions found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
