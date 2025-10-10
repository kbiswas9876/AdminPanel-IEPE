'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  BookOpen, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  Award
} from 'lucide-react'
import type { TestQuestionSlot } from '@/lib/types'
import { motion } from 'framer-motion'
import UnifiedTestPreview from './preview/UnifiedTestPreview'

interface TestPreviewModalProps {
  open: boolean
  onClose: () => void
  testName: string
  description?: string
  totalTimeMinutes: number
  marksPerCorrect: number
  penaltyPerIncorrect: number
  questions: TestQuestionSlot[]
}

export function TestPreviewModal({
  open,
  onClose,
  testName,
  description,
  totalTimeMinutes,
  marksPerCorrect,
  penaltyPerIncorrect,
  questions
}: TestPreviewModalProps) {
  const [showInstructions, setShowInstructions] = useState(true)

  const totalQuestions = questions.length
  const totalMarks = totalQuestions * marksPerCorrect

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        unconstrainedWidth
        className="w-[95vw] max-w-[1600px] h-[95vh] p-0 gap-0 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Test Preview - {testName}</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>

        {showInstructions ? (
          /* Instructions Screen */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full h-full overflow-y-auto p-8 flex items-center justify-center"
          >
            <div className="w-full max-w-3xl space-y-6">
              <div className="text-center space-y-3 mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" strokeWidth={2} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{testName}</h1>
                {description && (
                  <p className="text-sm text-gray-600">{description}</p>
                )}
              </div>

              {/* Test Info Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                  <BookOpen className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-900">{totalQuestions}</p>
                  <p className="text-xs text-gray-600">Questions</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                  <Clock className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-900">{totalTimeMinutes}</p>
                  <p className="text-xs text-gray-600">Minutes</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
                  <Award className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-900">{totalMarks}</p>
                  <p className="text-xs text-gray-600">Total Marks</p>
                </div>
              </div>

              {/* Marking Scheme */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Marking Scheme</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Correct:</span>
                    <span className="text-sm font-bold text-green-600">+{marksPerCorrect}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Incorrect:</span>
                    <span className="text-sm font-bold text-red-600">-{penaltyPerIncorrect}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Unattempted:</span>
                    <span className="text-sm font-bold text-gray-600">0</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <h2 className="text-base font-bold text-gray-900">General Instructions</h2>
                </div>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600 flex-shrink-0">1.</span>
                    <span>This test contains <strong>{totalQuestions} questions</strong>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600 flex-shrink-0">2.</span>
                    <span>Each correct answer carries <strong className="text-green-600">+{marksPerCorrect} mark{marksPerCorrect !== 1 ? 's' : ''}</strong>.</span>
                  </li>
                  {penaltyPerIncorrect > 0 && (
                    <li className="flex gap-3">
                      <span className="font-semibold text-blue-600 flex-shrink-0">3.</span>
                      <span>Each incorrect answer will have a penalty of <strong className="text-red-600">-{penaltyPerIncorrect} mark{penaltyPerIncorrect !== 1 ? 's' : ''}</strong>.</span>
                    </li>
                  )}
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600 flex-shrink-0">{penaltyPerIncorrect > 0 ? '4' : '3'}.</span>
                    <span>Total time allotted is <strong>{totalTimeMinutes} minutes</strong>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600 flex-shrink-0">{penaltyPerIncorrect > 0 ? '5' : '4'}.</span>
                    <span>Read each question carefully before answering.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600 flex-shrink-0">{penaltyPerIncorrect > 0 ? '6' : '5'}.</span>
                    <span>You can navigate between questions using the question palette.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600 flex-shrink-0">{penaltyPerIncorrect > 0 ? '7' : '6'}.</span>
                    <span className="text-blue-700 font-semibold">Preview Mode: You can navigate and view all questions, but this is read-only and won't affect the actual test.</span>
                  </li>
                </ol>
              </div>

              <Button
                onClick={() => setShowInstructions(false)}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Start Preview
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Unified Test Preview - Full Height Container */
          <div className="absolute inset-0 overflow-hidden">
            <UnifiedTestPreview
              testName={testName}
              description={description}
              totalTimeMinutes={totalTimeMinutes}
              marksPerCorrect={marksPerCorrect}
              penaltyPerIncorrect={penaltyPerIncorrect}
              questions={questions}
              onClose={onClose}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

