'use client'

import { useState } from 'react'
import { deleteTest, cloneTest, exportTestToPdf, exportAnswerKeyPdf } from '@/lib/actions/tests'
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
import { Edit, Trash2, BarChart3, MoreHorizontal, FileDown, Copy } from 'lucide-react'
import Link from 'next/link'
import type { Test } from '@/lib/supabase/admin'

interface TestActionsProps {
  test: Test
  onAction: () => void
}

export function TestActions({ test, onAction }: TestActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleExportQuestionPaper = async () => {
    try {
      const res = await exportTestToPdf(test.id)
      if (res.success && res.base64 && res.fileName) {
        const link = document.createElement('a')
        link.href = `data:application/pdf;base64,${res.base64}`
        link.download = res.fileName
        link.click()
      } else {
        console.error('Export failed:', res.message)
      }
    } catch (e) {
      console.error('Export error:', e)
    }
  }

  const handleExportAnswerKey = async () => {
    try {
      const res = await exportAnswerKeyPdf(test.id)
      if (res.success && res.base64 && res.fileName) {
        const link = document.createElement('a')
        link.href = `data:application/pdf;base64,${res.base64}`
        link.download = res.fileName
        link.click()
      } else {
        console.error('Export failed:', res.message)
      }
    } catch (e) {
      console.error('Export error:', e)
    }
  }

  const canEdit = (() => {
    const now = new Date()
    const startsAt = test.start_time ? new Date(test.start_time) : null
    return !startsAt || startsAt > now
  })()

  return (
    <div className="flex items-center space-x-2">
      {/* Edit Button - Allowed if start_time is in the future */}
      {canEdit && (
        <Link href={`/tests/edit/${test.id}`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            {test.status === 'draft' ? 'Edit' : 'Edit (Pending)'}
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
        <Button variant="outline" size="sm" disabled>
          <BarChart3 className="h-4 w-4 mr-1" />
          View Results
        </Button>
      )}

      {/* Delete Button - For all tests */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mock Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this mock test?
              <br />
              <br />
              <strong>Test:</strong> {test.name}
              <br />
              <strong>Status:</strong> {test.status}
              <br />
              <br />
              <span className="text-red-600 font-medium">
                ⚠️ This action cannot be undone. All test data and question mappings will be permanently deleted.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Test'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* More actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportQuestionPaper}>
            <FileDown className="h-4 w-4 mr-2" />
            Export Question Paper
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportAnswerKey}>
            <FileDown className="h-4 w-4 mr-2" />
            Export Answer Key
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleClone}>
            <Copy className="h-4 w-4 mr-2" />
            Clone Test
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
