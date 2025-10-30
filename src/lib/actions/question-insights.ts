'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type {
  QuestionInsight,
  RealizedDifficulty,
} from '@/lib/types/question-insights'

function toMmSs(totalSeconds: number | null | undefined): number | null {
  if (totalSeconds === null || totalSeconds === undefined) return null
  const n = Math.max(0, Math.round(Number(totalSeconds)))
  return n
}

function computeRealizedDifficulty(correctnessPct: number, avgAll: number | null, avgCorrect: number | null): RealizedDifficulty {
  // timeRatio = avgAll / avgCorrect (fallbacks if missing)
  const a = avgAll && avgAll > 0 ? avgAll : null
  const c = avgCorrect && avgCorrect > 0 ? avgCorrect : null
  const timeRatio = a && c ? a / c : 1

  if (correctnessPct > 85 && timeRatio < 1.2) return 'Easy'
  if (correctnessPct > 70 && correctnessPct <= 85 && timeRatio < 1.4) return 'Easy-Moderate'
  if (correctnessPct >= 40) return 'Moderate'
  if (correctnessPct >= 20) return 'Moderate-Hard'
  if (correctnessPct < 20 && timeRatio > 1.5) return 'Hard'
  return 'Moderate-Hard'
}

function buildFeedback(original: string | null, realized: RealizedDifficulty): string {
  if (!original) return `Performance Analysis: Performed as '${realized}'.`
  if (original === realized) {
    return `Performance Analysis: Matched the assigned '${original}' difficulty.`
  }
  return `Performance Analysis: Assigned '${original}', performed as '${realized}'. Consider reviewing clarity or difficulty.`
}

export async function getQuestionInsightData(testId: number): Promise<QuestionInsight[]> {
  const supabase = createAdminClient()

  // 1) Fetch all test results (attempts) for this test
  const { data: results, error: resultsError } = await supabase
    .from('test_results')
    .select('id')
    .eq('mock_test_id', testId)

  if (resultsError) {
    console.error('getQuestionInsightData: error fetching test_results', resultsError)
    return []
  }
  const resultIds = (results || []).map(r => r.id)

  // 2) Fetch answer_log rows for these attempts
  let answerLogs: Array<{ result_id: number; question_id: number; status: string | null; time_taken: number | null }> = []
  if (resultIds.length > 0) {
    const { data: logs, error: logsError } = await supabase
      .from('answer_log')
      .select('result_id, question_id, status, time_taken')
      .in('result_id', resultIds)
    if (logsError) {
      console.error('getQuestionInsightData: error fetching answer_log', logsError)
      return []
    }
    answerLogs = logs || []
  }

  // 3) Fetch test questions joined with questions metadata
  const { data: tq, error: tqError } = await supabase
    .from('test_questions')
    .select(`
      question_id,
      questions:questions!inner(
        id,
        question_text,
        options,
        correct_option,
        chapter_name,
        difficulty,
        question_number_in_book
      )
    `)
    .eq('test_id', testId)

  if (tqError) {
    console.error('getQuestionInsightData: error fetching test_questions', tqError)
    return []
  }

  // Build map: questionId -> logs
  const qidToLogs = new Map<number, typeof answerLogs>()
  for (const log of answerLogs) {
    const qid = Number(log.question_id)
    if (!qidToLogs.has(qid)) qidToLogs.set(qid, [])
    qidToLogs.get(qid)!.push(log)
  }

  const insights: QuestionInsight[] = []

  for (const row of tq || []) {
    const q = (row as any).questions
    const qid = Number(q?.id)
    const logs = qidToLogs.get(qid) || []

    let correct = 0
    let incorrect = 0
    let skipped = 0
    const timesAll: number[] = []
    const timesCorrect: number[] = []

    for (const l of logs) {
      const status = (l.status || '').toString()
      const t = l.time_taken == null ? null : Number(l.time_taken)
      if (status === 'correct') {
        correct++
        if (t != null) timesCorrect.push(t)
        if (t != null) timesAll.push(t)
      } else if (status === 'incorrect') {
        incorrect++
        if (t != null) timesAll.push(t)
      } else {
        skipped++
      }
    }

    const attempted = correct + incorrect
    const correctnessPct = attempted > 0 ? Math.round((correct / attempted) * 1000) / 10 : 0
    const avgAll = timesAll.length > 0 ? timesAll.reduce((s, v) => s + v, 0) / timesAll.length : null
    const avgCorrect = timesCorrect.length > 0 ? timesCorrect.reduce((s, v) => s + v, 0) / timesCorrect.length : null
    const bestCorrect = timesCorrect.length > 0 ? Math.min(...timesCorrect) : null

    const realized = computeRealizedDifficulty(correctnessPct, avgAll, avgCorrect)
    const feedback = buildFeedback((q?.difficulty as string | null) || null, realized)

    insights.push({
      questionId: qid,
      questionNumber: (q?.question_number_in_book as number | null) ?? null,
      questionText: (q?.question_text as string) || '',
      options: (q?.options as Record<string, string> | null) ?? null,
      correctOption: (q?.correct_option as string | null) ?? null,
      topic: (q?.chapter_name as string | null) ?? null,
      difficultyOriginal: (q?.difficulty as string | null) ?? null,
      counts: { correct, incorrect, skipped },
      times: {
        avgTimeAllSec: toMmSs(avgAll),
        avgTimeCorrectSec: toMmSs(avgCorrect),
        bestTimeCorrectSec: toMmSs(bestCorrect),
      },
      correctnessPct,
      realizedDifficulty: realized,
      feedback,
    })
  }

  return insights
}


