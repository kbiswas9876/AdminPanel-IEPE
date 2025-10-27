'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SolutionQuestionDisplayWindow from './SolutionQuestionDisplayWindow'
import ReviewPremiumStatusPanel from './ReviewPremiumStatusPanel'
import { 
  enrichedTestResultToAnalysisData, 
  buildTimePerQuestionMap, 
  buildReviewStates 
} from '@/lib/adapters/studentPortalDataAdapter'
import type { EnrichedTestResult } from '@/lib/types/analytics'

interface SolutionReviewStageProps {
  data: EnrichedTestResult
  onBackToAnalytics: () => void
}

/**
 * Stage 2: Solution Review View
 * 
 * Replicates the layout from student-portal/src/app/analysis/[resultId]/solutions/page.tsx
 * - Left panel: Main question display
 * - Right panel: Question palette with navigation
 */
export default function SolutionReviewStage({
  data,
  onBackToAnalytics
}: SolutionReviewStageProps) {
  // Current question index state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)

  // Transform data for solution review components
  const sessionData = useMemo(() => {
    return enrichedTestResultToAnalysisData(data)
  }, [data])

  const timePerQuestion = useMemo(() => {
    return buildTimePerQuestionMap(data)
  }, [data])

  const reviewStates = useMemo(() => {
    return buildReviewStates(data)
  }, [data])

  // Reset to first question when data changes
  useEffect(() => {
    setCurrentQuestionIndex(0)
  }, [data])

  // Navigation handlers
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < sessionData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const totalQuestions = sessionData.questions.length

  return (
    <motion.div
      key="solutions-stage"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col"
    >
      {/* Main Content Area - Two Column Layout */}
      <div className="flex-1 flex gap-0 overflow-hidden h-full">
        {/* Left Column: Question Display */}
        <div className={`transition-all duration-300 ${isRightPanelCollapsed ? 'w-full' : 'w-3/4'} h-full`}>
          <SolutionQuestionDisplayWindow
            session={sessionData}
            currentIndex={currentQuestionIndex}
            onPrev={handlePrev}
            onNext={handleNext}
            canPrev={currentQuestionIndex > 0}
            canNext={currentQuestionIndex < totalQuestions - 1}
            filteredPosition={currentQuestionIndex + 1}
            filteredTotal={totalQuestions}
            onBack={onBackToAnalytics}
          />
        </div>

        {/* Right Column: Question Palette */}
        <AnimatePresence>
          {!isRightPanelCollapsed && (
            <motion.div 
              className="w-1/4 h-full border-l border-slate-200 dark:border-slate-700"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '25%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ReviewPremiumStatusPanel
                questions={sessionData.questions}
                reviewStates={reviewStates}
                currentIndex={currentQuestionIndex}
                onQuestionSelect={(index: number) => setCurrentQuestionIndex(index)}
                hideInternalToggle={false}
                timePerQuestion={timePerQuestion}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button when panel is collapsed */}
        {isRightPanelCollapsed && (
          <motion.button
            onClick={() => setIsRightPanelCollapsed(false)}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg hover:shadow-xl transition-all"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.08, y: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            <svg className="w-5 h-5 mx-auto text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

