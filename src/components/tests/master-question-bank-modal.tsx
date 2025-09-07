'use client'

import type { Question } from '@/lib/types'
import { EnhancedMasterQuestionBankModal } from './enhanced-master-question-bank-modal'

interface MasterQuestionBankModalProps {
  open: boolean
  onClose: () => void
  onSelect: (q: Question) => void
  initialChapter?: string
}

export function MasterQuestionBankModal({ open, onClose, onSelect, initialChapter }: MasterQuestionBankModalProps) {
  return (
    <EnhancedMasterQuestionBankModal
      open={open}
      onClose={onClose}
      onSelect={onSelect}
      initialChapter={initialChapter}
    />
  )
}


