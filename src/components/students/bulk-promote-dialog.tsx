'use client'

import { useState } from 'react'
import { UserPlus, UserX, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
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
import { bulkPromoteUsers, bulkDemoteUsers } from '@/lib/actions/bulk-students'
import type { UserProfile } from '@/lib/supabase/admin'

interface BulkPromoteDialogProps {
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

export function BulkPromoteDialog({ 
  isOpen, 
  onClose, 
  selectedUsers, 
  onSuccess 
}: BulkPromoteDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<BulkOperationResult[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [action, setAction] = useState<'promote' | 'demote' | null>(null)

  // Determine the action based on selected users
  const canPromote = selectedUsers.some(user => user.role === 'student')
  const canDemote = selectedUsers.some(user => user.role === 'admin')

  const handlePromote = async () => {
    if (!action) return
    
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
          const result = action === 'promote' 
            ? await bulkPromoteUsers([userIds[i]])
            : await bulkDemoteUsers([userIds[i]])
          
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
      console.error('Bulk role change error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setResults([])
    setCurrentIndex(0)
    setAction(null)
    onClose()
  }

  const successCount = results.filter(r => r.success).length
  const errorCount = results.filter(r => !r.success).length
  const progress = selectedUsers.length > 0 ? ((currentIndex + 1) / selectedUsers.length) * 100 : 0

  const getActionTitle = () => {
    if (action === 'promote') return 'Bulk Promote to Admin'
    if (action === 'demote') return 'Bulk Demote to Student'
    return 'Change User Roles'
  }

  const getActionDescription = () => {
    if (action === 'promote') return `Promote ${selectedUsers.length} selected users to administrator role.`
    if (action === 'demote') return `Demote ${selectedUsers.length} selected users to student role.`
    return 'Change the roles of selected users.'
  }

  const getActionButtonText = () => {
    if (action === 'promote') return `Promote ${selectedUsers.length} Users`
    if (action === 'demote') return `Demote ${selectedUsers.length} Users`
    return 'Change Roles'
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'promote' ? (
              <UserPlus className="h-5 w-5 text-blue-600" />
            ) : action === 'demote' ? (
              <UserX className="h-5 w-5 text-orange-600" />
            ) : (
              <UserPlus className="h-5 w-5 text-gray-600" />
            )}
            {getActionTitle()}
          </DialogTitle>
          <DialogDescription>
            {getActionDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Selection */}
          {!action && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Choose an action:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {canPromote && (
                  <Button
                    variant="outline"
                    onClick={() => setAction('promote')}
                    className="flex items-center gap-2 p-4 h-auto"
                  >
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium">Promote to Admin</p>
                      <p className="text-xs text-gray-500">Grant administrative privileges</p>
                    </div>
                  </Button>
                )}
                {canDemote && (
                  <Button
                    variant="outline"
                    onClick={() => setAction('demote')}
                    className="flex items-center gap-2 p-4 h-auto"
                  >
                    <UserX className="h-5 w-5 text-orange-600" />
                    <div className="text-left">
                      <p className="font-medium">Demote to Student</p>
                      <p className="text-xs text-gray-500">Remove administrative privileges</p>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Selected Users List */}
          {action && (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {selectedUsers.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      action === 'promote' ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      {action === 'promote' ? (
                        <UserPlus className="h-4 w-4 text-blue-600" />
                      ) : (
                        <UserX className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {user.full_name || 'No name provided'}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={
                    action === 'promote' 
                      ? 'text-blue-700 border-blue-300' 
                      : 'text-orange-700 border-orange-300'
                  }>
                    {user.role === 'admin' ? 'Admin' : 'Student'}
                  </Badge>
                </div>
              ))}
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
                    {successCount} {action === 'promote' ? 'promoted' : 'demoted'}
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
          {action && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Important:</p>
                <p>
                  {action === 'promote' 
                    ? 'This will grant administrative privileges to selected users. They will have full access to the admin panel.'
                    : 'This will remove administrative privileges from selected users. They will only have student access.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {results.length > 0 ? 'Close' : action ? 'Back' : 'Cancel'}
          </Button>
          {action && results.length === 0 && (
            <Button 
              onClick={handlePromote} 
              disabled={isProcessing}
              className={action === 'promote' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}
            >
              {isProcessing ? 'Processing...' : getActionButtonText()}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
