'use client'

import { useState, useEffect } from 'react'
import { getAllTestsWithCounts } from '@/lib/actions/tests'
import type { Test } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  FileText, 
  Calendar, 
  Clock
} from 'lucide-react'
import { TestActions } from './test-actions'

interface TestManagementProps {
  onCreateTest?: () => void
}

export function TestManagement({ onCreateTest }: TestManagementProps = {}) {
  const [tests, setTests] = useState<Array<Test & { question_count?: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const allTests = await getAllTestsWithCounts()
        setTests(allTests)
      } catch (err) {
        setError('Failed to fetch tests')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [])

  const handleTestAction = () => {
    // Refresh the tests list
    const fetchTests = async () => {
      try {
        const allTests = await getAllTestsWithCounts()
        setTests(allTests)
      } catch (err) {
        setError('Failed to fetch tests')
        console.error('Error:', err)
      }
    }
    
    fetchTests()
  }

  const getStatusBadge = (test: Test) => {
    if (isPerpetualTest(test)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">Perpetual</span>
        </span>
      )
    }
    
    switch (test.status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
            <span className="text-xs font-medium text-gray-700">Draft</span>
          </span>
        )
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-100 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span className="text-xs font-medium text-blue-700">Scheduled</span>
          </span>
        )
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Live</span>
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
            <span className="text-xs font-medium text-gray-700">Completed</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
            <span className="text-xs font-medium text-gray-700">Unknown</span>
          </span>
        )
    }
  }

  const formatDateTime = (dateTime: string | null | undefined) => {
    if (!dateTime) return 'Not set'
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isPerpetualTest = (test: Test) => {
    return test.status === 'scheduled' && !test.end_time
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
        </div>
        <p className="text-sm text-red-900 flex-1">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {tests.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm mb-4">
            <FileText className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No mock tests yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Get started by creating your first competitive assessment</p>
          <Button 
            onClick={onCreateTest}
            className="h-11 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow"
          >
            <Plus className="h-4 w-4 mr-2" strokeWidth={2} />
            Create Your First Test
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="group relative bg-white rounded-xl border border-gray-200 p-5 transition-all duration-200 hover:shadow-md hover:border-gray-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                    {test.name}
                  </h3>
                  {test.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {test.description}
                    </p>
                  )}
                </div>
                {getStatusBadge(test)}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 py-4 border-y border-gray-100">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                  <div>
                    <p className="text-xs text-gray-500">Questions</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {typeof test.question_count === 'number' ? test.question_count : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {test.total_time_minutes}<span className="text-xs text-gray-500 ml-0.5">min</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="py-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Start</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {test.start_time ? formatDateTime(test.start_time) : 'Not scheduled'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">End</p>
                    <p className={`text-sm font-medium truncate ${
                      isPerpetualTest(test) ? 'text-emerald-700' : 'text-gray-900'
                    }`}>
                      {isPerpetualTest(test) ? '∞ Perpetual' : formatDateTime(test.end_time)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100">
                <TestActions 
                  test={test} 
                  onAction={handleTestAction}
                />
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/0 group-hover:ring-black/5 transition-all duration-200 pointer-events-none" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
