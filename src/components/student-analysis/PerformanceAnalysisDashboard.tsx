'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import KPICards, { KPIMetrics } from './KPICards'
import ChapterWisePerformanceTable, { ChapterPerformance } from './ChapterWisePerformanceTable'
import PrimaryActionButton from './PrimaryActionButton'
import type { TestResult, AnswerLog, Question } from '@/lib/types/analytics'

export interface SessionResult {
  testResult: TestResult
  answerLog: AnswerLog[]
  questions: Question[]
}

export interface PerformanceAnalysisDashboardProps {
  sessionResult: SessionResult
  onNavigateToSolutions?: () => void
  className?: string
}

/**
 * Utility: format seconds into MM:SS (or HH:MM:SS if >= 1h), as expected by KPICards timeTaken
 */
function formatTimeMMSS(totalSeconds: number | null | undefined): string {
  if (!totalSeconds || totalSeconds <= 0) return '00:00'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Calculate KPI metrics:
 * - score: prefer testResult.score; fallback to total_correct
 * - attempted: total_correct + total_incorrect (exclude skipped). Fallback to derived from answerLog
 * - accuracy: correct / attempted * 100
 * - percentage: prefer testResult.score_percentage; fallback to correct / total_questions * 100
 * - timeTaken: MM:SS from total_time_taken; fallback to sum(answerLog.time_taken)
 */
function calculateKPIMetrics(session: SessionResult): KPIMetrics {
  const { testResult, answerLog } = session

  const derivedAttemptedFromAnswers =
    (answerLog?.filter(a => a.status !== 'skipped').length) || 0

  const attempted =
    (testResult.total_correct ?? 0) +
    (testResult.total_incorrect ?? 0)

  const attemptedFinal = attempted || derivedAttemptedFromAnswers

  const correctFinal = (testResult.total_correct ?? 0) ||
    (answerLog?.filter(a => a.status === 'correct').length ?? 0)

  const incorrectFinal = (testResult.total_incorrect ?? 0) ||
    (answerLog?.filter(a => a.status === 'incorrect').length ?? 0)

  const totalQuestionsFinal = (testResult.total_questions ?? 0) || (answerLog?.length ?? 0)

  const accuracy =
    attemptedFinal > 0 ? (correctFinal / attemptedFinal) * 100 : 0

  const percentage =
    (testResult.score_percentage ?? (
      totalQuestionsFinal > 0 ? (correctFinal / totalQuestionsFinal) * 100 : 0
    ))

  const totalTime =
    (testResult.total_time_taken ?? 0) ||
    (answerLog?.reduce((sum, a) => sum + (a.time_taken || 0), 0) ?? 0)

  const score =
    (testResult.score ?? null) !== null
      ? (testResult.score as number)
      : correctFinal

  return {
    score,
    totalQuestions: totalQuestionsFinal,
    attempted: attemptedFinal,
    correct: correctFinal,
    incorrect: incorrectFinal,
    accuracy,
    percentage,
    timeTaken: formatTimeMMSS(totalTime)
  }
}

/**
 * Calculate chapter-wise performance:
 * Group by question.chapter_name. For each chapter:
 * - attempted: count of non-skipped answers
 * - correct: count of correct answers
 * - accuracy: correct / attempted * 100
 * - timePerQuestion: average time (sum time_taken of attempted) / attempted
 */
function calculateChapterPerformance(session: SessionResult): ChapterPerformance[] {
  const { answerLog, questions } = session
  if (!answerLog || !questions) return []

  // Build quick lookup for question by id
  const questionById = new Map<number, Question>()
  for (const q of questions) {
    questionById.set(q.id, q)
  }

  // Accumulate per-chapter stats
  const chapterMap = new Map<string, { 
    totalQuestions: number; 
    attempted: number; 
    correct: number; 
    incorrect: number; 
    timeSum: number 
  }>()

  // First pass: count total questions per chapter
  for (const q of questions) {
    const chapterName = q.chapter_name || 'Unknown'
    if (!chapterMap.has(chapterName)) {
      chapterMap.set(chapterName, { 
        totalQuestions: 0, 
        attempted: 0, 
        correct: 0, 
        incorrect: 0, 
        timeSum: 0 
      })
    }
    chapterMap.get(chapterName)!.totalQuestions += 1
  }

  // Second pass: process answer log
  for (const a of answerLog) {
    const q = questionById.get(a.question_id)
    if (!q) continue
    const chapterName = q.chapter_name || 'Unknown'

    const wasAttempted = a.status !== 'skipped'
    const wasCorrect = a.status === 'correct'
    const wasIncorrect = a.status === 'incorrect'
    const time = a.time_taken || 0

    const agg = chapterMap.get(chapterName)!
    if (wasAttempted) {
      agg.attempted += 1
      agg.timeSum += time
    }
    if (wasCorrect) {
      agg.correct += 1
    }
    if (wasIncorrect) {
      agg.incorrect += 1
    }
  }

  const result: ChapterPerformance[] = []
  for (const [chapterName, agg] of chapterMap.entries()) {
    const accuracy = agg.attempted > 0 ? (agg.correct / agg.attempted) * 100 : 0
    const timePerQuestion = agg.attempted > 0 ? agg.timeSum / agg.attempted : 0
    result.push({
      chapterName,
      totalQuestions: agg.totalQuestions,
      attempted: agg.attempted,
      correct: agg.correct,
      incorrect: agg.incorrect,
      accuracy,
      timePerQuestion
    })
  }

  // Sort descending by accuracy, then by timePerQuestion ascending as a sensible default
  result.sort((a, b) => {
    const accDiff = Math.round(b.accuracy) - Math.round(a.accuracy)
    if (accDiff !== 0) return accDiff
    return a.timePerQuestion - b.timePerQuestion
  })

  return result
}

export default function PerformanceAnalysisDashboard({ sessionResult, onNavigateToSolutions, className = '' }: PerformanceAnalysisDashboardProps) {
  const kpi = useMemo(() => calculateKPIMetrics(sessionResult), [sessionResult])
  const chapters = useMemo(() => calculateChapterPerformance(sessionResult), [sessionResult])

  const submittedAt = sessionResult?.testResult?.submitted_at
  const timestamp = useMemo(() => {
    const date = submittedAt ? new Date(submittedAt) : new Date()
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [submittedAt])


  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`min-h-[60vh] ${className}`}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Performance Analysis
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Submitted at: <span className="font-medium text-slate-800 dark:text-slate-200">{timestamp}</span>
        </p>
      </div>

      {/* KPI cards */}
      <div className="mb-8">
        <KPICards metrics={kpi} />
      </div>

      {/* Chapter-wise table */}
      <ChapterWisePerformanceTable chapters={chapters} className="mb-8" />


      {/* Primary Action Button */}
      <div className="flex justify-center mt-12 mb-6">
        <PrimaryActionButton
          onClick={(e) => {
            // Allow external navigation hook
            onNavigateToSolutions?.()
          }}
          label="View Solutions"
        />
      </div>
    </motion.div>
  )
}

