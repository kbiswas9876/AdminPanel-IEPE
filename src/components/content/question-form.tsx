'use client'

import { useState, useEffect } from 'react'
import { getBookSourceNames } from '@/lib/actions/book-sources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Question } from '@/lib/supabase/admin'

interface QuestionFormProps {
  question?: Question
  isEditing?: boolean
  onSubmit: (formData: FormData) => void
}

export function QuestionForm({ question, isEditing = false, onSubmit }: QuestionFormProps) {
  const [bookSources, setBookSources] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookSources = async () => {
      try {
        const sources = await getBookSourceNames()
        setBookSources(sources)
      } catch (error) {
        console.error('Error fetching book sources:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookSources()
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    onSubmit(formData)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/content">
          <Button variant="ghost" size="sm" className="w-fit">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Content
          </Button>
        </Link>
        <h1 className="mobile-text-xl font-bold text-gray-900">
          {isEditing ? 'Edit Question' : 'Add New Question'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
          <CardDescription>
            {isEditing ? 'Update the question information below.' : 'Fill in the question information below.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mobile-form-grid gap-6">
              {/* Question ID */}
              <div className="space-y-2">
                <Label htmlFor="question_id">Question ID *</Label>
                <Input
                  id="question_id"
                  name="question_id"
                  defaultValue={question?.question_id || ''}
                  placeholder="e.g., PIN6800_PER_1"
                  className="mobile-input"
                  required
                />
              </div>

              {/* Book Source */}
              <div className="space-y-2">
                <Label htmlFor="book_source">Book Source *</Label>
                <Select name="book_source" defaultValue={question?.book_source || ''} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a book source" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookSources.length === 0 ? (
                      <SelectItem value="" disabled>
                        No books available. Add books in Book Manager first.
                      </SelectItem>
                    ) : (
                      bookSources.filter(Boolean).map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Chapter Name */}
              <div className="space-y-2">
                <Label htmlFor="chapter_name">Chapter Name *</Label>
                <Input
                  id="chapter_name"
                  name="chapter_name"
                  defaultValue={question?.chapter_name || ''}
                  placeholder="e.g., Percentage"
                  className="mobile-input"
                  required
                />
              </div>

              {/* Question Number in Book */}
              <div className="space-y-2">
                <Label htmlFor="question_number_in_book">Question Number in Book</Label>
                <Input
                  id="question_number_in_book"
                  name="question_number_in_book"
                  type="number"
                  defaultValue={question?.question_number_in_book || ''}
                  placeholder="e.g., 1"
                  className="mobile-input"
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <Label htmlFor="question_text">Question Text *</Label>
              <Textarea
                id="question_text"
                name="question_text"
                defaultValue={question?.question_text || ''}
                placeholder="Enter the question text..."
                rows={4}
                className="mobile-input"
                required
              />
            </div>

            {/* Options */}
            <div className="space-y-4">
              <Label>Options</Label>
              <div className="mobile-form-grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="option_a">Option A</Label>
                  <Input
                    id="option_a"
                    name="option_a"
                    defaultValue={question?.options?.a || ''}
                    placeholder="Option A text"
                    className="mobile-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="option_b">Option B</Label>
                  <Input
                    id="option_b"
                    name="option_b"
                    defaultValue={question?.options?.b || ''}
                    placeholder="Option B text"
                    className="mobile-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="option_c">Option C</Label>
                  <Input
                    id="option_c"
                    name="option_c"
                    defaultValue={question?.options?.c || ''}
                    placeholder="Option C text"
                    className="mobile-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="option_d">Option D</Label>
                  <Input
                    id="option_d"
                    name="option_d"
                    defaultValue={question?.options?.d || ''}
                    placeholder="Option D text"
                    className="mobile-input"
                  />
                </div>
              </div>
            </div>

            <div className="mobile-form-grid gap-6">
              {/* Correct Option */}
              <div className="space-y-2">
                <Label htmlFor="correct_option">Correct Option</Label>
                <Select name="correct_option" defaultValue={question?.correct_option || ''}>
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

              {/* Exam Metadata */}
              <div className="space-y-2">
                <Label htmlFor="exam_metadata">Exam Metadata</Label>
                <Input
                  id="exam_metadata"
                  name="exam_metadata"
                  defaultValue={question?.exam_metadata || ''}
                  placeholder="e.g., CAT 2023, Slot 1"
                  className="mobile-input"
                />
              </div>
            </div>

            {/* Solution Text */}
            <div className="space-y-2">
              <Label htmlFor="solution_text">Solution Text</Label>
              <Textarea
                id="solution_text"
                name="solution_text"
                defaultValue={question?.solution_text || ''}
                placeholder="Enter the solution explanation..."
                rows={4}
                className="mobile-input"
              />
            </div>

            {/* Admin Tags */}
            <div className="space-y-2">
              <Label htmlFor="admin_tags">Admin Tags</Label>
              <Input
                id="admin_tags"
                name="admin_tags"
                defaultValue={question?.admin_tags?.join(', ') || ''}
                placeholder="e.g., Election Based, Successive Discount"
                className="mobile-input"
              />
              <p className="text-sm text-gray-500">
                Enter tags separated by commas
              </p>
            </div>

            {/* Form Actions */}
            <div className="mobile-button-group pt-6">
              <Button type="submit" className="touch-target">
                {isEditing ? 'Save Changes' : 'Save Question'}
              </Button>
              <Link href="/content">
                <Button type="button" variant="outline" className="touch-target">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
