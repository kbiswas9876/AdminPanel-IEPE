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
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  Circle,
  Award
} from 'lucide-react'
import type { TestQuestionSlot } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { UniversalContentRenderer } from '@/components/editors/UniversalContentRenderer'

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showInstructions, setShowInstructions] = useState(true)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})

  const totalQuestions = questions.length
  const totalMarks = totalQuestions * marksPerCorrect
  const currentQuestion = questions[currentQuestionIndex]

  // Debug logging
  console.log('Test Preview Modal Data:', {
    testName,
    totalQuestions,
    currentQuestionIndex,
    currentQuestion: currentQuestion ? {
      question_text: currentQuestion.question.question_text,
      options: currentQuestion.question.options,
      chapter: currentQuestion.chapter_name
    } : 'No current question'
  })

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleOptionSelect = (optionKey: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionKey
    })
  }

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const getQuestionStatus = (index: number) => {
    if (selectedAnswers[index]) return 'answered'
    if (index === currentQuestionIndex) return 'current'
    return 'unanswered'
  }

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

        {/* Header */}
        <div className="relative bg-white border-b border-gray-200 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5" />
          
          <div className="relative px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Test Info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Eye className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{testName}</h2>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0 font-medium">
                      Preview Mode
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">Student view • Not a real test attempt</p>
                </div>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 w-9 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Sidebar - Question Navigation */}
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
            <div className="p-4 space-y-4">
              {/* Test Stats */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-blue-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-600">Total Questions</p>
                    <p className="text-lg font-bold text-blue-900">{totalQuestions}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-amber-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-600">Duration</p>
                    <p className="text-lg font-bold text-amber-900">{totalTimeMinutes} min</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Award className="h-5 w-5 text-emerald-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-600">Total Marks</p>
                    <p className="text-lg font-bold text-emerald-900">{totalMarks}</p>
                  </div>
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

              {/* Question Grid */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index)
                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleJumpToQuestion(index)}
                        className={`
                          relative h-10 rounded-lg font-semibold text-sm transition-all duration-200
                          ${status === 'current' ? 'bg-blue-500 text-white shadow-lg scale-105 ring-2 ring-blue-300' : ''}
                          ${status === 'answered' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : ''}
                          ${status === 'unanswered' ? 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200' : ''}
                        `}
                        whileHover={{ scale: status !== 'current' ? 1.05 : 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {index + 1}
                        {status === 'answered' && (
                          <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-emerald-600 bg-white rounded-full" />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Question Display */}
          <div className="flex-1 overflow-y-auto bg-gray-50/30">
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
              /* Question Display */
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full p-6 space-y-4 overflow-y-auto"
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-100 text-blue-700 border-0 px-3 py-1.5 text-sm font-semibold">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                      </Badge>
                      {currentQuestion.customMarking && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0 px-3 py-1.5 text-sm font-semibold">
                          +{currentQuestion.customMarking.marksPerCorrect} / -{currentQuestion.customMarking.penaltyPerIncorrect}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="prose prose-base max-w-none text-gray-900">
                      {currentQuestion.question.question_text ? (
                        <UniversalContentRenderer text={currentQuestion.question.question_text} />
                      ) : (
                        <p className="text-gray-500 italic">No question text available</p>
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {Object.entries(currentQuestion.question.options || {}).map(([key, value]) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === key
                      return (
                        <motion.button
                          key={key}
                          onClick={() => handleOptionSelect(key)}
                          className={`
                            w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                            ${isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                            }
                          `}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`
                              flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5
                              ${isSelected 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300 bg-white'
                              }
                            `}>
                              {isSelected ? (
                                <CheckCircle className="h-4 w-4 text-white" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-gray-700">{key.toUpperCase()}.</span>
                              </div>
                              <div className="prose prose-sm max-w-none text-gray-900">
                                {value ? (
                                  <UniversalContentRenderer text={value} />
                                ) : (
                                  <span className="text-gray-400 italic">Empty option</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      variant="outline"
                      className="h-10 px-5 rounded-lg font-medium text-sm"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1.5" />
                      Previous
                    </Button>
                    <Button
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === totalQuestions - 1}
                      className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

