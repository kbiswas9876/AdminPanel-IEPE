'use client'

import { useState } from 'react'
import { deleteTest, cloneTest, exportAnswerKeyPdf, exportMinimalistPdf, exportQuestionPaperPdf } from '@/lib/actions/tests'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PublishTestDialog } from './publish-test-dialog'
import { Edit, Trash2, BarChart3, MoreHorizontal, FileDown, Copy, Loader2, CheckCircle, XCircle } from 'lucide-react'
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
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [exportProgress, setExportProgress] = useState('')
  const [exportStatus, setExportStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle')

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
    setShowProgressModal(true)
    setExportStatus('generating')
    setExportProgress('Initializing PDF generation...')
    
    try {
      // Simulate progress updates
      const progressSteps = [
        'Initializing PDF generation...',
        'Loading test data...',
        'Rendering HTML template...',
        'Generating PDF document...',
        'Finalizing export...'
      ]
      
      let currentStep = 0
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length - 1) {
          currentStep++
          setExportProgress(progressSteps[currentStep])
        }
      }, 1000)
      
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

      clearInterval(progressInterval)
      setExportProgress('Export completed!')

      if (res.success && res.base64 && res.fileName) {
        setExportStatus('success')
        setExportProgress(`Successfully generated ${res.fileName}`)
        
        // Download the file
        const link = document.createElement('a')
        link.href = `data:application/pdf;base64,${res.base64}`
        link.download = res.fileName
        link.click()
        
        // Show success feedback
        console.log(`✅ ${type} PDF exported successfully: ${res.fileName}`)
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowProgressModal(false)
          setExportStatus('idle')
        }, 2000)
      } else {
        setExportStatus('error')
        setExportProgress(`Export failed: ${res.message || 'Unknown error'}`)
        console.error(`❌ Export failed:`, res.message)
      }
    } catch (e) {
      setExportStatus('error')
      setExportProgress(`Export failed: ${e instanceof Error ? e.message : 'Unknown error'}`)
      console.error(`❌ Export error:`, e)
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
          <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95">
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
        <Button variant="outline" size="sm" disabled className="hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-200 transform hover:scale-105 active:scale-95">
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
            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-all duration-200 transform hover:scale-105 active:scale-95"
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
              className="bg-red-600 hover:bg-red-700 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Test'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* More actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 transform hover:scale-105 active:scale-95">
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

      {/* PDF Export Progress Modal */}
      <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {exportStatus === 'generating' && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
              {exportStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {exportStatus === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
              <span>
                {exportStatus === 'generating' && 'Generating PDF...'}
                {exportStatus === 'success' && 'Export Successful!'}
                {exportStatus === 'error' && 'Export Failed'}
              </span>
            </DialogTitle>
            <DialogDescription>
              {exportProgress}
            </DialogDescription>
          </DialogHeader>
          
          {exportStatus === 'generating' && (
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                Please wait while we generate your PDF document...
              </p>
            </div>
          )}
          
          {exportStatus === 'success' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">
                Your PDF has been generated and downloaded successfully!
              </p>
            </div>
          )}
          
          {exportStatus === 'error' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-sm text-gray-600">
                There was an error generating your PDF. Please try again.
              </p>
              <Button 
                onClick={() => setShowProgressModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
