/**
 * Data adapter to transform AdminPanel's EnrichedTestResult
 * into formats expected by Student Portal components
 */

import type { EnrichedTestResult, TestResult, AnswerLog, Question } from '@/lib/types/analytics'

/**
 * SessionResult format expected by PerformanceAnalysisDashboard
 */
export interface SessionResult {
  testResult: TestResult
  answerLog: AnswerLog[]
  questions: Question[]
}

/**
 * Transform EnrichedTestResult to SessionResult for Performance Analytics Dashboard
 */
export function enrichedTestResultToSessionResult(
  enriched: EnrichedTestResult
): SessionResult {
  // Extract answerLog and questions from enrichedAnswers
  const answerLog: AnswerLog[] = enriched.enrichedAnswers.map(ea => ea.answer_log)
  const questions: Question[] = enriched.enrichedAnswers.map(ea => ea.question)

  return {
    testResult: enriched.testResult,
    answerLog,
    questions
  }
}

/**
 * Transform EnrichedTestResult to format expected by Solution Review components
 */
export function enrichedTestResultToAnalysisData(
  enriched: EnrichedTestResult
): {
  testResult: TestResult
  answerLog: AnswerLog[]
  questions: Question[]
  enrichedAnswers: EnrichedTestResult['enrichedAnswers']
  peerAverages?: Record<number, number>
} {
  // Extract answerLog and questions from enrichedAnswers
  const answerLog: AnswerLog[] = enriched.enrichedAnswers.map(ea => ea.answer_log)
  const questions: Question[] = enriched.enrichedAnswers.map(ea => ea.question)

  return {
    testResult: enriched.testResult,
    answerLog,
    questions,
    enrichedAnswers: enriched.enrichedAnswers,  // Include enriched answers with per-question marking
    peerAverages: {}  // Empty for now as we don't have peer data in admin panel
  }
}

/**
 * Build a map of question ID to time taken (in seconds)
 * This is needed for ReviewPremiumStatusPanel performance matrix
 */
export function buildTimePerQuestionMap(enriched: EnrichedTestResult): Record<string, number> {
  const timeMap: Record<string, number> = {}
  
  enriched.enrichedAnswers.forEach(ea => {
    // Use question.id as the key (numeric ID converted to string)
    timeMap[ea.question.id.toString()] = ea.answer_log.time_taken
  })
  
  return timeMap
}

/**
 * Build review states array for ReviewPremiumStatusPanel
 */
export function buildReviewStates(enriched: EnrichedTestResult): Array<{
  status: 'correct' | 'incorrect' | 'skipped'
}> {
  return enriched.enrichedAnswers.map(ea => ({
    status: ea.answer_log.status as 'correct' | 'incorrect' | 'skipped'
  }))
}

