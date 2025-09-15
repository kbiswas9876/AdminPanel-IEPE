'use client'

import React, { useState, useEffect } from 'react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Check, 
  X, 
  Tag,
  Save
} from 'lucide-react'
import { ParsedQuestion } from '@/lib/utils/bulk-upload-parsers'
import { toast } from 'sonner'

interface BulkUploadEditModalProps {
  open: boolean
  onClose: () => void
  question: ParsedQuestion | null
  questionIndex: number
  onSave: (question: ParsedQuestion, index: number) => void
  availableBooks: string[]
  availableChapters: string[]
  availableTags: string[]
}

export default function BulkUploadEditModal({
  open,
  onClose,
  question,
  questionIndex,
  onSave,
  availableBooks,
  availableChapters,
  availableTags: _availableTags
}: BulkUploadEditModalProps) {
  const [formData, setFormData] = useState<Partial<ParsedQuestion>>({})
  const [newTag, setNewTag] = useState('')
  const [isAddingTag, setIsAddingTag] = useState(false)

  // Initialize form data when question changes
  useEffect(() => {
    if (question) {
      setFormData({
        book_source: question.book_source || '',
        chapter_name: question.chapter_name || '',
        question_number_in_book: question.question_number_in_book || 1,
        question_text: question.question_text || '',
        options: question.options || { a: '', b: '', c: '', d: '' },
        correct_option: question.correct_option || 'a',
        solution_text: question.solution_text || '',
        exam_metadata: question.exam_metadata || '',
        admin_tags: question.admin_tags || [],
        question_id: question.question_id || ''
      })
    }
  }, [question])

  const handleSave = () => {
    if (!formData.book_source || !formData.chapter_name || !formData.question_text) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!formData.options || Object.values(formData.options).some(opt => !opt.trim())) {
      toast.error('Please fill in all options')
      return
    }

    if (!formData.correct_option || !formData.options[formData.correct_option]) {
      toast.error('Please select a valid correct option')
      return
    }

    const updatedQuestion: ParsedQuestion = {
      book_source: formData.book_source,
      chapter_name: formData.chapter_name,
      question_number_in_book: formData.question_number_in_book || 1,
      question_text: formData.question_text,
      options: formData.options,
      correct_option: formData.correct_option,
      solution_text: formData.solution_text || '',
      exam_metadata: formData.exam_metadata || '',
      admin_tags: formData.admin_tags || [],
      question_id: formData.question_id || ''
    }

    onSave(updatedQuestion, questionIndex)
    onClose()
    toast.success('Question updated successfully')
  }

  const handleOptionChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: value
      }
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.admin_tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        admin_tags: [...(prev.admin_tags || []), newTag.trim()]
      }))
      setNewTag('')
      setIsAddingTag(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      admin_tags: prev.admin_tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const addNewBook = () => {
    const bookName = prompt('Enter new book name:')
    if (bookName && bookName.trim()) {
      setFormData(prev => ({
        ...prev,
        book_source: bookName.trim()
      }))
    }
  }

  const addNewChapter = () => {
    const chapterName = prompt('Enter new chapter name:')
    if (chapterName && chapterName.trim()) {
      setFormData(prev => ({
        ...prev,
        chapter_name: chapterName.trim()
      }))
    }
  }

  if (!question) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question {questionIndex + 1}</DialogTitle>
          <DialogDescription>
            Make changes to the question and click save to update it in the upload batch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Book Source */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Book Source *</label>
            <div className="flex gap-2">
              <Select value={formData.book_source} onValueChange={(value) => setFormData(prev => ({ ...prev, book_source: value }))}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select book" />
                </SelectTrigger>
                <SelectContent>
                  {availableBooks.map(book => (
                    <SelectItem key={book} value={book}>{book}</SelectItem>
                  ))}
                  <SelectItem value="__add_new__" onSelect={addNewBook}>
                    + Add New Book
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chapter Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Chapter Name *</label>
            <div className="flex gap-2">
              <Select value={formData.chapter_name} onValueChange={(value) => setFormData(prev => ({ ...prev, chapter_name: value }))}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {availableChapters.map(chapter => (
                    <SelectItem key={chapter} value={chapter}>{chapter}</SelectItem>
                  ))}
                  <SelectItem value="__add_new__" onSelect={addNewChapter}>
                    + Add New Chapter
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Question Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Question Number in Book *</label>
            <Input
              type="number"
              value={formData.question_number_in_book || 1}
              onChange={(e) => setFormData(prev => ({ ...prev, question_number_in_book: parseInt(e.target.value) || 1 }))}
              min="1"
            />
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Question Text *</label>
            <Textarea
              value={formData.question_text || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
              placeholder="Enter the question text..."
              rows={4}
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Options *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['a', 'b', 'c', 'd'].map(option => (
                <div key={option} className="space-y-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Option {option.toUpperCase()}
                    {formData.correct_option === option && (
                      <Badge variant="default" className="text-xs">Correct</Badge>
                    )}
                  </label>
                  <Textarea
                    value={formData.options?.[option] || ''}
                    onChange={(e) => handleOptionChange(option, e.target.value)}
                    placeholder={`Enter option ${option.toUpperCase()}...`}
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Correct Option */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Correct Option *</label>
            <Select value={formData.correct_option} onValueChange={(value) => setFormData(prev => ({ ...prev, correct_option: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select correct option" />
              </SelectTrigger>
              <SelectContent>
                {['a', 'b', 'c', 'd'].map(option => (
                  <SelectItem key={option} value={option}>
                    Option {option.toUpperCase()}: {formData.options?.[option]?.substring(0, 50)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Solution Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Solution Text</label>
            <Textarea
              value={formData.solution_text || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, solution_text: e.target.value }))}
              placeholder="Enter the solution explanation..."
              rows={4}
            />
          </div>

          {/* Exam Metadata */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Exam Metadata</label>
            <Input
              value={formData.exam_metadata || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, exam_metadata: e.target.value }))}
              placeholder="e.g., CAT 2023 Slot 1"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.admin_tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              
              {!isAddingTag ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingTag(true)}
                  className="flex items-center gap-2"
                >
                  <Tag className="h-4 w-4" />
                  Add Tag
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tag name..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" size="sm" onClick={addTag}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsAddingTag(false)
                      setNewTag('')
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
