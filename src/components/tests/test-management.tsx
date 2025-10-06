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
        return <FileText className="h-6 w-6 text-white" />
      case 'scheduled':
        return <Calendar className="h-6 w-6 text-white" />
      case 'live':
        return <Clock className="h-6 w-6 text-white" />
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-white" />
      default:
        return <AlertCircle className="h-6 w-6 text-white" />
    }
  }

  const getStatusBadge = (test: Test) => {
    if (isPerpetualTest(test)) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 text-xs px-3 py-1 rounded-full font-medium border-0 shadow-sm transition-colors duration-150">
          Perpetual
        </Badge>
      )
    }
    
    switch (test.status) {
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

  const isPerpetualTest = (test: Test) => {
    return test.status === 'scheduled' && !test.end_time
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
    <div className="px-6 py-6">
      {tests.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
            <FileText className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Mock Tests Yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Get started by creating your first competitive assessment and watch your students excel.</p>
          <Button 
            onClick={onCreateTest}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold px-8 py-6 h-auto shadow-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 rounded-xl text-base"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Test
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {tests.map((test) => (
            <Card 
              key={test.id} 
              className="group relative overflow-hidden bg-white border border-gray-200/60 rounded-2xl hover:shadow-2xl hover:shadow-gray-300/30 transition-all duration-300 hover:-translate-y-2 hover:border-gray-300 flex flex-col"
            >
              {/* Gradient Background Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <CardContent className="p-0 flex flex-col h-full relative z-10">
                {/* Header with Status Badge */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    {getStatusBadge(test)}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-xl group-hover:shadow-indigo-500/40 transition-all duration-300">
                      {getStatusIcon(test.status)}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors duration-200">
                    {test.name}
                  </h3>
                  
                  {test.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="px-6 py-4 bg-gradient-to-br from-gray-50/80 to-gray-100/40 border-y border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Questions */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Questions</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {typeof test.question_count === 'number' ? test.question_count : '—'}
                        </p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</p>
                        <p className="text-2xl font-bold text-gray-900">{test.total_time_minutes}<span className="text-sm font-medium text-gray-500 ml-1">min</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="px-6 py-4 flex-grow">
                  <div className="space-y-3">
                    {/* Start Time */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Start Time</p>
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {test.start_time ? formatDateTime(test.start_time) : 'Not scheduled'}
                        </p>
                      </div>
                    </div>

                    {/* End Time */}
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        isPerpetualTest(test) ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {isPerpetualTest(test) ? (
                          <Clock className="h-4 w-4 text-green-600" />
                        ) : (
                          <Calendar className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">End Time</p>
                        <p className={`text-sm font-bold truncate ${
                          isPerpetualTest(test) ? 'text-green-700' : 'text-gray-900'
                        }`}>
                          {isPerpetualTest(test) ? '∞ Perpetual' : formatDateTime(test.end_time)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="px-6 py-4 bg-white border-t border-gray-100">
                  <TestActions 
                    test={test} 
                    onAction={handleTestAction}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
