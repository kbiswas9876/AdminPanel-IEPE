'use client'

import { useState } from 'react'
import { demoteToStudent } from '@/lib/actions/students'
import type { UserProfile } from '@/lib/supabase/admin'
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
import { UserMinus } from 'lucide-react'
import { toast } from 'sonner'

interface DemoteToStudentDialogProps {
  user: UserProfile
  onDemote: () => void
}

export function DemoteToStudentDialog({ user, onDemote }: DemoteToStudentDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDemote = async () => {
    setIsLoading(true)
    try {
      const result = await demoteToStudent(user.id)
      
      if (result.success) {
        toast.success(result.message)
        setIsOpen(false)
        onDemote()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error demoting user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-800">
          <UserMinus className="h-4 w-4 mr-1" />
          Demote to Student
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Demote to Student</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to demote <strong>{user.full_name || user.email || 'No email'}</strong> from administrator to student?
            <br /><br />
            This will remove their administrative privileges and they will no longer have access to the admin panel.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDemote}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? 'Demoting...' : 'Demote to Student'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
