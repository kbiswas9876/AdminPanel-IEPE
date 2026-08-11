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
  isMockTest?: boolean
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
  onBackToAnalytics,
  isMockTest = false
}: SolutionReviewStageProps) {
  // Current question index state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [markingScheme, setMarkingScheme] = useState<{ marksPerCorrect: number; negativeMarksPerIncorrect: number } | null>(null)
  const [testName, setTestName] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all')

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

  // Fetch marking scheme and test name for mock tests using server action
  useEffect(() => {
    async function fetchMarkingScheme() {
      if (isMockTest && data.testResult.mock_test_id) {
        try {
          // Use server action instead of direct client fetch
          const { fetchMockTestMarkingScheme } = await import('@/lib/actions/studentAnalyticsActions')
          const scheme = await fetchMockTestMarkingScheme(data.testResult.mock_test_id)
          
          if (scheme) {
            setMarkingScheme({
              marksPerCorrect: scheme.marksPerCorrect,
              negativeMarksPerIncorrect: scheme.negativeMarksPerIncorrect
            })
            // Also fetch test name if available
            if (scheme.testName) {
              setTestName(scheme.testName)
            }
          }
        } catch (error) {
          console.error('Error fetching marking scheme:', error)
        }
      }
    }
    
    fetchMarkingScheme()
  }, [isMockTest, data.testResult.mock_test_id])

  // Reset to first question when data changes
  useEffect(() => {
    setCurrentQuestionIndex(0)
  }, [data])

  // Calculate filtered indices based on status filter
  const filteredIndices = useMemo(() => {
    return sessionData.questions
      .map((_, index) => index)
      .filter(index => {
        if (statusFilter === 'all') return true
        return reviewStates[index]?.status === statusFilter
      })
  }, [sessionData.questions, reviewStates, statusFilter])

  // Ensure current index stays within filtered set
  useEffect(() => {
    if (filteredIndices.length === 0) return
    
    // If current index is not in filtered set, jump to first filtered index
    if (!filteredIndices.includes(currentQuestionIndex)) {
      setCurrentQuestionIndex(filteredIndices[0])
    }
  }, [filteredIndices, currentQuestionIndex])

  // Navigation handlers
  const handlePrev = () => {
    const currentFilteredIndex = filteredIndices.indexOf(currentQuestionIndex)
    if (currentFilteredIndex > 0) {
      setCurrentQuestionIndex(filteredIndices[currentFilteredIndex - 1])
    }
  }

  const handleNext = () => {
    const currentFilteredIndex = filteredIndices.indexOf(currentQuestionIndex)
    if (currentFilteredIndex < filteredIndices.length - 1) {
      setCurrentQuestionIndex(filteredIndices[currentFilteredIndex + 1])
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
            canPrev={filteredIndices.indexOf(currentQuestionIndex) > 0}
            canNext={filteredIndices.indexOf(currentQuestionIndex) < filteredIndices.length - 1}
            filteredPosition={filteredIndices.indexOf(currentQuestionIndex) + 1}
            filteredTotal={filteredIndices.length}
            onBack={onBackToAnalytics}
            markingScheme={markingScheme || undefined}
            testName={testName || undefined}
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
                statusFilter={statusFilter}
                onStatusFilterChange={(filter) => {
                  setStatusFilter(filter)
                  setCurrentQuestionIndex(0)
                }}
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

