'use client'

import { useState, useMemo } from 'react'
import type { ActivityFeedResponse } from '@/lib/types/analytics'
import { DetailedSessionModal } from './DetailedSessionModal'

interface TestHistoryViewProps {
  userId: string
  initialData: ActivityFeedResponse
  testType: 'practice' | 'mock_test'
}

export function TestHistoryView({ userId, initialData, testType }: TestHistoryViewProps) {
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null)
  
  // Calculate summary stats
  const summary = useMemo(() => {
    const scores = initialData.entries
      .map(e => (e.metadata as any).score_percentage)
      .filter((s): s is number => typeof s === 'number' && !isNaN(s))
    
    const avgScore = scores.length > 0 
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length 
      : 0
    
    const totalTime = initialData.entries
      .map(e => (e.metadata as any).total_time_taken_seconds || 0)
      .reduce((sum, t) => sum + t, 0)
    
    const avgTime = scores.length > 0 ? totalTime / scores.length : 0
    
    return {
      totalTests: initialData.entries.length,
      avgScore,
      avgTime,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0
    }
  }, [initialData])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return 'border-green-500'
    if (score >= 60) return 'border-yellow-500'
    return 'border-red-500'
  }

  const formatRelativeTime = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return then.toLocaleDateString()
  }

  const sortedEntries = useMemo(() => {
    return [...initialData.entries].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [initialData])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Tests</div>
          <div className="text-3xl font-bold text-gray-900">{summary.totalTests}</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Average Score</div>
          <div className="text-3xl font-bold text-blue-600">{summary.avgScore.toFixed(1)}%</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Highest Score</div>
          <div className="text-3xl font-bold text-green-600">🔥 {summary.highestScore.toFixed(1)}%</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Avg Time</div>
          <div className="text-3xl font-bold text-gray-900">{Math.floor(summary.avgTime / 60)}m</div>
        </div>
      </div>

      {/* Test History List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {testType === 'mock_test' ? 'Mock Test' : 'Practice'} History
        </h2>

        <div className="grid gap-4">
          {sortedEntries.map((entry, index) => {
            const meta = entry.metadata as any
            const score = meta.score_percentage || 0
            const isRecent = index === 0 // Most recent
            
            return (
              <div
                key={entry.id}
                className={`bg-white rounded-lg border-2 p-5 hover:shadow-lg transition-all cursor-pointer ${
                  getScoreBorderColor(score)
                } ${isRecent ? 'ring-2 ring-blue-400' : ''}`}
                onClick={() => setSelectedResultId(entry.related_entity_id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {meta.test_name || (testType === 'mock_test' ? 'Mock Test' : 'Practice Session')}
                      </h3>
                      {isRecent && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                          Latest
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(entry.created_at)}
                      </span>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Correct</div>
                        <div className="text-lg font-semibold text-green-600">
                          {meta.total_correct || 0}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Incorrect</div>
                        <div className="text-lg font-semibold text-red-600">
                          {meta.total_incorrect || 0}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Time Taken</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {Math.floor((meta.total_time_taken_seconds || 0) / 60)}m
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Score Display */}
                  <div className={`ml-6 px-6 py-4 rounded-lg border-2 ${getScoreColor(score)} min-w-[120px] text-center`}>
                    <div className="text-xs font-semibold mb-1">Score</div>
                    <div className="text-4xl font-bold">
                      {score.toFixed(1)}
                    </div>
                    <div className="text-xs mt-1">%</div>
                  </div>
                </div>

                {/* Performance Indicator */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600">
                        Questions: {meta.total_questions || 0}
                      </span>
                      <span className="text-gray-600">
                        Accuracy: {score.toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {initialData.entries.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-gray-500 text-lg">No {testType === 'mock_test' ? 'mock test' : 'practice'} sessions found</div>
        </div>
      )}

      {/* Detailed Session Modal */}
      {selectedResultId && (
        <DetailedSessionModal
          resultId={selectedResultId}
          isOpen={!!selectedResultId}
          onClose={() => setSelectedResultId(null)}
        />
      )}
    </div>
  )
}

