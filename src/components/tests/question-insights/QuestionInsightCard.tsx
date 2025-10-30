'use client'

import React from 'react'
import type { QuestionInsight } from '@/lib/types/question-insights'
import KatexRenderer from '@/components/ui/KatexRenderer'

function formatMmSs(seconds: number | null): string {
  if (seconds == null) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export default function QuestionInsightCard({ insight }: { insight: QuestionInsight }) {
  const { counts, times } = insight
  const totalAttempted = counts.correct + counts.incorrect

  return (
    <div className="p-5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm shadow-sm space-y-4">
      {/* Question body */}
      <div className="space-y-2">
        <div className="text-xs text-slate-500">Q{insight.questionNumber ?? ''}</div>
        <div className="prose prose-slate max-w-none">
          <KatexRenderer content={insight.questionText} />
        </div>
        {insight.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            {Object.entries(insight.options).map(([key, val]) => {
              const isCorrect = insight.correctOption?.toLowerCase() === key.toLowerCase()
              return (
                <div key={key} className={`px-3 py-2 rounded-lg border ${isCorrect ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'}`}>
                  <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-white text-xs ${isCorrect ? 'bg-green-600' : 'bg-slate-400'}`}>{key.toUpperCase()}</span>
                    <span className="text-slate-800">
                      <KatexRenderer content={val} />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Chips and metrics */}
      <div className="flex flex-wrap items-center gap-2">
        {insight.topic && (
          <span className="px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-200">{insight.topic}</span>
        )}
        {insight.difficultyOriginal && (
          <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200">{insight.difficultyOriginal}</span>
        )}
        <span className="ml-auto px-2.5 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">{insight.realizedDifficulty}</span>
      </div>

      {/* Attempt breakdown */}
      <div className="flex flex-wrap gap-4 text-sm text-slate-700">
        <div>✔ Correct: <span className="font-semibold text-green-700">{counts.correct}</span></div>
        <div>✖ Incorrect: <span className="font-semibold text-red-700">{counts.incorrect}</span></div>
        <div>⟳ Skipped: <span className="font-semibold text-slate-700">{counts.skipped}</span></div>
      </div>

      {/* Time analysis */}
      <div className="flex flex-wrap gap-4 text-sm text-slate-700">
        <div>⏱ Avg (all): <span className="font-semibold">{formatMmSs(times.avgTimeAllSec)}</span></div>
        <div>⏱ Avg (correct): <span className="font-semibold">{formatMmSs(times.avgTimeCorrectSec)}</span></div>
        <div>⚡ Best (correct): <span className="font-semibold">{formatMmSs(times.bestTimeCorrectSec)}</span></div>
      </div>

      {/* Correctness bar */}
      <div className="space-y-1">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-green-500"
            style={{ width: `${insight.correctnessPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>{insight.correctnessPct}% marked correct</span>
          <span>{totalAttempted} attempted</span>
        </div>
      </div>

      {/* Feedback */}
      <div className="text-sm text-slate-700">
        {insight.feedback}
      </div>
    </div>
  )
}


