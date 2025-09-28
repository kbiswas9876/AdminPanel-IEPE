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
import { CompactQuestionList } from '../questions/CompactQuestionList'
import { QuestionPreviewPanel } from '../questions/QuestionPreviewPanel'
import { useQuestionsData } from '@/hooks/useQuestionsData'
import { useFilterStore } from '@/stores/filterStore'
import { searchQuestions } from '@/lib/actions/tests'
import type { Question, UIQuestion } from '@/lib/types'
import { Check, X, Filter, FileQuestion, RefreshCw, List, Eye } from 'lucide-react'
import { SourceDestinationQuestionBuilder } from './source-destination-question-builder'

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
  const handleSelectMultiple = (questions: Question[]) => {
    if (multiSelect && onSelectMultiple) {
      onSelectMultiple(questions)
    } else if (!multiSelect && onSelect && questions.length === 1) {
      onSelect(questions[0])
    }
    onClose()
  }

  return (
    <SourceDestinationQuestionBuilder
      open={open}
      onClose={onClose}
      onSelectMultiple={handleSelectMultiple}
      title={title}
    />
  )
}
