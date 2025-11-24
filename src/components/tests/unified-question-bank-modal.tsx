'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QuestionExplorer } from '../questions/QuestionExplorer'
import type { Question } from '@/lib/types'

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
  const [selectedQuestions] = useState<Set<string | number>>(new Set())


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
          <QuestionExplorer />
        </div>
      </DialogContent>
    </Dialog>
  )
}
