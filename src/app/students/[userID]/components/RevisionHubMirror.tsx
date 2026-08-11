'use client'

import React, { useState, useMemo } from 'react'
import type { EnrichedBookmark } from '@/lib/types/analytics'
import KatexRenderer from '@/components/ui/KatexRenderer'

interface RevisionHubMirrorProps {
  userId: string
  initialBookmarks: EnrichedBookmark[]
}

export function RevisionHubMirror({ userId, initialBookmarks }: RevisionHubMirrorProps) {
  const [selectedBookmarkId, setSelectedBookmarkId] = useState<number | null>(
    initialBookmarks.length > 0 ? initialBookmarks[0].bookmark.id : null
  )

  // Group bookmarks by chapter
  const groupedByChapter = useMemo(() => {
    const grouped: Record<string, EnrichedBookmark[]> = {}
    
    initialBookmarks.forEach(bookmark => {
      const chapter = bookmark.question.chapter_name
      if (!grouped[chapter]) {
        grouped[chapter] = []
      }
      grouped[chapter].push(bookmark)
    })
    
    return grouped
  }, [initialBookmarks])

  const selectedBookmark = initialBookmarks.find(
    b => b.bookmark.id === selectedBookmarkId
  )

  return (
    <div className="h-full flex">
      {/* Left Panel - Chapter-Grouped Bookmark List */}
      <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revision Hub Mirror
          </h2>
          
          <div className="mb-4 text-sm text-gray-600">
            {initialBookmarks.length} bookmark{initialBookmarks.length !== 1 ? 's' : ''} across {Object.keys(groupedByChapter).length} chapter{Object.keys(groupedByChapter).length !== 1 ? 's' : ''}
          </div>
          
          <div className="space-y-4">
            {Object.entries(groupedByChapter).map(([chapter, bookmarks]) => (
              <ChapterSection
                key={chapter}
                chapter={chapter}
                bookmarks={bookmarks}
                selectedBookmarkId={selectedBookmarkId}
                onSelectBookmark={setSelectedBookmarkId}
              />
            ))}
          </div>
          
          {initialBookmarks.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No bookmarks found
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Bookmark Details */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        {selectedBookmark ? (
          <BookmarkDetailView bookmark={selectedBookmark} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a bookmark to view details
          </div>
        )}
      </div>
    </div>
  )
}

function ChapterSection({
  chapter,
  bookmarks,
  selectedBookmarkId,
  onSelectBookmark
}: {
  chapter: string
  bookmarks: EnrichedBookmark[]
  selectedBookmarkId: number | null
  onSelectBookmark: (id: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Chapter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-900">{chapter}</span>
          <span className="text-xs text-gray-500">({bookmarks.length})</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Chapter Questions */}
      {isExpanded && (
        <div className="bg-white">
          {bookmarks.map((item) => (
            <BookmarkListItem
              key={item.bookmark.id}
              item={item}
              isSelected={item.bookmark.id === selectedBookmarkId}
              onClick={() => onSelectBookmark(item.bookmark.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function BookmarkListItem({
  item,
  isSelected,
  onClick
}: {
  item: EnrichedBookmark
  isSelected: boolean
  onClick: () => void
}) {
  const { question, performanceHistory } = item
  
  // Create a preview of the question text (strip HTML/markdown)
  const previewText = question.question_text
    ? question.question_text.replace(/<[^>]*>/g, '').replace(/\(\(.*?\)\)/g, '')
    : 'No question text'
  
  return (
    <div
      onClick={onClick}
      className={`px-3 py-2 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
        isSelected
          ? 'bg-blue-50 border-l-4 border-l-blue-500'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start space-x-2">
        <div className="text-lg flex-shrink-0 mt-0.5">
          {performanceHistory.total_attempts > 0 ? '📚' : '🔖'}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {previewText.substring(0, 80)}{previewText.length > 80 ? '...' : ''}
          </p>
          
          <div className="flex items-center space-x-3 mt-1.5">
            <span className={`text-xs ${
              performanceHistory.success_rate >= 80 ? 'text-green-600' :
              performanceHistory.success_rate >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {Math.round(performanceHistory.success_rate)}%
            </span>
            <span className="text-xs text-gray-500">
              {performanceHistory.total_attempts} attempt{performanceHistory.total_attempts !== 1 ? 's' : ''}
            </span>
            {question.difficulty && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                {question.difficulty}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BookmarkDetailView({ bookmark }: { bookmark: EnrichedBookmark }) {
  const { bookmark: b, question, performanceHistory, srsStatus } = bookmark
  
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Question Details</h3>
      
      {/* Question */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-sm text-gray-600">{question.chapter_name}</span>
          {question.difficulty && (
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
              {question.difficulty}
            </span>
          )}
        </div>
        
        <div className="text-gray-900 mb-4">
          <KatexRenderer content={question.question_text || ''} />
        </div>

        {/* Options */}
        {question.options && typeof question.options === 'object' && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Options:</h4>
            <div className="space-y-2">
              {Object.entries(question.options as Record<string, string>).map(([key, value]) => (
                <div key={key} className={`p-3 rounded border ${
                  key === question.correct_option 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold text-gray-700">{key}.</span>
                    <KatexRenderer content={value} />
                    {key === question.correct_option && (
                      <span className="ml-auto text-xs text-green-600 font-semibold">✓ Correct</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solution */}
        {question.solution_text && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-medium text-blue-900 mb-1">Solution:</p>
            <div className="text-sm text-blue-800">
              <KatexRenderer content={question.solution_text} />
            </div>
          </div>
        )}
        
        {b.personal_note && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-medium text-gray-700">Student Note:</p>
            <p className="text-sm text-gray-600 mt-1">{b.personal_note}</p>
          </div>
        )}
        
        {b.custom_tags && b.custom_tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {b.custom_tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Performance History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Performance History</h4>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-2xl font-bold text-blue-600">{performanceHistory.total_attempts}</div>
            <div className="text-xs text-gray-600">Total Attempts</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${
              performanceHistory.success_rate >= 80 ? 'text-green-600' :
              performanceHistory.success_rate >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {Math.round(performanceHistory.success_rate)}%
            </div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.floor(performanceHistory.average_time / 60)}m {performanceHistory.average_time % 60}s
            </div>
            <div className="text-xs text-gray-600">Avg Time</div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">Recent Trend:</span>
          <span className={`text-xs px-2 py-1 rounded ${
            performanceHistory.recent_trend === 'improving'
              ? 'bg-green-100 text-green-700'
              : performanceHistory.recent_trend === 'declining'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {performanceHistory.recent_trend === 'improving' && '↗ Improving'}
            {performanceHistory.recent_trend === 'declining' && '↘ Declining'}
            {performanceHistory.recent_trend === 'stable' && '→ Stable'}
          </span>
        </div>

        {/* Attempt History */}
        {performanceHistory.attempts && performanceHistory.attempts.length > 0 && (
          <div className="mt-4">
            <h5 className="text-xs font-semibold text-gray-700 mb-2">Recent Attempts:</h5>
            <div className="space-y-1">
              {performanceHistory.attempts.slice(-5).reverse().map((attempt, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs">
                  <span className={`w-2 h-2 rounded-full ${
                    attempt.result === 'correct' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className="text-gray-600">
                    {new Date(attempt.date).toLocaleDateString()}
                  </span>
                  <span className="text-gray-500">
                    - {attempt.result} ({Math.floor(attempt.time_taken / 60)}m {attempt.time_taken % 60}s)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SRS Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">SRS Status</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-600">Interval</div>
            <div className="text-lg font-semibold text-gray-900">
              {srsStatus.srs_interval} days
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Repetitions</div>
            <div className="text-lg font-semibold text-gray-900">
              {srsStatus.srs_repetitions}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Ease Factor</div>
            <div className="text-lg font-semibold text-gray-900">
              {srsStatus.srs_ease_factor.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Next Review</div>
            <div className="text-lg font-semibold text-gray-900">
              {srsStatus.next_review_date
                ? new Date(srsStatus.next_review_date).toLocaleDateString()
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

