'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { getQuestionInsightData } from '@/lib/actions/question-insights'
import type { QuestionInsight } from '@/lib/types/question-insights'
import FiltersPanel from './FiltersPanel'
import QuestionInsightCard from './QuestionInsightCard'

export default function QuestionInsightsPage({ testId }: { testId: number }) {
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<QuestionInsight[]>([])

  // Filters state
  const [search, setSearch] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedDiffs, setSelectedDiffs] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('QuestionNumber')

  useEffect(() => {
    (async () => {
      setLoading(true)
      const data = await getQuestionInsightData(testId)
      setInsights(data)
      setLoading(false)
    })()
  }, [testId])

  const topics = useMemo(() => Array.from(new Set(insights.map(i => i.topic).filter(Boolean))) as string[], [insights])
  const difficulties = useMemo(() => Array.from(new Set(insights.map(i => i.difficultyOriginal).filter(Boolean))) as string[], [insights])

  const filtered = useMemo(() => {
    let out = insights
    if (search.trim()) {
      const s = search.toLowerCase()
      out = out.filter(i => i.questionText.toLowerCase().includes(s))
    }
    if (selectedTopics.length > 0) {
      out = out.filter(i => i.topic && selectedTopics.includes(i.topic))
    }
    if (selectedDiffs.length > 0) {
      out = out.filter(i => i.difficultyOriginal && selectedDiffs.includes(i.difficultyOriginal))
    }

    switch (sortBy) {
      case 'MostCorrect':
        out = [...out].sort((a, b) => b.counts.correct - a.counts.correct)
        break
      case 'MostIncorrect':
        out = [...out].sort((a, b) => b.counts.incorrect - a.counts.incorrect)
        break
      case 'SlowestAverage':
        out = [...out].sort((a, b) => (b.times.avgTimeAllSec ?? 0) - (a.times.avgTimeAllSec ?? 0))
        break
      case 'FastestBest':
        out = [...out].sort((a, b) => (a.times.bestTimeCorrectSec ?? Infinity) - (b.times.bestTimeCorrectSec ?? Infinity))
        break
      default:
        out = [...out].sort((a, b) => (a.questionNumber ?? 0) - (b.questionNumber ?? 0))
    }
    return out
  }, [insights, search, selectedTopics, selectedDiffs, sortBy])

  function toggleTopic(t: string) {
    setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }
  function toggleDiff(d: string) {
    setSelectedDiffs(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }
  function quickView(key: 'all' | 'problematic' | 'easiest') {
    if (key === 'all') {
      setSelectedTopics([])
      setSelectedDiffs([])
      setSortBy('QuestionNumber')
    } else if (key === 'problematic') {
      // < 40% correct
      setSelectedTopics([])
      setSelectedDiffs([])
      setSortBy('MostIncorrect')
    } else if (key === 'easiest') {
      setSelectedTopics([])
      setSelectedDiffs([])
      setSortBy('MostCorrect')
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-600">Loading question insights...</div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-1">
        <FiltersPanel
          search={search}
          onSearch={setSearch}
          topics={topics}
          selectedTopics={selectedTopics}
          onToggleTopic={toggleTopic}
          difficulties={difficulties}
          selectedDifficulties={selectedDiffs}
          onToggleDifficulty={toggleDiff}
          sortBy={sortBy}
          onSortBy={setSortBy}
          onQuickView={quickView}
        />
      </div>
      <div className="lg:col-span-4 space-y-4">
        {filtered.map(i => (
          <QuestionInsightCard key={i.questionId} insight={i} />
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-slate-600 border border-slate-200 rounded-xl bg-white/70">No questions match the current filters.</div>
        )}
      </div>
    </div>
  )
}


