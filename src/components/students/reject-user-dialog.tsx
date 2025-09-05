'use client'

import { useState } from 'react'
import { rejectUser } from '@/lib/actions/students'
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
import { XCircle } from 'lucide-react'
import type { UserProfile } from '@/lib/supabase/admin'

interface RejectUserDialogProps {
  user: UserProfile
  onReject: () => void
}

export function RejectUserDialog({ user, onReject }: RejectUserDialogProps) {
  const [isRejecting, setIsRejecting] = useState(false)

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      const result = await rejectUser(user.id)
      
      if (result.success) {
        onReject()
      } else {
        console.error('Rejection failed:', result.message)
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error rejecting user:', error)
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
          <XCircle className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Student Registration</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reject this student&apos;s registration?
            <br />
            <br />
            <strong>Student:</strong> {user.full_name || 'No name provided'}
            <br />
            <strong>Email:</strong> {user.email || 'No email'}
            <br />
            <br />
            <span className="text-red-600 font-medium">
              ⚠️ This action will permanently delete the user&apos;s account and cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReject}
            disabled={isRejecting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isRejecting ? 'Rejecting...' : 'Reject & Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
