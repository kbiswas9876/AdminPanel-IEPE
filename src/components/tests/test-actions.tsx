'use client'

import { useState } from 'react'
import { PremiumPDFExporter } from './premium-pdf-exporter'
import { TestPreviewModal } from './test-preview-modal'
import type { Question as AdminQuestion } from '@/lib/supabase/admin'
import type { TestQuestionSlot } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PublishTestDialog } from './publish-test-dialog'
import { BarChart3, MoreHorizontal, FileDown, Eye } from 'lucide-react'
import Link from 'next/link'
import type { Test } from '@/lib/supabase/admin'

interface TestActionsProps {
  test: Test & { dynamic_status?: 'draft' | 'scheduled' | 'live' | 'completed' }
  onAction: () => void
}

export function TestActions({ test, onAction }: TestActionsProps) {
  const [showPremiumExporter, setShowPremiumExporter] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [testData, setTestData] = useState<{ test: Test; questions: AdminQuestion[] } | null>(null)
  const [previewData, setPreviewData] = useState<{ test: Test; questions: TestQuestionSlot[] } | null>(null)

  const handlePublish = () => {
    onAction() // Refresh the list after publishing
  }

  const handleOpenPremiumExporter = async () => {
    try {
      // Fetch test and questions data
      const { getTestDetailsForEdit } = await import('@/lib/actions/tests')
      const testDetails = await getTestDetailsForEdit(test.id)
      
      if (testDetails && testDetails.test && testDetails.questions) {
        const questionData = testDetails.questions.map(slot => slot.question) as AdminQuestion[]
        setTestData({ test: testDetails.test, questions: questionData })
        setShowPremiumExporter(true)
      } else {
        console.error('Failed to fetch test data:', testDetails)
      }
    } catch (error) {
      console.error('Error opening premium exporter:', error)
    }
  }

  const handleOpenPreview = async () => {
    try {
      // Fetch test and questions data
      const { getTestDetailsForEdit } = await import('@/lib/actions/tests')
      const testDetails = await getTestDetailsForEdit(test.id)
      
      if (testDetails && testDetails.test && testDetails.questions) {
        setPreviewData({ test: testDetails.test, questions: testDetails.questions })
        setShowPreview(true)
      } else {
        console.error('Failed to fetch test data for preview:', testDetails)
      }
    } catch (error) {
      console.error('Error opening test preview:', error)
    }
  }

  const hasStarted = (() => {
    const now = new Date()
    const startsAt = test.start_time ? new Date(test.start_time) : null
    return startsAt && startsAt <= now
  })()

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {/* Publish Button - Allow publishing drafts */}
        {test.status === 'draft' && (
          <PublishTestDialog 
            test={test} 
            onPublish={handlePublish}
          />
        )}

        {/* View Report Button - For tests that have started (live, completed, or perpetual tests that started) */}
        {(test.dynamic_status === 'live' || test.dynamic_status === 'completed' || (test.status === 'scheduled' && hasStarted)) && (
          <>
            <Link href={`/tests/${test.id}/report`}>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-150">
                <BarChart3 className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
                <span>View Report</span>
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleOpenPreview}
              className="h-8 px-3 text-sm font-medium text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors duration-150"
            >
              <Eye className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
              <span>Preview Test</span>
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150">
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleOpenPremiumExporter}>
              <FileDown className="h-4 w-4 mr-2" strokeWidth={1.5} />
              Export PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Premium PDF Exporter */}
      {testData && (
        <PremiumPDFExporter
          test={testData.test}
          questions={testData.questions}
          isOpen={showPremiumExporter}
          onClose={() => {
            setShowPremiumExporter(false)
            setTestData(null)
          }}
        />
      )}

      {/* Test Preview Modal */}
      {previewData && (
        <TestPreviewModal
          open={showPreview}
          onClose={() => {
            setShowPreview(false)
            setPreviewData(null)
          }}
          testName={previewData.test.name}
          description={previewData.test.description || ''}
          totalTimeMinutes={previewData.test.total_time_minutes}
          marksPerCorrect={previewData.test.marks_per_correct}
          penaltyPerIncorrect={previewData.test.negative_marks_per_incorrect}
          questions={previewData.questions}
        />
      )}
    </div>
  )
}

