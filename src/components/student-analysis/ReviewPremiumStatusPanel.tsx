'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReviewStatusLegend from './ReviewStatusLegend'

type Question = any
type ReviewStatus = 'correct' | 'incorrect' | 'skipped'

interface ReviewPremiumStatusPanelProps {
  questions: Question[]
  reviewStates: Array<{
    status: ReviewStatus
  }>
  currentIndex: number
  onQuestionSelect: (index: number) => void
  hideInternalToggle?: boolean
  timePerQuestion?: Record<string, number>
}

export default function ReviewPremiumStatusPanel({
  questions,
  reviewStates,
  currentIndex,
  onQuestionSelect,
  hideInternalToggle = false,
  timePerQuestion = {}
}: ReviewPremiumStatusPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const showCollapsed = !hideInternalToggle && isCollapsed

  // Color logic for review mode
  const getQuestionColor = (index: number) => {
    const state = reviewStates[index]
    if (!state) return 'bg-slate-400 text-white border-slate-400'

    switch (state.status) {
      case 'correct':
        return 'bg-green-500 text-white border-green-500'
      case 'incorrect':
        return 'bg-red-500 text-white border-red-500'
      case 'skipped':
      default:
        return 'bg-slate-400 text-white border-slate-400'
    }
  }

  // Calculate counts for review mode
  const correctCount = reviewStates.filter(s => s.status === 'correct').length
  const incorrectCount = reviewStates.filter(s => s.status === 'incorrect').length
  const skippedCount = reviewStates.filter(s => s.status === 'skipped').length

  return (
    <AnimatePresence>
      {!showCollapsed ? (
        <motion.div
          key="panel-visible"
          initial={{ x: '100%', opacity: 0, scale: 0.95 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: '100%', opacity: 0, scale: 0.95 }}
          transition={{ 
            type: 'spring', 
            duration: 0.5, 
            bounce: 0.1,
            ease: "easeOut"
          }}
          className="bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-xl h-full flex flex-col relative overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 z-10 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
              Question Navigator
            </h3>
            <ReviewStatusLegend
              correctCount={correctCount}
              incorrectCount={incorrectCount}
              skippedCount={skippedCount}
            />
          </div>

          {/* Question Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-8 gap-2">
              {questions.map((question, index) => {
                const time = timePerQuestion?.[question.id] ?? 0
                return (
                  <motion.button
                    key={index}
                    onClick={() => onQuestionSelect(index)}
                    className={`
                      relative w-full aspect-square rounded-md border-2 font-bold text-xs transition-all flex items-center justify-center
                      ${getQuestionColor(index)}
                      ${currentIndex === index 
                        ? 'ring-2 ring-blue-500 dark:ring-blue-400 scale-105' 
                        : 'hover:scale-105 hover:shadow-md'
                      }
                    `}
                    whileHover={{ scale: currentIndex === index ? 1.05 : 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    title={`Question ${index + 1}: ${reviewStates[index]?.status || 'unknown'}${time ? ` (${time}s)` : ''}`}
                  >
                    <span className="relative z-10">{index + 1}</span>
                    {currentIndex === index && (
                      <motion.div
                        className="absolute inset-0 rounded-md border-2 border-blue-500 dark:border-blue-400"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    {/* Subtle time indicator */}
                    {time > 0 && (
                      <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-white/40"></div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Footer Summary */}
          <div className="sticky bottom-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-2 shadow-sm">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">
              {currentIndex + 1} / {questions.length}
            </div>
          </div>
        </motion.div>
      ) : (
        // Collapsed state
        <motion.button
          key="panel-collapsed"
          onClick={() => setIsCollapsed(false)}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.08, y: -1 }}
          whileTap={{ scale: 0.96 }}
        >
          <svg className="w-5 h-5 mx-auto text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

