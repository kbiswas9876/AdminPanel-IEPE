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
import Link from 'next/link'
import { TestActions } from './test-actions'

export function TestManagement() {
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
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs px-2 py-0.5">
            Draft
          </Badge>
        )
      case 'scheduled':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs px-2 py-0.5">
            Scheduled
          </Badge>
        )
      case 'live':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 text-xs px-2 py-0.5">
            Live
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 text-xs px-2 py-0.5">
            Completed
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs px-2 py-0.5">
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
          <Link href="/tests/new">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Plus className="h-4 w-4 mr-2 relative z-10" />
              <span className="relative z-10">Create Your First Test</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <Card key={test.id} className="group border border-gray-200/50 rounded-lg overflow-hidden bg-white hover:bg-white shadow-sm hover:shadow-md transition-all duration-200 w-full">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  {/* Premium Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                        {test.name}
                      </h3>
                      {test.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {test.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      {getStatusIcon(test.status)}
                      {getStatusBadge(test.status)}
                    </div>
                  </div>
                  
                  {/* Premium Stats Grid - Full Width */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-2.5 border border-blue-200/50">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-600 font-medium">Questions</p>
                          <p className="text-sm font-bold text-blue-900">
                            {typeof test.question_count === 'number' ? test.question_count : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-2.5 border border-green-200/50">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3.5 w-3.5 text-green-600" />
                        <div>
                          <p className="text-xs text-green-600 font-medium">Duration</p>
                          <p className="text-sm font-bold text-green-900">
                            {test.total_time_minutes}m
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-2.5 border border-purple-200/50">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3.5 w-3.5 text-purple-600" />
                        <div>
                          <p className="text-xs text-purple-600 font-medium">Start</p>
                          <p className="text-xs font-medium text-purple-900">
                            {formatDateTime(test.start_time)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-2.5 border border-orange-200/50">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3.5 w-3.5 text-orange-600" />
                        <div>
                          <p className="text-xs text-orange-600 font-medium">End</p>
                          <p className="text-xs font-medium text-orange-900">
                            {formatDateTime(test.end_time)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Premium Actions Row - Full Width */}
                  <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                    <TestActions 
                      test={test} 
                      onAction={handleTestAction}
                    />
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
