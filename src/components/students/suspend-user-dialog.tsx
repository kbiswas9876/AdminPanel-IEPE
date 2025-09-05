'use client'

import { useState } from 'react'
import { suspendUser } from '@/lib/actions/students'
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
import { Shield } from 'lucide-react'
import type { UserProfile } from '@/lib/supabase/admin'

interface SuspendUserDialogProps {
  user: UserProfile
  onSuspend: () => void
}

export function SuspendUserDialog({ user, onSuspend }: SuspendUserDialogProps) {
  const [isSuspending, setIsSuspending] = useState(false)

  const handleSuspend = async () => {
    setIsSuspending(true)
    try {
      const result = await suspendUser(user.id)
      
      if (result.success) {
        onSuspend()
      } else {
        console.error('Suspension failed:', result.message)
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error suspending user:', error)
    } finally {
      setIsSuspending(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-orange-600 border-orange-300 hover:bg-orange-50">
          <Shield className="h-4 w-4 mr-1" />
          Suspend
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suspend Student Access</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to suspend this student&apos;s access to the platform?
            <br />
            <br />
            <strong>Student:</strong> {user.full_name || 'No name provided'}
            <br />
            <strong>Email:</strong> {user.email || 'No email'}
            <br />
            <br />
            <span className="text-orange-600 font-medium">
              This will revoke their access but keep their account data. You can reactivate them later.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSuspend}
            disabled={isSuspending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSuspending ? 'Suspending...' : 'Suspend Access'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
