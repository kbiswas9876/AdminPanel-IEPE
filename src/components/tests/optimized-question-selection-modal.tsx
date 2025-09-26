'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Search,
  Check,
  X,
  Filter,
  ChevronDown,
  BookOpen,
  Target,
  Tag,
  Zap,
  ArrowUpDown,
  Database,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UniversalContentRenderer } from '@/components/editors/UniversalContentRenderer'
import { getFilterOptions, searchQuestions } from '@/lib/actions/tests'
import type { Question } from '@/lib/types'
import { SourceDestinationQuestionBuilder } from './source-destination-question-builder'

interface OptimizedQuestionSelectionModalProps {
  open: boolean
  onClose: () => void
  onSelectMultiple: (questions: Question[]) => void
  title?: string
}

export function OptimizedQuestionSelectionModal({
  open,
  onClose,
  onSelectMultiple,
  title = "Select Questions for Test"
}: OptimizedQuestionSelectionModalProps) {
  const router = useRouter()

  const handleSelectMultiple = (questions: Question[]) => {
    // Store the selected questions in localStorage for the Review & Refine page
    localStorage.setItem('selectedTestQuestions', JSON.stringify(questions))
    
    // Navigate to the Review & Refine page
    router.push('/tests/review-and-refine')
    
    // Call the original callback
    onSelectMultiple(questions)
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