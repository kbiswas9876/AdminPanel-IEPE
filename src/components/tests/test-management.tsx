'use client'

import { useState, useEffect } from 'react'
import { getAllTestsWithCounts } from '@/lib/actions/tests'
import type { Test } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'
import { TestCardTabs } from './TestCardTabs'
import { useDynamicStatus } from '@/hooks/useDynamicStatus'

interface TestManagementProps {
  onCreateTest?: () => void
}

export function TestManagement({ onCreateTest }: TestManagementProps = {}) {
  const [initialTests, setInitialTests] = useState<Array<Test & { question_count?: number }>>([])
  const dynamicTests = useDynamicStatus(initialTests)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Progress data state: testId -> progress stats
  const [progressData, setProgressData] = useState<Record<string, {
    total_taken: number
    submitted: number
    in_progress: number
  }>>({})
  const [progressLoading, setProgressLoading] = useState(false)

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const allTests = await getAllTestsWithCounts()
        setInitialTests(allTests)
      } catch (err) {
        setError('Failed to fetch tests')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [])

  // Fetch progress data for all tests
  const fetchProgressData = async (testIds: number[]) => {
    if (testIds.length === 0) return

    setProgressLoading(true)
    try {
      const testIdsParam = testIds.join(',')
      const response = await fetch(`/api/tests/progress?testIds=${testIdsParam}`)
      
      if (!response.ok) {
        console.error('Failed to fetch progress data:', response.statusText)
        return
      }

      const data = await response.json()
      setProgressData(data)
    } catch (err) {
      console.error('Error fetching progress data:', err)
    } finally {
      setProgressLoading(false)
    }
  }

  // Fetch progress when tests are loaded and poll for updates
  useEffect(() => {
    if (initialTests.length === 0) return

    const testIds = initialTests.map(test => test.id)
    
    // Fetch immediately
    fetchProgressData(testIds)
    
    // Poll for progress updates every 30 seconds
    const intervalId = setInterval(() => {
      fetchProgressData(testIds)
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTests.length]) // Re-run when number of tests changes

  const handleTestAction = () => {
    // Refresh the tests list
    const fetchTests = async () => {
      try {
        const allTests = await getAllTestsWithCounts()
        setInitialTests(allTests)
      } catch (err) {
        setError('Failed to fetch tests')
        console.error('Error:', err)
      }
    }
    
    fetchTests()
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
      {dynamicTests.length === 0 && !loading ? (
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
          {dynamicTests.map((test) => (
            <div
              key={test.id}
              className="group relative bg-white rounded-xl border border-gray-200 p-5 transition-all duration-200 hover:shadow-md hover:border-gray-300"
            >
              <TestCardTabs 
                test={test} 
                progress={progressData[test.id.toString()]}
                progressLoading={progressLoading}
                onAction={handleTestAction}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

