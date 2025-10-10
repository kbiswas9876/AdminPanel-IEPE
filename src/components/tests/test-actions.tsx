'use client'

import { useState } from 'react'
import { deleteTest, cloneTest } from '@/lib/actions/tests'
import { PremiumPDFExporter } from './premium-pdf-exporter'
import type { Question as AdminQuestion } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { PublishTestDialog } from './publish-test-dialog'
import { Edit, Trash2, BarChart3, MoreHorizontal, FileDown, Copy, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { Test } from '@/lib/supabase/admin'

interface TestActionsProps {
  test: Test
  onAction: () => void
}

export function TestActions({ test, onAction }: TestActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPremiumExporter, setShowPremiumExporter] = useState(false)
  const [testData, setTestData] = useState<{ test: Test; questions: AdminQuestion[] } | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteTest(test.id)
      
      if (result.success) {
        onAction()
      } else {
        console.error('Delete failed:', result.message)
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error deleting test:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePublish = () => {
    onAction() // Refresh the list after publishing
  }

  const handleClone = async () => {
    try {
      const res = await cloneTest(test.id)
      if (!res.success) {
        console.error('Clone failed:', res.message)
      } else {
        onAction()
      }
    } catch (e) {
      console.error('Clone error:', e)
    }
  }

  const handleOpenPremiumExporter = async () => {
    try {
      // Fetch test and questions data
      const { getTestDetailsForEdit } = await import('@/lib/actions/tests')
      const testDetails = await getTestDetailsForEdit(test.id)
      
      if (testDetails && testDetails.test && testDetails.questions) {
        console.log('Raw testDetails structure:', testDetails);
        console.log('testDetails.questions structure:', testDetails.questions);
        console.log('First question slot:', testDetails.questions[0]);
        
        // Convert TestQuestionSlot[] to Question[]
        const questionData = testDetails.questions.map((slot, index) => {
          console.log(`Processing question slot ${index + 1}:`, slot);
          return slot.question;
        }) as AdminQuestion[];
        
        console.log('Extracted question data:', questionData);
        console.log('First extracted question:', questionData[0]);
        
        setTestData({ test: testDetails.test, questions: questionData })
        setShowPremiumExporter(true)
      } else {
        console.error('Failed to fetch test data:', testDetails)
      }
    } catch (error) {
      console.error('Error opening premium exporter:', error)
    }
  }


  const canEdit = (() => {
    const now = new Date()
    const startsAt = test.start_time ? new Date(test.start_time) : null
    return !startsAt || startsAt > now
  })()

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {/* Edit Button - Allowed if start_time is in the future */}
        {canEdit && (
          <Link href={`/tests/edit/${test.id}`}>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-150">
              <Edit className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
              <span>Edit</span>
            </Button>
          </Link>
        )}

        {/* Publish Button - Allow publishing drafts */}
        {test.status === 'draft' && (
          <PublishTestDialog 
            test={test} 
            onPublish={handlePublish}
          />
        )}

        {/* View Results Button - Only for Completed tests */}
        {test.status === 'completed' && (
          <Button variant="ghost" size="sm" disabled className="h-8 px-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-150">
            <BarChart3 className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
            <span>Results</span>
          </Button>
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
            <DropdownMenuItem onClick={handleClone}>
              <Copy className="h-4 w-4 mr-2" strokeWidth={1.5} />
              Clone Test
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete Button - Icon only, in dropdown-style */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md rounded-2xl border-gray-200 shadow-xl">
            <AlertDialogHeader className="space-y-4">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                <Trash2 className="h-7 w-7 text-red-600" strokeWidth={1.5} />
              </div>
              
              <AlertDialogTitle className="text-center text-xl font-semibold text-gray-900">
                Delete Mock Test?
              </AlertDialogTitle>
              
              <AlertDialogDescription className="text-center text-sm text-gray-600">
                This will permanently delete the mock test and all associated data.
              </AlertDialogDescription>
              
              {/* Test Info Display */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left">
                <div className="text-xs text-gray-500 mb-1">Test Name</div>
                <div className="text-sm font-semibold text-gray-900">{test.name}</div>
                <div className="text-xs text-gray-500 mt-2 mb-1">Status</div>
                <div className="text-sm text-gray-700">{test.status}</div>
              </div>

              {/* Warning Message */}
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                </div>
                <div className="text-xs text-red-900 text-left flex-1">
                  This action cannot be undone. All test data and question mappings will be permanently deleted.
                </div>
              </div>
            </AlertDialogHeader>
            
            <AlertDialogFooter className="flex-col sm:flex-col gap-2 sm:gap-2">
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Test'
                )}
              </AlertDialogAction>
              <AlertDialogCancel className="w-full h-11 mt-0 bg-gray-100 hover:bg-gray-200 text-gray-900 border-0 rounded-xl font-medium transition-all duration-200">
                Cancel
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
    </div>
  )
}
