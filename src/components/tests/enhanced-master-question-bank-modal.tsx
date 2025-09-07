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
import { Search, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { SmartLatexRenderer } from './smart-latex-renderer'
import { searchQuestions, getFilterOptions } from '@/lib/actions/tests'
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
  const [selectedQuestionForPreview, setSelectedQuestionForPreview] = useState<Question | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filterOptions, setFilterOptions] = useState<{ bookSources: string[]; chapters: string[]; tags: string[]; difficulties: string[] }>({ bookSources: [], chapters: [], tags: [], difficulties: [] })
  const [tagQuery, setTagQuery] = useState('')
  
  const pageSize = 10
  const totalPages = Math.ceil(total / pageSize)

  // Available filter options - filtered to ensure no empty values
  const ALL_OPTION = '__ALL__'
  const difficultyLevels = filterOptions.difficulties
  const bookSources = filterOptions.bookSources
  const availableTags = filterOptions.tags
  const chapters = filterOptions.chapters

  const renderMathContent = (text: string) => <SmartLatexRenderer text={text} />

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

  // Load dynamic filter options when opening and when book source changes (cascading)
  useEffect(() => {
    if (!open) return
    const load = async () => {
      try {
        const options = await getFilterOptions({ bookSource: bookSource || undefined })
        setFilterOptions(options)
        // Ensure selected tags still valid after cascade; remove any not in available list
        setSelectedTags((prev) => prev.filter((t) => options.tags.includes(t)))
        // If current chapter is not available under this scope, reset it
        if (chapterName && !options.chapters.includes(chapterName)) {
          setChapterName('')
        }
      } catch (e) {
        console.error('Failed to load filter options', e)
      }
    }
    load()
  }, [open, bookSource, chapterName])

  // Reset to first page when filters change to avoid empty pages
  useEffect(() => {
    if (!open) return
    setPage(1)
  }, [search, bookSource, chapterName, difficulty, selectedTags, open])

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
    setSelectedQuestionForPreview(null)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="w-[90vw] sm:max-w-[90vw] lg:max-w-[1200px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Master Question Bank</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left Pane: Filters + Results */}
          <div className="w-[35%] bg-gray-50 rounded-lg p-4 overflow-hidden flex flex-col">
            <h3 className="font-semibold text-gray-900 mb-3">Filters</h3>
            
            <div className="space-y-3">
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
                <Select value={bookSource || ALL_OPTION} onValueChange={(val) => setBookSource(val === ALL_OPTION ? '' : val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Books" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_OPTION}>All Books</SelectItem>
                    {bookSources.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Chapter */}
              <div>
                <Label>Chapter</Label>
                <Select value={chapterName || ALL_OPTION} onValueChange={(val) => setChapterName(val === ALL_OPTION ? '' : val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Chapters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_OPTION}>All Chapters</SelectItem>
                    {chapters.map((ch) => (
                      <SelectItem key={ch} value={ch}>{ch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div>
                <Label>Difficulty</Label>
                <Select value={difficulty || ALL_OPTION} onValueChange={(val) => setDifficulty(val === ALL_OPTION ? '' : val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_OPTION}>All Difficulties</SelectItem>
                    {difficultyLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <Input
                  placeholder="Search tags..."
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  className="mt-1 mb-2"
                />
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {availableTags.filter((t) => t.toLowerCase().includes(tagQuery.toLowerCase())).map(tag => (
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
            {/* Results List */}
            <div className="mt-4 flex-1 overflow-y-auto">
              {questions.length === 0 && !loading && (
                <div className="text-center py-8 text-sm text-gray-500">No questions found.</div>
              )}
              <div className="space-y-2">
                {questions.map((q) => {
                  const active = selectedQuestionForPreview
                    ? (selectedQuestionForPreview.id != null && q.id != null
                        ? selectedQuestionForPreview.id === q.id
                        : selectedQuestionForPreview.question_id === q.question_id)
                    : false
                  return (
                    <button
                      key={(q.id ?? q.question_id) as string | number}
                      type="button"
                      onClick={() => setSelectedQuestionForPreview(q)}
                      className={`w-full text-left rounded-md border px-3 py-2 text-sm transition-colors ${active ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">ID: {q.question_id || q.id}</span>
                          <Badge variant="outline" className="text-[10px]">{q.chapter_name}</Badge>
                        </div>
                        <span className="text-[11px] text-gray-500">{active ? 'Previewing' : 'Preview'}</span>
                      </div>
                      <div className="mt-1 line-clamp-1 text-gray-700">
                        <SmartLatexRenderer text={q.question_text} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Pane: Rich Preview */}
          <div className="w-[65%] flex flex-col overflow-hidden">
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
            <div className="flex-1 overflow-y-auto">
              {!selectedQuestionForPreview && (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  Select a question from the list to preview it.
                </div>
              )}
              {selectedQuestionForPreview && (() => {
                const question = selectedQuestionForPreview
                const options = question.options || { a: '', b: '', c: '', d: '' }
                const optionKeys = Object.keys(options) as Array<'a' | 'b' | 'c' | 'd'>
                return (
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-5">
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Question:</h4>
                        <div className="prose max-w-none">
                          {renderMathContent(question.question_text)}
                        </div>
                      </div>
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Options:</h5>
                        <div className="space-y-2">
                          {optionKeys.map((optionKey) => {
                            const optionText = options[optionKey]
                            const isCorrect = question.correct_option === optionKey
                            return (
                              <div key={optionKey} className={`flex items-start space-x-3 p-2 rounded ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
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
                      <div className="bg-gray-50 rounded p-3 text-xs text-gray-600 mb-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div><strong>Book:</strong> {question.book_source || '—'}</div>
                          <div><strong>Question #:</strong> {question.question_number_in_book || '—'}</div>
                          <div><strong>Tags:</strong> {(question.admin_tags || []).join(', ') || '—'}</div>
                          <div><strong>Difficulty:</strong> {question.difficulty || '—'}</div>
                        </div>
                      </div>
                      {question.solution_text && (
                        <div className="mb-6">
                          <h5 className="font-medium text-gray-900 mb-2">Solution:</h5>
                          <div className="prose max-w-none">
                            {renderMathContent(question.solution_text)}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSelect(question)}>
                          <Check className="h-4 w-4 mr-1" /> Select This Question
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
