'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Search, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { SmartLatexRenderer } from './smart-latex-renderer'
import { getFilterOptions, searchQuestions } from '@/lib/actions/tests'
import type { Question } from '@/lib/types'

type Filters = {
  search: string
  bookSource: string
  chapter: string
  difficulty: string
  tags: string[]
  page: number
}

type FilterOptions = {
  bookSources: string[]
  chapters: string[]
  tags: string[]
  difficulties: string[]
}

interface QuestionExplorerModalProps {
  open: boolean
  onClose: () => void
  onSelect: (q: Question) => void
  initialChapter?: string
}

export function QuestionExplorerModal({ open, onClose, onSelect, initialChapter }: QuestionExplorerModalProps) {
  const [filters, setFilters] = useState<Filters>({ search: '', bookSource: '', chapter: initialChapter || '', difficulty: '', tags: [], page: 1 })
  const [options, setOptions] = useState<FilterOptions>({ bookSources: [], chapters: [], tags: [], difficulties: ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard'] })
  const [results, setResults] = useState<Question[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [expandedKey, setExpandedKey] = useState<string | number | null>(null)
  const [tagQuery, setTagQuery] = useState('')
  const [chapterQuery, setChapterQuery] = useState('')
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const ALL = '__ALL__'

  // Load filter options; supports cascading by bookSource
  const loadOptions = useCallback(async (bookSource?: string) => {
    try {
      const next = await getFilterOptions({ bookSource: bookSource || undefined })
      setOptions(next)

      // Cascade: ensure chapter/tags remain valid
      setFilters((prev) => {
        const nextChapter = prev.chapter && !next.chapters.includes(prev.chapter) ? '' : prev.chapter
        const nextTags = prev.tags.filter((t) => next.tags.includes(t))
        return { ...prev, chapter: nextChapter, tags: nextTags }
      })
    } catch (e) {
      console.error('Failed loading filter options', e)
    }
  }, [])

  // Fetch results
  const fetchResults = useCallback(async () => {
    setLoading(true)
    try {
      const { questions, total } = await searchQuestions({
        search: filters.search || undefined,
        book_source: filters.bookSource || undefined,
        chapter_name: filters.chapter || undefined,
        difficulty: (filters.difficulty as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard') || undefined,
        tags: filters.tags.length ? filters.tags : undefined,
        page: filters.page,
        pageSize
      })
      setResults(questions)
      setTotal(total)
      // If current expanded row disappears, collapse
      if (expandedKey != null) {
        const stillExists = questions.some((q) => (q.id ?? q.question_id) === expandedKey)
        if (!stillExists) setExpandedKey(null)
      }
    } catch (e) {
      console.error('Search failed', e)
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [filters, pageSize, expandedKey])

  // Open: load filters + run initial search
  useEffect(() => {
    if (!open) return
    loadOptions(filters.bookSource)
    fetchResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Apply search explicitly via button; auto-run only when page changes
  useEffect(() => {
    if (!open) return
    fetchResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page])

  // When book source changes, reload options (cascade)
  useEffect(() => {
    if (!open) return
    loadOptions(filters.bookSource)
  }, [open, loadOptions, filters.bookSource])

  const filteredTags = useMemo(() => options.tags.filter((t) => t.toLowerCase().includes(tagQuery.toLowerCase())), [options.tags, tagQuery])

  const reset = () => {
    setFilters({ search: '', bookSource: '', chapter: initialChapter || '', difficulty: '', tags: [], page: 1 })
    setTagQuery('')
    setChapterQuery('')
    loadOptions('')
  }

  const applyFilters = () => {
    setFilters((p) => ({ ...p, page: 1 }))
    fetchResults()
  }

  const toggleRow = (q: Question) => {
    const key = (q.id ?? q.question_id) as string | number
    setExpandedKey((k) => (k === key ? null : key))
  }

  const selectAndClose = (q: Question) => {
    onSelect(q)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="w-[90vw] sm:max-w-[90vw] lg:max-w-[1280px] h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Master Question Bank</DialogTitle>
        </DialogHeader>
        {/* Top filter bar */}
        <div className="bg-gray-50 rounded-md border p-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3">
              <Label htmlFor="q-search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="q-search" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} placeholder="Search questions..." className="pl-9" />
              </div>
            </div>
            <div className="md:col-span-3">
              <Label>Book Source</Label>
              <Select value={filters.bookSource || ALL} onValueChange={(v) => setFilters((p) => ({ ...p, bookSource: v === ALL ? '' : v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All Books" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All Books</SelectItem>
                  {options.bookSources.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Label>Chapter</Label>
              <Input placeholder="Filter chapters..." value={chapterQuery} onChange={(e) => setChapterQuery(e.target.value)} className="mb-1" />
              <Select value={filters.chapter || ALL} onValueChange={(v) => setFilters((p) => ({ ...p, chapter: v === ALL ? '' : v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All Chapters" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All Chapters</SelectItem>
                  {options.chapters.filter((c) => c.toLowerCase().includes(chapterQuery.toLowerCase())).map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Difficulty</Label>
              <Select value={filters.difficulty || ALL} onValueChange={(v) => setFilters((p) => ({ ...p, difficulty: v === ALL ? '' : v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All Difficulties" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All Difficulties</SelectItem>
                  {options.difficulties.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-12">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label>Tags</Label>
                  <Input placeholder="Search tags..." value={tagQuery} onChange={(e) => setTagQuery(e.target.value)} className="mt-1 mb-2" />
                  <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                    {filteredTags.map((t) => {
                      const active = filters.tags.includes(t)
                      return (
                        <button key={t} type="button" onClick={() => setFilters((p) => ({ ...p, tags: active ? p.tags.filter((x) => x !== t) : [...p.tags, t] }))} className={`text-xs px-2 py-1 rounded border ${active ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>{t}</button>
                      )
                    })}
                  </div>
                </div>
                <div className="self-end pb-1 flex items-center gap-2">
                  <Button variant="outline" onClick={reset}>Reset</Button>
                  <Button onClick={applyFilters}>Apply Filters</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results list with expandable rows */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">{total} questions found {loading && <span className="ml-2">Loading...</span>}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={filters.page === 1 || loading}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm text-gray-600">Page {filters.page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setFilters((p) => ({ ...p, page: Math.min(totalPages, p.page + 1) }))} disabled={filters.page === totalPages || loading}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {results.length === 0 && !loading && (
            <div className="text-center py-12 text-sm text-gray-500">No questions found.</div>
          )}
          <div className="space-y-2">
            {results.map((q) => {
              const key = (q.id ?? q.question_id) as string | number
              const expanded = expandedKey === key
              return (
                <div key={key} className={`border rounded-md bg-white ${expanded ? 'ring-1 ring-blue-200' : ''}`}>
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => toggleRow(q)} className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">{expanded ? '▲' : '▼'}</button>
                      <span className="font-medium">{q.question_id || q.id}</span>
                      <Badge variant="outline" className="text-[10px]">{q.chapter_name}</Badge>
                      <span className="text-xs text-gray-500">{q.difficulty || '—'}</span>
                    </div>
                    <div>
                      <Button size="sm" className={expanded ? 'bg-blue-600 hover:bg-blue-700' : ''} onClick={() => selectAndClose(q)}>Select</Button>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <div className="text-gray-700 line-clamp-1">{!expanded && <SmartLatexRenderer text={q.question_text} />}</div>
                    {expanded && (
                      <div className="mt-3">
                        <Card className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="mb-4">
                              <h4 className="font-semibold text-gray-900 mb-2">Question:</h4>
                              <div className="prose max-w-none"><SmartLatexRenderer text={q.question_text} /></div>
                            </div>
                            <div className="mb-4">
                              <h5 className="font-medium text-gray-900 mb-2">Options:</h5>
                              <div className="space-y-2">
                                {(Object.keys(q.options || { a: '', b: '', c: '', d: '' }) as Array<'a' | 'b' | 'c' | 'd'>).map((opt) => {
                                  const isCorrect = q.correct_option === opt
                                  const text = (q.options || { a: '', b: '', c: '', d: '' })[opt]
                                  return (
                                    <div key={opt} className={`flex items-start space-x-3 p-2 rounded ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{opt.toUpperCase()}{isCorrect && <Check className="h-3 w-3 ml-1" />}</div>
                                      <div className="flex-1 prose prose-sm max-w-none"><SmartLatexRenderer text={text} /></div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded p-3 text-xs text-gray-600 mb-4">
                              <div className="grid grid-cols-2 gap-2">
                                <div><strong>Book:</strong> {q.book_source || '—'}</div>
                                <div><strong>Question #:</strong> {q.question_number_in_book || '—'}</div>
                                <div><strong>Tags:</strong> {(q.admin_tags || []).join(', ') || '—'}</div>
                                <div><strong>Difficulty:</strong> {q.difficulty || '—'}</div>
                              </div>
                            </div>
                            {q.solution_text && (
                              <div className="mb-2">
                                <h5 className="font-medium text-gray-900 mb-2">Solution:</h5>
                                <div className="prose max-w-none"><SmartLatexRenderer text={q.solution_text} /></div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


