'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getQuestionInsightData } from '@/lib/actions/question-insights'
import type { QuestionInsight } from '@/lib/types/question-insights'
import FiltersPanel from './FiltersPanel'
import QuestionInsightCard from './QuestionInsightCard'
import QuestionInsightCardSkeleton from './QuestionInsightCardSkeleton'

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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <QuestionInsightCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-12 text-center border border-slate-200 rounded-xl bg-white shadow-sm"
            >
              <p className="text-slate-600 font-medium">No questions match the current filters.</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {filtered.map((i, index) => (
                <QuestionInsightCard
                  key={i.questionId}
                  insight={i}
                  testId={testId}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  )
}


