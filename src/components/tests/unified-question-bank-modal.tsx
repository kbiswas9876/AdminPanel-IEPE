'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QuestionExplorer } from '../questions/QuestionExplorer'
import { useQuestionsData } from '@/hooks/useQuestionsData'
import { searchQuestions } from '@/lib/actions/tests'
import type { Question } from '@/lib/types'
import { Check, X } from 'lucide-react'

interface UnifiedQuestionBankModalProps {
  open: boolean
  onClose: () => void
  onSelect?: (question: Question) => void
  onSelectMultiple?: (questions: Question[]) => void
  initialChapter?: string
  multiSelect?: boolean
  title?: string
}

export function UnifiedQuestionBankModal({ 
  open, 
  onClose, 
  onSelect,
  onSelectMultiple,
  initialChapter,
  multiSelect = false,
  title = "Master Question Bank"
}: UnifiedQuestionBankModalProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set())
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch questions when modal opens
  useEffect(() => {
    if (open) {
      setSelectedQuestions(new Set())
      fetchQuestions()
    }
  }, [open])

  const fetchQuestions = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await searchQuestions({
        search: '',
        book_sources: [],
        chapters: initialChapter ? [initialChapter] : [],
        tags: [],
        difficulty: undefined,
        exams: [],
        sort_by: 'id_asc',
        page: 1,
        pageSize: 50 // Load more questions for selection
      })
      setQuestions(result.questions)
    } catch (err) {
      console.error('Error fetching questions:', err)
      setError('Failed to load questions. Please try again.')
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectQuestion = (questionId: number) => {
    const newSelected = new Set(selectedQuestions)
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId)
    } else {
      newSelected.add(questionId)
    }
    setSelectedQuestions(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set())
    } else {
      setSelectedQuestions(new Set(questions.map(q => q.id).filter(id => id !== undefined)))
    }
  }

  const handleConfirmSelection = () => {
    if (multiSelect && onSelectMultiple) {
      const selectedQuestionsList = questions.filter(q => q.id !== undefined && selectedQuestions.has(q.id))
      onSelectMultiple(selectedQuestionsList)
    } else if (!multiSelect && onSelect && selectedQuestions.size === 1) {
      const selectedQuestion = questions.find(q => q.id !== undefined && selectedQuestions.has(q.id))
      if (selectedQuestion) {
        onSelect(selectedQuestion)
      }
    }
    onClose()
  }

  const isAllSelected = questions.length > 0 && selectedQuestions.size === questions.length
  const isPartiallySelected = selectedQuestions.size > 0 && selectedQuestions.size < questions.length

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[96vw] sm:max-w-[96vw] lg:max-w-[96vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {title}
            {multiSelect && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({selectedQuestions.size} selected)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading questions...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <X className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchQuestions} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <Check className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-gray-600">No questions found</p>
              </div>
            </div>
          ) : (
            <QuestionExplorer
              selectedQuestions={selectedQuestions}
              onSelectQuestion={handleSelectQuestion}
              onSelectAll={handleSelectAll}
              isAllSelected={isAllSelected}
              isPartiallySelected={isPartiallySelected}
              showSelectionControls={true}
              questions={questions}
              loading={false}
              error={null}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-t bg-gray-50/50">
          <div className="flex items-center gap-2">
            {selectedQuestions.size > 0 && (
              <span className="text-sm text-gray-600">
                {selectedQuestions.size} question{selectedQuestions.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            
            <Button
              onClick={handleConfirmSelection}
              disabled={selectedQuestions.size === 0 || (!multiSelect && selectedQuestions.size > 1)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Check className="h-4 w-4" />
              {multiSelect ? 'Select Questions' : 'Select Question'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
