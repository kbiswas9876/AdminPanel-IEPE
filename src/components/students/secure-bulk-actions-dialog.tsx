'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { secureBulkApproveUsers, secureBulkSuspendUsers, secureBulkDeleteUsers } from '@/lib/actions/secure-bulk-students'
import { generateConfirmationCode } from '@/lib/security/confirmation-codes'

interface SecureBulkActionsDialogProps {
  isOpen: boolean
  onClose: () => void
  action: 'approve' | 'suspend' | 'delete'
  selectedUsers: string[]
  userCount: number
}

export function SecureBulkActionsDialog({ 
  isOpen, 
  onClose, 
  action, 
  selectedUsers, 
  userCount 
}: SecureBulkActionsDialogProps) {
  const [reason, setReason] = useState('')
  const [confirmationCode, setConfirmationCode] = useState('')
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'reason' | 'confirmation' | 'processing'>('reason')

  const actionConfig = {
    approve: {
      title: 'Bulk Approve Users',
      description: 'Approve multiple users at once',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      requiresConfirmation: false
    },
    suspend: {
      title: 'Bulk Suspend Users',
      description: 'Suspend multiple users at once',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      requiresConfirmation: false
    },
    delete: {
      title: 'Bulk Delete Users',
      description: 'Permanently delete multiple users',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      requiresConfirmation: true
    }
  }

  const config = actionConfig[action]
  const Icon = config.icon

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true)
    try {
      const { success, code, error } = await generateConfirmationCode(
        'current-user-id', // This would come from auth context
        `bulk_${action}`,
        selectedUsers.join(','),
        10 // 10 minutes expiry
      )

      if (success && code) {
        toast.success('Confirmation code generated')
        setConfirmationCode(code)
        setStep('confirmation')
      } else {
        toast.error(error || 'Failed to generate confirmation code')
      }
    } catch (error) {
      toast.error('Failed to generate confirmation code')
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for this action')
      return
    }

    if (config.requiresConfirmation && !confirmationCode.trim()) {
      toast.error('Please enter the confirmation code')
      return
    }

    setIsLoading(true)
    setStep('processing')

    try {
      const formData = new FormData()
      formData.append('userIds', JSON.stringify(selectedUsers))
      formData.append('reason', reason)
      formData.append('confirmationCode', confirmationCode)
      formData.append('ipAddress', 'unknown') // Would be set by server
      formData.append('userAgent', navigator.userAgent)

      let result
      switch (action) {
        case 'approve':
          result = await secureBulkApproveUsers(formData)
          break
        case 'suspend':
          result = await secureBulkSuspendUsers(formData)
          break
        case 'delete':
          result = await secureBulkDeleteUsers(formData)
          break
        default:
          throw new Error('Invalid action')
      }

      if (result.success) {
        toast.success(result.message)
        onClose()
      } else {
        toast.error(result.error || 'Action failed')
        setStep('reason')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      setStep('reason')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setConfirmationCode('')
    setStep('reason')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.color}`} />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description} - {userCount} user{userCount !== 1 ? 's' : ''} selected
          </DialogDescription>
        </DialogHeader>

        <div className={`p-4 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm">Security Enhanced Action</span>
          </div>
          <p className="text-sm text-gray-600">
            This action includes rate limiting, audit logging, and security verification.
          </p>
        </div>

        {step === 'reason' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Action *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a detailed reason for this bulk action..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="action-type">Action Type</Label>
              <Select value={action} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve Users</SelectItem>
                  <SelectItem value="suspend">Suspend Users</SelectItem>
                  <SelectItem value="delete">Delete Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {config.requiresConfirmation 
                  ? 'This action requires additional confirmation due to its severity.'
                  : 'This action will be logged for security and audit purposes.'
                }
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Confirmation Code Required</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Enter the confirmation code to proceed with this action.
              </p>
            </div>

            <div>
              <Label htmlFor="confirmation-code">Confirmation Code *</Label>
              <Input
                id="confirmation-code"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="Enter 6-digit confirmation code"
                maxLength={6}
                className="mt-1"
              />
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                The confirmation code expires in 10 minutes for security purposes.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              <span>Processing {action}...</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Please wait while we process your request securely.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 'reason' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={config.requiresConfirmation ? handleGenerateCode : handleSubmit}
                disabled={!reason.trim()}
                className={config.color}
              >
                {config.requiresConfirmation ? 'Generate Code' : 'Proceed'}
              </Button>
            </>
          )}

          {step === 'confirmation' && (
            <>
              <Button variant="outline" onClick={() => setStep('reason')}>
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!confirmationCode.trim() || isLoading}
                className={config.color}
              >
                {isLoading ? 'Processing...' : 'Confirm Action'}
              </Button>
            </>
          )}

          {step === 'processing' && (
            <Button variant="outline" onClick={handleClose} disabled>
              Processing...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
