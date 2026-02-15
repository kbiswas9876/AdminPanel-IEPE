'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TestQuestionSlot } from '@/lib/types'
import PreviewQuestionDisplay from './PreviewQuestionDisplay'
import PreviewQuestionPalette, { PreviewQuestionStatus } from './PreviewQuestionPalette'
import { ChevronLeft, ChevronRight, X, Clock, Award, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UnifiedTestPreviewProps {
  testName: string
  description?: string
  totalTimeMinutes: number
  marksPerCorrect: number
  penaltyPerIncorrect: number
  questions: TestQuestionSlot[]
  onClose?: () => void
}

export default function UnifiedTestPreview({
  testName,
  description,
  totalTimeMinutes,
  marksPerCorrect,
  penaltyPerIncorrect,
  questions,
  onClose
}: UnifiedTestPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [questionStatuses, setQuestionStatuses] = useState<PreviewQuestionStatus[]>([])
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  // Initialize question statuses
  useEffect(() => {
    const initialStatuses: PreviewQuestionStatus[] = questions.map((_, index) => 
      index === 0 ? 'current' : 'not_visited'
    )
    setQuestionStatuses(initialStatuses)
  }, [questions])

  // Update statuses when currentIndex changes
  useEffect(() => {
    setQuestionStatuses(prev => {
      const newStatuses = [...prev]
      newStatuses.forEach((_, index) => {
        if (index === currentIndex) {
          newStatuses[index] = 'current'
        } else if (selectedAnswers[index]) {
          newStatuses[index] = 'answered'
        } else if (newStatuses[index] === 'current') {
          newStatuses[index] = 'not_visited'
        }
      })
      return newStatuses
    })
  }, [currentIndex, selectedAnswers])

  const handleNavigation = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= questions.length) return
    setCurrentIndex(newIndex)
  }, [questions.length])

  const handleAnswerChange = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: answer
    }))
  }

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      handleNavigation(currentIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      handleNavigation(currentIndex - 1)
    }
  }

  const currentQuestion = questions[currentIndex]
  const totalMarks = questions.length * marksPerCorrect

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading preview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-50">
        <div className="relative px-6 py-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5" />
          
          <div className="relative flex items-center justify-between">
            {/* Test Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <BookOpen className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">{testName}</h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200">
                    Preview Mode
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">
                  Question {currentIndex + 1} of {questions.length}
                </p>
              </div>
            </div>

            {/* Test Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                <Clock className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">{totalTimeMinutes} min</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                <Award className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">{totalMarks} marks</span>
              </div>
            </div>

            {/* Close Button */}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 w-9 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Header with Question Palette Toggle */}
      <div className="lg:hidden flex-shrink-0 z-40 bg-white border-b border-slate-200 dark:border-slate-700 p-4">
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <BookOpen className="h-5 w-5" />
          <span>View Question Palette</span>
        </button>
      </div>

      {/* Main Content - Takes remaining height */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Question Display - Main Content with Proper Scrolling */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Scrollable Question Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-6">
              <PreviewQuestionDisplay
                question={{
                  id: currentQuestion.question.id,
                  question_text: currentQuestion.question.question_text,
                  options: currentQuestion.question.options as Record<string, string>,
                  correct_option: currentQuestion.question.correct_option,
                  difficulty: currentQuestion.question.difficulty as string | undefined
                }}
                questionNumber={currentIndex + 1}
                totalQuestions={questions.length}
                userAnswer={selectedAnswers[currentIndex] || null}
                onAnswerChange={handleAnswerChange}
                isPreviewMode={true}
              />
            </div>
          </div>

          {/* Fixed Navigation Buttons at Bottom */}
          <div className="flex-shrink-0 border-t border-slate-200 bg-white px-6 py-4 shadow-lg">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <Button
                  onClick={handlePreviousQuestion}
                  disabled={currentIndex === 0}
                  variant="outline"
                  className="h-10 px-5 rounded-lg font-medium text-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1.5" />
                  Previous
                </Button>
                <div className="text-sm font-medium text-slate-600">
                  {currentIndex + 1} / {questions.length}
                </div>
                <Button
                  onClick={handleNextQuestion}
                  disabled={currentIndex === questions.length - 1}
                  className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Right Sidebar - Question Palette with Fixed Height */}
        <div className="hidden lg:block w-80 border-l border-slate-200 bg-white flex-shrink-0 overflow-hidden">
          <div className="h-full p-4">
            <PreviewQuestionPalette
              totalQuestions={questions.length}
              currentIndex={currentIndex}
              questionStatuses={questionStatuses}
              onQuestionSelect={handleNavigation}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setShowMobileSidebar(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-80 h-full bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100">
                <h3 className="text-lg font-semibold">Question Navigation</h3>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="h-[calc(100%-73px)] p-4">
                <PreviewQuestionPalette
                  totalQuestions={questions.length}
                  currentIndex={currentIndex}
                  questionStatuses={questionStatuses}
                  onQuestionSelect={(index) => {
                    handleNavigation(index)
                    setShowMobileSidebar(false)
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

