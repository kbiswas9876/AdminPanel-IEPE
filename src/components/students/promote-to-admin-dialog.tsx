'use client'

import { useState } from 'react'
import { promoteToAdmin } from '@/lib/actions/students'
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
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'

interface PromoteToAdminDialogProps {
  user: UserProfile
  onPromote: () => void
}

export function PromoteToAdminDialog({ user, onPromote }: PromoteToAdminDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePromote = async () => {
    setIsLoading(true)
    try {
      const result = await promoteToAdmin(user.id)
      
      if (result.success) {
        toast.success(result.message)
        setIsOpen(false)
        onPromote()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Error promoting user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-800">
          <UserPlus className="h-4 w-4 mr-1" />
          Promote to Admin
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Promote to Administrator</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to promote <strong>{user.full_name || user.email}</strong> to an administrator?
            <br /><br />
            This will give them full access to the admin panel and all administrative functions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handlePromote}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Promoting...' : 'Promote to Admin'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
