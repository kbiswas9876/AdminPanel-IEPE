'use client'

import React from 'react'

interface FiltersPanelProps {
  search: string
  onSearch: (v: string) => void
  topics: string[]
  selectedTopics: string[]
  onToggleTopic: (t: string) => void
  difficulties: string[]
  selectedDifficulties: string[]
  onToggleDifficulty: (d: string) => void
  sortBy: string
  onSortBy: (s: string) => void
  onQuickView: (key: 'all' | 'problematic' | 'easiest') => void
}

export default function FiltersPanel(props: FiltersPanelProps) {
  const {
    search, onSearch,
    topics, selectedTopics, onToggleTopic,
    difficulties, selectedDifficulties, onToggleDifficulty,
    sortBy, onSortBy, onQuickView,
  } = props

  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm">
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search question text..."
        className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
      />

      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-500">Topics</div>
        <div className="flex flex-wrap gap-2">
          {topics.map(t => (
            <button
              key={t}
              onClick={() => onToggleTopic(t)}
              className={`px-2 py-1 rounded-full text-xs border ${selectedTopics.includes(t) ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-300'}`}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-500">Difficulties</div>
        <div className="flex flex-wrap gap-2">
          {difficulties.map(d => (
            <button
              key={d}
              onClick={() => onToggleDifficulty(d)}
              className={`px-2 py-1 rounded-full text-xs border ${selectedDifficulties.includes(d) ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-700 border-slate-300'}`}
            >{d}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-500">Sort By</div>
        <select
          value={sortBy}
          onChange={(e) => onSortBy(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white"
        >
          <option value="QuestionNumber">Question Number</option>
          <option value="MostCorrect">Most Correct</option>
          <option value="MostIncorrect">Most Incorrect</option>
          <option value="SlowestAverage">Slowest Average</option>
          <option value="FastestBest">Fastest Best</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button onClick={() => onQuickView('all')} className="px-3 py-1.5 text-xs rounded-md border border-slate-300">All</button>
        <button onClick={() => onQuickView('problematic')} className="px-3 py-1.5 text-xs rounded-md border border-amber-300 bg-amber-50 text-amber-800">Problematic</button>
        <button onClick={() => onQuickView('easiest')} className="px-3 py-1.5 text-xs rounded-md border border-green-300 bg-green-50 text-green-800">Easiest</button>
      </div>
    </div>
  )
}


