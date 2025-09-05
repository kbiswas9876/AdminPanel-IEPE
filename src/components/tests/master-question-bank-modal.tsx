'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { searchQuestions } from '@/lib/actions/tests'
import type { Question } from '@/lib/supabase/admin'

interface MasterQuestionBankModalProps {
  open: boolean
  onClose: () => void
  onSelect: (q: Question) => void
  initialChapter?: string
}

export function MasterQuestionBankModal({ open, onClose, onSelect, initialChapter }: MasterQuestionBankModalProps) {
  const [search, setSearch] = useState('')
  const [bookSource, setBookSource] = useState('')
  const [chapterName, setChapterName] = useState(initialChapter || '')
  const [difficulty, setDifficulty] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { questions, total } = await searchQuestions({
        search,
        book_source: bookSource || undefined,
        chapter_name: chapterName || undefined,
        difficulty: (difficulty as any) || undefined,
        page,
        pageSize,
      })
      setQuestions(questions)
      setTotal(total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Master Question Bank</DialogTitle>
          <DialogDescription>Search and select a question to override the current slot.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <Label>Search</Label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ID or text" />
          </div>
          <div className="space-y-2">
            <Label>Book Source</Label>
            <Input value={bookSource} onChange={(e) => setBookSource(e.target.value)} placeholder="e.g., PIN6800" />
          </div>
          <div className="space-y-2">
            <Label>Chapter</Label>
            <Input value={chapterName} onChange={(e) => setChapterName(e.target.value)} placeholder="e.g., Percentage" />
          </div>
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Input value={difficulty} onChange={(e) => setDifficulty(e.target.value)} placeholder="Easy/Moderate/Hard" />
          </div>
          <div className="md:col-span-4">
            <Button onClick={() => { setPage(1); fetchData() }}>Apply Filters</Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>Loading...</TableCell>
                </TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No questions found.</TableCell>
                </TableRow>
              ) : (
                questions.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell>{q.question_id}</TableCell>
                    <TableCell className="max-w-xl truncate">{q.question_text}</TableCell>
                    <TableCell>{q.chapter_name}</TableCell>
                    <TableCell>{(q as any).difficulty || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => { onSelect(q); onClose() }}>Select</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <div className="space-x-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


