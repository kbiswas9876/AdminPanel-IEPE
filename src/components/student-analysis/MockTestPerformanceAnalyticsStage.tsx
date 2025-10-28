'use client'

import React, { useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import MockTestKPICards from './MockTestKPICards'
import ChapterWisePerformanceTable, { type ChapterPerformance } from './ChapterWisePerformanceTable'
import PrimaryActionButton from './PrimaryActionButton'
import type { EnrichedTestResult } from '@/lib/types/analytics'
import { enrichedTestResultToSessionResult } from '@/lib/adapters/studentPortalDataAdapter'
import { getMockTestCompetitiveMetrics } from '@/lib/actions/studentAnalyticsActions'

interface MockTestPerformanceAnalyticsStageProps {
  data: EnrichedTestResult
  onNavigateToSolutions: () => void
  userId: string
}

/**
 * Stage 1 for Mock Tests: Competitive Performance Analytics
 * 
 * This stage differs from Practice Sessions by emphasizing:
 * - Score, Rank, Percentile (competitive metrics)
 * - Chapter-wise breakdown is secondary
 */
export default function MockTestPerformanceAnalyticsStage({
  data,
  onNavigateToSolutions,
  userId
}: MockTestPerformanceAnalyticsStageProps) {
  const [competitiveMetrics, setCompetitiveMetrics] = React.useState<any>(null)
  const [loadingMetrics, setLoadingMetrics] = React.useState(true)
  const [testName, setTestName] = React.useState<string | null>(null)
  const hasFetchedRef = useRef(false) // Track if we've already fetched

  // Fetch competitive metrics and test name on mount (only once)
  useEffect(() => {
    // Skip if we've already fetched
    if (hasFetchedRef.current) return
    
    async function fetchMetrics() {
      hasFetchedRef.current = true
      setLoadingMetrics(true)
      try {
        const metrics = await getMockTestCompetitiveMetrics(data.testResult.id, userId)
        setCompetitiveMetrics(metrics)
        
        // Fetch test name
        if (data.testResult.mock_test_id) {
          const { fetchMockTestMarkingScheme } = await import('@/lib/actions/studentAnalyticsActions')
          const scheme = await fetchMockTestMarkingScheme(data.testResult.mock_test_id)
          if (scheme?.testName) {
            setTestName(scheme.testName)
          }
        }
      } catch (error) {
        console.error('Error fetching competitive metrics:', error)
      } finally {
        setLoadingMetrics(false)
      }
    }

    fetchMetrics()
  }, [data.testResult.id, data.testResult.mock_test_id, userId])

  // Transform data to SessionResult format for chapter analysis
  const sessionResult = useMemo(() => {
    return enrichedTestResultToSessionResult(data)
  }, [data])

  // Calculate chapter breakdown from enriched answers
  const chapters: ChapterPerformance[] = useMemo(() => {
    const chapterMap = new Map()
    
    data.enrichedAnswers.forEach(({ answer_log, question }) => {
      const chapter = question.chapter_name || 'Unknown'
      
      if (!chapterMap.has(chapter)) {
        chapterMap.set(chapter, {
          chapterName: chapter,
          totalQuestions: 0,
          attempted: 0,
          correct: 0,
          incorrect: 0,
          totalTime: 0
        })
      }
      
      const stats = chapterMap.get(chapter)
      stats.totalQuestions++
      
      if (answer_log.status !== 'skipped') {
        stats.attempted++
        stats.totalTime += answer_log.time_taken
      }
      
      if (answer_log.status === 'correct') {
        stats.correct++
      } else if (answer_log.status === 'incorrect') {
        stats.incorrect++
      }
    })
    
    // Convert map to array and calculate final metrics
    return Array.from(chapterMap.values()).map(chapter => ({
      chapterName: chapter.chapterName,
      totalQuestions: chapter.totalQuestions,
      attempted: chapter.attempted,
      correct: chapter.correct,
      incorrect: chapter.incorrect,
      accuracy: chapter.totalQuestions > 0 ? (chapter.correct / chapter.totalQuestions) * 100 : 0,
      timePerQuestion: chapter.attempted > 0 ? Math.round(chapter.totalTime / chapter.attempted) : 0
    }))
  }, [data.enrichedAnswers])

  // Prepare metrics for MockTestKPICards
  const kpiMetrics = useMemo(() => {
    if (!competitiveMetrics) {
      return null
    }

    return {
      totalQuestions: data.testResult.total_questions || 0,
      attempted: (data.testResult.total_correct || 0) + (data.testResult.total_incorrect || 0) + (data.testResult.total_skipped || 0),
      correct: data.testResult.total_correct || 0,
      incorrect: data.testResult.total_incorrect || 0,
      skipped: data.testResult.total_skipped || 0,
      marksObtained: competitiveMetrics.marksObtained,
      totalMarks: competitiveMetrics.totalMarks,
      scorePercentage: data.testResult.score_percentage || 0,
      percentile: competitiveMetrics.percentile,
      rank: competitiveMetrics.rank,
      totalTestTakers: competitiveMetrics.totalTestTakers
    }
  }, [competitiveMetrics, data.testResult])

  if (loadingMetrics || !kpiMetrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Calculating competitive metrics...</p>
        </div>
      </div>
    )
  }

  // Format submission date/time
  const formatSubmissionDateTime = () => {
    if (!data.testResult.submitted_at) return ''
    const date = new Date(data.testResult.submitted_at)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div
      key="mock-test-analytics-stage"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="px-6 py-6 pb-24 space-y-8"
    >
      {/* Test Name and Submission Info */}
      {(testName || data.testResult.submitted_at) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="space-y-2">
            {testName && (
              <h2 className="text-2xl font-bold text-gray-900">{testName}</h2>
            )}
            {data.testResult.submitted_at && (
              <p className="text-sm text-gray-600">
                Submitted on {formatSubmissionDateTime()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Competitive Performance KPIs */}
      <MockTestKPICards metrics={kpiMetrics} />

      {/* Chapter-wise Performance (Secondary but still shown) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Chapter-wise Performance</h3>
          <p className="text-sm text-gray-600">Subject-level breakdown for detailed analysis</p>
        </div>
        <ChapterWisePerformanceTable chapters={chapters} className="bg-white" />
      </div>

      {/* Primary Action Button */}
      <div className="flex justify-center mt-12 mb-6">
        <PrimaryActionButton
          onClick={(e) => {
            onNavigateToSolutions()
          }}
          label="View Solutions"
        />
      </div>
    </motion.div>
  )
}

