'use server'

export type RealizedDifficulty =
  | 'Easy'
  | 'Easy-Moderate'
  | 'Moderate'
  | 'Moderate-Hard'
  | 'Hard'

export interface QuestionInsightCounts {
  correct: number
  incorrect: number
  skipped: number
}

export interface QuestionInsightTimes {
  avgTimeAllSec: number | null
  avgTimeCorrectSec: number | null
  bestTimeCorrectSec: number | null
}

export interface QuestionInsight {
  questionId: number
  questionNumber: number | null
  questionText: string
  options: Record<string, string> | null
  correctOption: string | null
  topic: string | null
  difficultyOriginal: string | null
  counts: QuestionInsightCounts
  times: QuestionInsightTimes
  correctnessPct: number
  realizedDifficulty: RealizedDifficulty
  feedback: string
}

export interface QuestionInsightFilters {
  topics?: string[]
  difficulties?: Array<'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard'>
  search?: string
  sortBy?:
    | 'MostCorrect'
    | 'MostIncorrect'
    | 'SlowestAverage'
    | 'FastestBest'
    | 'QuestionNumber'
}


