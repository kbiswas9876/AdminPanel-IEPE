'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SolutionUnifiedHeader from './SolutionUnifiedHeader'
import QuestionCard from './QuestionCard'
import QuestionDetails from './QuestionDetails'
import SolutionNavigationFooter from './SolutionNavigationFooter'
import KatexRenderer from '../ui/KatexRenderer'
import type { TestResult, AnswerLog, Question } from '@/lib/types/analytics'

interface SessionDataInput {
  testResult?: TestResult
  answerLog: AnswerLog[]
  questions: Question[]
  enrichedAnswers?: Array<{
    answer_log: AnswerLog
    question: Question
    marksPerCorrect?: number
    penaltyPerIncorrect?: number
    // ... other fields
  }>
}

interface SolutionQuestionDisplayWindowProps {
  session: SessionDataInput
  currentIndex: number
  onPrev: () => void
  onNext: () => void
  canPrev?: boolean
  canNext?: boolean
  filteredPosition?: number
  filteredTotal?: number
  onBack?: () => void
  children?: React.ReactNode
  markingScheme?: {
    marksPerCorrect: number
    negativeMarksPerIncorrect: number
  }
  testName?: string
}

const SolutionQuestionDisplayWindow: React.FC<SolutionQuestionDisplayWindowProps> = ({
  session,
  currentIndex,
  onPrev,
  onNext,
  canPrev,
  canNext,
  filteredPosition,
  filteredTotal,
  onBack,
  children,
  markingScheme,
  testName
}) => {
  // Derive per-question marking scheme from enriched answers if available
  const currentEnrichedAnswer = session.enrichedAnswers?.[currentIndex]
  const questionMarkingScheme = currentEnrichedAnswer?.marksPerCorrect !== undefined && currentEnrichedAnswer?.penaltyPerIncorrect !== undefined
    ? {
        marksPerCorrect: currentEnrichedAnswer.marksPerCorrect!,
        negativeMarksPerIncorrect: currentEnrichedAnswer.penaltyPerIncorrect!
      }
    : markingScheme // Fall back to global marking scheme
  const [isLoaded, setIsLoaded] = useState(false)
  const [showSolution, setShowSolution] = useState(true)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const totalQuestions = session.questions.length
  const question = session.questions[currentIndex]

  const answerLogEntry: AnswerLog | undefined = question
    ? session.answerLog.find((a) => a.question_id === question.id)
    : undefined

  const status = (answerLogEntry?.status ?? 'skipped') as 'correct' | 'incorrect' | 'skipped'
  const userAnswerKey = answerLogEntry?.user_answer ?? null
  const timeTakenSeconds = answerLogEntry?.time_taken ?? 0

  const displayPosition = filteredPosition ?? (currentIndex + 1)
  const displayTotal = filteredTotal ?? totalQuestions

  if (!question) {
    return (
      <div className="flex flex-col h-full">
        <SolutionUnifiedHeader
          currentQuestion={currentIndex + 1}
          totalQuestions={totalQuestions}
          timeTakenSeconds={0}
          status="skipped"
          difficulty={null}
          isBookmarked={false}
          onBack={onBack}
          showBookmark={false}
          markingScheme={questionMarkingScheme}
        />
        <main className="flex-1 p-8">
          <div className="text-slate-600 dark:text-slate-300">No question available.</div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <SolutionUnifiedHeader
        currentQuestion={displayPosition}
        totalQuestions={displayTotal}
        timeTakenSeconds={timeTakenSeconds}
        status={status}
        difficulty={question.difficulty}
        isBookmarked={false}
        onBack={onBack}
        showBookmark={false}
        markingScheme={questionMarkingScheme}
      />

      {/* Main Content Area - Scrollable */}
      <main className={`flex-1 overflow-y-auto p-8 ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Question Card */}
          <QuestionCard 
            questionText={question.question_text}
          />
          
          {/* Answer Options Display */}
          <div className="space-y-3">
            {question.options && Object.entries(question.options).map(([key, value]) => {
              const isCorrect = key === question.correct_option
              const isUserChoice = userAnswerKey === key
              const isIncorrectChoice = isUserChoice && !isCorrect
              
              const baseClasses = 'block p-4 rounded-xl transition-all duration-200'
              const stateClasses = isCorrect
                ? 'bg-green-600'
                : isIncorrectChoice
                  ? 'bg-red-600'
                  : 'bg-white dark:bg-slate-800'
              
              return (
                <motion.div
                  key={key}
                  className={`${baseClasses} ${stateClasses}`}
                  style={{ boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)' }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                      ${isCorrect ? 'bg-white border-green-600 text-green-600'
                        : isIncorrectChoice ? 'bg-white border-red-600 text-red-600'
                        : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'}
                    `}>
                      <span className="text-sm font-bold">{key}</span>
                    </div>

                    <div className="flex-1 min-h-0">
                      <KatexRenderer
                        content={value as string}
                        className={`text-base leading-relaxed ${
                          isCorrect || isIncorrectChoice 
                            ? 'text-white'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      />
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {isCorrect && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-md text-xs font-medium bg-white/20 text-white">
                            Correct
                          </span>
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {isIncorrectChoice && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-md text-xs font-medium bg-white/20 text-white">
                            Student Answer
                          </span>
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Question Details */}
          <QuestionDetails 
            source={question.book_source || undefined}
            tags={question.chapter_name ? [question.chapter_name] : undefined}
          />

          {/* Solution Box */}
          {question.solution_text && (
            <div className="mt-6">
              <motion.button
                onClick={() => setShowSolution((prev) => !prev)}
                className={`
                  group w-full flex items-center justify-between px-5 py-3 rounded-xl border transition-colors duration-200 shadow-sm
                  ${showSolution 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500'
                  }
                `}
                aria-expanded={showSolution}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                    ${showSolution 
                      ? 'bg-white/20 text-white' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    }
                  `}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold">Solution</span>
                </div>
                <svg 
                  className={`w-5 h-5 transform transition-transform duration-200 ${showSolution ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>

              {showSolution && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
                >
                  <KatexRenderer
                    content={question.solution_text}
                    className="text-slate-800 dark:text-slate-200 leading-relaxed"
                  />
                </motion.div>
              )}
            </div>
          )}

          {/* Additional children content (e.g., SRS feedback controls) */}
          {children}
        </div>
      </main>

      {/* Fixed Footer */}
      <SolutionNavigationFooter
        onPrev={onPrev}
        onNext={onNext}
        canPrev={canPrev ?? false}
        canNext={canNext ?? false}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        filteredPosition={filteredPosition}
        filteredTotal={filteredTotal}
        testName={testName}
      />
    </div>
  )
}

export default SolutionQuestionDisplayWindow

