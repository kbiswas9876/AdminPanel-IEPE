'use client'

import { useState, useEffect } from 'react'
import { getAllTestsWithCounts } from '@/lib/actions/tests'
import type { Test } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-3.5 w-3.5 text-gray-500" />
      case 'scheduled':
        return <Calendar className="h-3.5 w-3.5 text-blue-500" />
      case 'live':
        return <Clock className="h-3.5 w-3.5 text-green-500" />
      case 'completed':
        return <CheckCircle className="h-3.5 w-3.5 text-green-500" />
      default:
        return <AlertCircle className="h-3.5 w-3.5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs px-3 py-1 rounded-full font-medium border-0 shadow-sm transition-colors duration-150">
            Draft
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs px-3 py-1 rounded-full font-medium border-0 shadow-sm transition-colors duration-150">
            Scheduled
          </Badge>
        )
      case 'live':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 text-xs px-3 py-1 rounded-full font-medium border-0 shadow-sm transition-colors duration-150">
            Live
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 text-xs px-3 py-1 rounded-full font-medium border-0 shadow-sm transition-colors duration-150">
            Completed
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs px-3 py-1 rounded-full font-medium border-0 shadow-sm transition-colors duration-150">
            Unknown
          </Badge>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Mock Tests Created</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first mock test.</p>
          <Button 
            onClick={onCreateTest}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <Plus className="h-4 w-4 mr-2 relative z-10" />
            <span className="relative z-10">Create Your First Test</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <Card key={test.id} className="group border border-gray-200/50 rounded-xl overflow-hidden bg-white hover:bg-white hover:shadow-lg hover:shadow-gray-200/30 transition-all duration-200 w-full hover:-translate-y-0.5">
              <CardContent className="p-0">
                <div className="flex flex-col">
                  {/* Premium Header Section */}
                  <div className="px-5 py-4 border-b border-gray-100/60">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 tracking-tight leading-tight">
                            {test.name}
                          </h3>
                          {getStatusBadge(test.status)}
                        </div>
                        {test.description && (
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 font-medium">
                            {test.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Premium Minimalist Meta Section */}
                  <div className="px-5 py-4 bg-gray-50/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Questions */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Questions</p>
                          <p className="text-lg font-bold text-gray-900">
                            {typeof test.question_count === 'number' ? test.question_count : '—'}
                          </p>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</p>
                          <p className="text-lg font-bold text-gray-900">{test.total_time_minutes}m</p>
                        </div>
                      </div>

                      {/* Start Time */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{formatDateTime(test.start_time)}</p>
                        </div>
                      </div>

                      {/* End Time */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">End</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{formatDateTime(test.end_time)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Premium Actions Section */}
                  <div className="px-5 py-3 bg-white border-t border-gray-100/60">
                    <div className="flex items-center justify-end">
                      <TestActions 
                        test={test} 
                        onAction={handleTestAction}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
