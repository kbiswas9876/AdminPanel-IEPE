'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { bulkDeleteUsers } from '@/lib/actions/bulk-students'
import type { UserProfile } from '@/lib/supabase/admin'

interface BulkDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedUsers: UserProfile[]
  onSuccess: () => void
}

interface BulkOperationResult {
  success: boolean
  userId: string
  userName: string
  error?: string
}

export function BulkDeleteDialog({ 
  isOpen, 
  onClose, 
  selectedUsers, 
  onSuccess 
}: BulkDeleteDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<BulkOperationResult[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [confirmationText, setConfirmationText] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)

  const expectedConfirmation = 'DELETE'
  const isConfirmationValid = confirmationText === expectedConfirmation

  const handleDelete = async () => {
    if (!isConfirmationValid) return
    
    setIsProcessing(true)
    setResults([])
    setCurrentIndex(0)

    const userIds = selectedUsers.map(user => user.id)
    const operationResults: BulkOperationResult[] = []

    try {
      // Process users one by one to show progress
      for (let i = 0; i < userIds.length; i++) {
        setCurrentIndex(i)
        
        try {
          const result = await bulkDeleteUsers([userIds[i]])
          
          operationResults.push({
            success: result.success,
            userId: userIds[i],
            userName: selectedUsers[i].full_name || selectedUsers[i].email || 'Unknown',
            error: result.message
          })
        } catch (error) {
          operationResults.push({
            success: false,
            userId: userIds[i],
            userName: selectedUsers[i].full_name || selectedUsers[i].email || 'Unknown',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
        
        setResults([...operationResults])
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Check if any operations succeeded
      const successCount = operationResults.filter(r => r.success).length
      if (successCount > 0) {
        onSuccess()
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setResults([])
    setCurrentIndex(0)
    setConfirmationText('')
    setIsConfirmed(false)
    onClose()
  }

  const successCount = results.filter(r => r.success).length
  const errorCount = results.filter(r => !r.success).length
  const progress = selectedUsers.length > 0 ? ((currentIndex + 1) / selectedUsers.length) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Bulk Delete Users
          </DialogTitle>
          <DialogDescription>
            Permanently delete {selectedUsers.length} selected users. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Users List */}
          <div className="max-h-40 overflow-y-auto space-y-2">
            {selectedUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {user.full_name || 'No name provided'}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-red-700 border-red-300">
                  {user.status}
                </Badge>
              </div>
            ))}
          </div>

          {/* Confirmation Input */}
          {results.length === 0 && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800 font-medium mb-2">
                  This action is irreversible!
                </p>
                <p className="text-sm text-red-700">
                  All user data, including test results, bookmarks, and progress will be permanently deleted.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Type <code className="bg-gray-100 px-1 rounded">DELETE</code> to confirm:
                </label>
                <Input
                  value={confirmationText}
                  onChange={(e) => {
                    setConfirmationText(e.target.value)
                    setIsConfirmed(e.target.value === expectedConfirmation)
                  }}
                  placeholder="Type DELETE to confirm"
                  className="font-mono"
                />
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing users...</span>
                <span>{currentIndex + 1} of {selectedUsers.length}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-sm">
                {successCount > 0 && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    {successCount} deleted
                  </div>
                )}
                {errorCount > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle className="h-4 w-4" />
                    {errorCount} failed
                  </div>
                )}
              </div>

              {/* Detailed Results */}
              <div className="max-h-32 overflow-y-auto space-y-1">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <span className="font-medium">{result.userName}</span>
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      {result.error && (
                        <span className="text-xs text-red-600">{result.error}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Dangerous Action:</p>
              <p>This will permanently delete all user accounts and associated data. This action cannot be undone.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {results.length > 0 ? 'Close' : 'Cancel'}
          </Button>
          {results.length === 0 && (
            <Button 
              onClick={handleDelete} 
              disabled={isProcessing || !isConfirmationValid}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Processing...' : `Delete ${selectedUsers.length} Users`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
