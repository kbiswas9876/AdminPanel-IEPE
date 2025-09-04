'use client'

import { useState } from 'react'
import { approveUser } from '@/lib/actions/students'
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
import { CheckCircle } from 'lucide-react'
import type { UserProfile } from '@/lib/supabase/admin'

interface ApproveUserDialogProps {
  user: UserProfile
  onApprove: () => void
}

export function ApproveUserDialog({ user, onApprove }: ApproveUserDialogProps) {
  const [isApproving, setIsApproving] = useState(false)

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const result = await approveUser(user.id)
      
      if (result.success) {
        onApprove()
      } else {
        console.error('Approval failed:', result.message)
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error approving user:', error)
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-1" />
          Approve
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve Student Access</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to approve this student&apos;s access to the platform?
            <br />
            <br />
            <strong>Student:</strong> {user.full_name || 'No name provided'}
            <br />
            <strong>Email:</strong> {user.email}
            <br />
            <br />
            This will grant them full access to the platform.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleApprove}
            disabled={isApproving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isApproving ? 'Approving...' : 'Approve Access'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
