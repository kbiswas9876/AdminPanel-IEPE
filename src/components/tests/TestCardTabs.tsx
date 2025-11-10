'use client'

import * as Tabs from '@radix-ui/react-tabs'
import { useState } from 'react'
import Link from 'next/link'
import { FileText, Clock, Settings, Activity, Eye, Edit, Copy, Trash2, Loader2, Zap } from 'lucide-react'
import type { Test } from '@/lib/supabase/admin'
import { Timeline } from './Timeline'
import { TestActions } from './test-actions'
import { TestControlToggles } from './test-control-toggles'
import { TestProgressCard } from './test-progress-card'
import { Button } from '@/components/ui/button'
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
import { deleteTest, cloneTest, declareResultsNow } from '@/lib/actions/tests'

interface TestCardTabsProps {
  test: Test & { question_count?: number, dynamic_status?: 'draft' | 'scheduled' | 'live' | 'completed' }
  progress: {
    total_taken: number
    submitted: number
    in_progress: number
  }
  progressLoading: boolean
  onAction: () => void
}

export function TestCardTabs({ test, progress, progressLoading, onAction }: TestCardTabsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeclaring, setIsDeclaring] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteTest(test.id)
      
      if (result.success) {
        onAction()
      } else {
        console.error('Delete failed:', result.message)
      }
    } catch (error) {
      console.error('Error deleting test:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeclareResults = async () => {
    setIsDeclaring(true)
    try {
      const result = await declareResultsNow(test.id)
      if (result.success) {
        onAction()
      } else {
        console.error('Declare results failed:', result.message)
      }
    } catch (error) {
      console.error('Error declaring results:', error)
    } finally {
      setIsDeclaring(false)
    }
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

  const canEdit = (() => {
    const now = new Date()
    const startsAt = test.start_time ? new Date(test.start_time) : null
    return !startsAt || startsAt > now
  })()

  const getStatusBadge = (test: Test) => {
    const isPerpetual = test.status === 'scheduled' && !test.end_time
    if (isPerpetual) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">Perpetual</span>
        </span>
      )
    }
    
    switch (test.dynamic_status) {
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

  return (
    <Tabs.Root defaultValue="overview" className="w-full">
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
      <Tabs.List className="flex border-b">
        <Tabs.Trigger value="overview" className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>Overview</span>
          </div>
        </Tabs.Trigger>
        <Tabs.Trigger value="settings" className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </div>
        </Tabs.Trigger>
        <Tabs.Trigger value="activity" className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Activity</span>
          </div>
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview" className="p-4">
        <div className="space-y-4">
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
          <Timeline test={test} />
          <div className="pt-4 border-t border-gray-100">
            <TestActions test={test} onAction={onAction} />
          </div>
        </div>
      </Tabs.Content>
      <Tabs.Content value="settings" className="p-4 space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Test Controls</h4>
          <p className="text-sm text-gray-500 mb-4">Configure how students interact with the test.</p>
          <TestControlToggles test={test} onUpdate={onAction} />
        </div>
        <div className="pt-6 border-t border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Test Management</h4>
          <p className="text-sm text-gray-500 mb-4">Actions related to managing this test.</p>
          <div className="flex flex-wrap gap-3">
            {canEdit && (
              <Link href={`/tests/edit/${test.id}`}>
                <Button variant="outline" size="sm" className="h-8 px-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-150">
                  <Edit className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
                  <span>Edit Test</span>
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={handleClone} className="h-8 px-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-150">
              <Copy className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
              <span>Clone Test</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
                  <span>Delete Test</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-md rounded-2xl border-gray-200 shadow-xl">
                <AlertDialogHeader className="space-y-4">
                  <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                    <Trash2 className="h-7 w-7 text-red-600" strokeWidth={1.5} />
                  </div>
                  <AlertDialogTitle className="text-center text-xl font-semibold text-gray-900">
                    Delete Mock Test?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-center text-sm text-gray-600">
                    This will permanently delete the mock test and all associated data.
                  </AlertDialogDescription>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left">
                    <div className="text-xs text-gray-500 mb-1">Test Name</div>
                    <div className="text-sm font-semibold text-gray-900">{test.name}</div>
                    <div className="text-xs text-gray-500 mt-2 mb-1">Status</div>
                    <div className="text-sm text-gray-700">{test.status}</div>
                  </div>
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
        </div>
      </Tabs.Content>
      <Tabs.Content value="activity" className="p-4">
        <TestProgressCard progress={progress} isLoading={progressLoading} />
      </Tabs.Content>
    </Tabs.Root>
  )
}

