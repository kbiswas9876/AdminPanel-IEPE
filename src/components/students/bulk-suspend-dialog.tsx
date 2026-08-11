'use client'

import { useState } from 'react'
import { UserX, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { bulkSuspendUsers } from '@/lib/actions/bulk-students'
import type { UserProfile } from '@/lib/supabase/admin'

interface BulkSuspendDialogProps {
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

export function BulkSuspendDialog({ 
  isOpen, 
  onClose, 
  selectedUsers, 
  onSuccess 
}: BulkSuspendDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<BulkOperationResult[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleSuspend = async () => {
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
          const result = await bulkSuspendUsers([userIds[i]])
          
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
      console.error('Bulk suspend error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setResults([])
    setCurrentIndex(0)
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
            <UserX className="h-5 w-5 text-orange-600" />
            Bulk Suspend Users
          </DialogTitle>
          <DialogDescription>
            Suspend {selectedUsers.length} selected users. This will revoke their access but keep their account data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Users List */}
          <div className="max-h-40 overflow-y-auto space-y-2">
            {selectedUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <UserX className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {user.full_name || 'No name provided'}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  Active
                </Badge>
              </div>
            ))}
          </div>

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
                    {successCount} suspended
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
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded">
            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-medium">Important:</p>
              <p>This action will immediately revoke access to the platform for all selected users. Their account data will be preserved and can be reactivated later.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {results.length > 0 ? 'Close' : 'Cancel'}
          </Button>
          {results.length === 0 && (
            <Button 
              onClick={handleSuspend} 
              disabled={isProcessing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isProcessing ? 'Processing...' : `Suspend ${selectedUsers.length} Users`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
