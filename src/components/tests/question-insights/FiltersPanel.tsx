'use client'

import React from 'react'
import { Search, ChevronDown } from 'lucide-react'

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

  const sortOptions = [
    { value: 'QuestionNumber', label: 'Question Number' },
    { value: 'MostCorrect', label: 'Most Correct' },
    { value: 'MostIncorrect', label: 'Most Incorrect' },
    { value: 'SlowestAverage', label: 'Slowest Average' },
    { value: 'FastestBest', label: 'Fastest Best' },
  ]

  return (
    <div className="w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto">
      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search question text..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Topics */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Topics</h3>
        <div className="space-y-2">
          {topics.map((topic) => (
            <label key={topic} className="flex items-center group cursor-pointer">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(topic)}
                  onChange={() => onToggleTopic(topic)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-all"
                />
              </div>
              <span className="ml-3 text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                {topic}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Difficulties */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Difficulty</h3>
        <div className="space-y-2">
          {difficulties.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => {
                if (selectedDifficulties.includes(difficulty)) {
                  onToggleDifficulty(difficulty)
                } else {
                  // Select only this difficulty
                  selectedDifficulties.forEach(d => {
                    if (d !== difficulty) onToggleDifficulty(d)
                  })
                  if (!selectedDifficulties.includes(difficulty)) {
                    onToggleDifficulty(difficulty)
                  }
                }
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                selectedDifficulties.includes(difficulty)
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Sort By</h3>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortBy(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer transition-all"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      {/* Filter Tags */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onQuickView('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              sortBy === 'QuestionNumber' && selectedTopics.length === 0 && selectedDifficulties.length === 0
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onQuickView('problematic')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              sortBy === 'MostIncorrect'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Problematic
          </button>
          <button
            onClick={() => onQuickView('easiest')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              sortBy === 'MostCorrect'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Easiest
          </button>
        </div>
      </div>
    </div>
  )
}


