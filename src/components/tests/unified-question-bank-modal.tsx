'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QuestionExplorer } from '../shared/question-explorer'
import type { Question } from '@/lib/types'

interface UnifiedQuestionBankModalProps {
  open: boolean
  onClose: () => void
  onSelect: (question: Question) => void
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
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string | number>>(new Set())

  const handleQuestionSelect = (question: Question) => {
    onSelect(question)
    onClose()
  }

  const handleQuestionSelectMultiple = (questions: Question[]) => {
    if (onSelectMultiple) {
      onSelectMultiple(questions)
      onClose()
    }
  }

  const handleSelectionChange = (selected: Set<string | number>) => {
    setSelectedQuestions(selected)
  }

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
          <QuestionExplorer
            actionType={multiSelect ? 'select-multiple' : 'select'}
            onQuestionSelect={handleQuestionSelect}
            onQuestionSelectMultiple={handleQuestionSelectMultiple}
            title=""
            showHeader={false}
            className="h-full"
            multiSelect={multiSelect}
            selectedQuestions={selectedQuestions}
            onSelectionChange={handleSelectionChange}
            initialFilters={initialChapter ? { chapters: [initialChapter] } : undefined}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
