'use client'

import { useState } from 'react'
import { deleteTest, cloneTest, exportTestToPdf, exportAnswerKeyPdf, exportMinimalistPdf, exportQuestionPaperPdf } from '@/lib/actions/tests'
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
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<string | null>(null)

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

  const handleExport = async (type: 'premium' | 'minimalist' | 'answer-key') => {
    setIsExporting(true)
    setExportType(type)
    
    try {
      let res
      switch (type) {
        case 'premium':
          res = await exportQuestionPaperPdf(test.id)
          break
        case 'minimalist':
          res = await exportMinimalistPdf(test.id)
          break
        case 'answer-key':
          res = await exportAnswerKeyPdf(test.id)
          break
        default:
          throw new Error('Invalid export type')
      }

      if (res.success && res.base64 && res.fileName) {
        const link = document.createElement('a')
        link.href = `data:application/pdf;base64,${res.base64}`
        link.download = res.fileName
        link.click()
        
        // Show success feedback
        console.log(`✅ ${type} PDF exported successfully: ${res.fileName}`)
      } else {
        console.error(`❌ Export failed:`, res.message)
        alert(`Export failed: ${res.message || 'Unknown error'}`)
      }
    } catch (e) {
      console.error(`❌ Export error:`, e)
      alert(`Export failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setIsExporting(false)
      setExportType(null)
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
          <DropdownMenuItem 
            onClick={() => handleExport('premium')}
            disabled={isExporting}
          >
            {isExporting && exportType === 'premium' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            {isExporting && exportType === 'premium' ? 'Exporting...' : 'Export Premium PDF'}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleExport('minimalist')}
            disabled={isExporting}
          >
            {isExporting && exportType === 'minimalist' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            {isExporting && exportType === 'minimalist' ? 'Exporting...' : 'Export Minimalist PDF'}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleExport('answer-key')}
            disabled={isExporting}
          >
            {isExporting && exportType === 'answer-key' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            {isExporting && exportType === 'answer-key' ? 'Exporting...' : 'Export Answer Key'}
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
