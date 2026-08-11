'use client'

import { useState } from 'react'
import { rejectUser, requestUserCorrection } from '@/lib/actions/students'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { XCircle, RotateCcw, Trash2, AlertTriangle, Send } from 'lucide-react'
import type { UserProfile } from '@/lib/supabase/admin'

interface RejectUserDialogProps {
  user: UserProfile
  onReject: () => void
}

const PREDEFINED_REASONS = [
  'Full name appears invalid or incomplete. Please provide your real name.',
  'Phone number is invalid or incorrect format (+91 10-digits required).',
  'State/City location details are missing or incorrect.',
  'Target exam selection requires clarification.',
  'Other / Custom Feedback (type below)',
]

export function RejectUserDialog({ user, onReject }: RejectUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [actionType, setActionType] = useState<'revision' | 'delete'>('revision')
  const [selectedReason, setSelectedReason] = useState(PREDEFINED_REASONS[0])
  const [customMessage, setCustomMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAction = async () => {
    setIsProcessing(true)
    try {
      if (actionType === 'revision') {
        const finalReason = selectedReason === PREDEFINED_REASONS[4]
          ? (customMessage.trim() || 'Please correct your details and resubmit for approval.')
          : selectedReason + (customMessage.trim() ? ` Additional note: ${customMessage.trim()}` : '')

        const result = await requestUserCorrection(user.id, finalReason)
        if (result.success) {
          setIsOpen(false)
          onReject()
        } else {
          alert(`Error: ${result.message}`)
        }
      } else {
        const result = await rejectUser(user.id)
        if (result.success) {
          setIsOpen(false)
          onReject()
        } else {
          alert(`Error: ${result.message}`)
        }
      }
    } catch (error) {
      console.error('Error executing user action:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
          <XCircle className="h-4 w-4 mr-1" />
          Reject / Revise
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Reject or Request Revision
          </DialogTitle>
          <DialogDescription>
            Choose how to process this student registration:
            <br />
            <strong>Student:</strong> {user.full_name || 'No name provided'} ({user.email})
          </DialogDescription>
        </DialogHeader>

        {/* Action Type Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 my-2">
          <button
            type="button"
            onClick={() => setActionType('revision')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              actionType === 'revision'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5 text-blue-600" />
            Request Revision (Soft Reject)
          </button>
          <button
            type="button"
            onClick={() => setActionType('delete')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              actionType === 'delete'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Account (Spam)
          </button>
        </div>

        {actionType === 'revision' ? (
          <div className="space-y-3 py-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <p className="font-semibold text-blue-900 mb-1">How Soft Rejection Works:</p>
              The account is <strong>NOT deleted</strong>. The student will see your feedback message upon sign in, can update their profile details, and resubmit for approval.
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select Feedback Reason
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {PREDEFINED_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Custom Feedback Note / Instructions (Optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="w-full text-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Type specific instructions for the student..."
              />
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Permanent Account Deletion</strong>
                <p className="mt-1">
                  This will immediately and permanently delete this student account from Supabase Auth and User Profiles. Use this for SPAM or malicious signups. This cannot be undone.
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleAction}
            disabled={isProcessing}
            className={actionType === 'revision' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {isProcessing ? (
              'Processing...'
            ) : actionType === 'revision' ? (
              <>
                <Send className="h-3.5 w-3.5 mr-1" />
                Send Revision Request
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Permanently Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
