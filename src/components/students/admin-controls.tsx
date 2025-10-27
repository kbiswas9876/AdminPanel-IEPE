'use client'

import { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { 
  UserCheck, 
  UserX, 
  Shield, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  FileText,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'
import type { UserProfile } from '@/lib/supabase/admin'
import { updateStudentStatus, addAdminNote, getStudentNotesWithAdmin } from '@/lib/actions/studentAdminActions'
import { useAuth } from '@/lib/auth'

interface AdminControlsProps {
  user: UserProfile
  onAction: () => void
}

export function AdminControls({ user, onAction }: AdminControlsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState<Array<{ id: number; note: string; admin_name?: string; admin_email?: string; created_at: string }>>([])
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [loadingNotes, setLoadingNotes] = useState(true)
  const { user: currentAdmin } = useAuth()

  // Fetch notes on mount
  useEffect(() => {
    const fetchNotes = async () => {
      setLoadingNotes(true)
      try {
        const fetchedNotes = await getStudentNotesWithAdmin(user.id)
        setNotes(fetchedNotes)
      } catch (error) {
        console.error('Error fetching notes:', error)
        toast.error('Failed to load admin notes')
      } finally {
        setLoadingNotes(false)
      }
    }
    fetchNotes()
  }, [user.id])

  const handleAction = async (action: string) => {
    if (action === 'suspend' || action === 'activate' || action === 'approve') {
      setActionType(action)
      setIsDialogOpen(true)
    }
  }

  const executeAction = async (action: string, reason: string) => {
    if (!currentAdmin?.id) {
      toast.error('Admin authentication required')
      return
    }

    startTransition(async () => {
      try {
        let targetStatus: 'pending' | 'active' | 'suspended'
        
        switch (action) {
          case 'approve':
            targetStatus = 'active'
            break
          case 'activate':
            targetStatus = 'active'
            break
          case 'suspend':
            targetStatus = 'suspended'
            break
          default:
            toast.error('Invalid action')
            return
        }

        const result = await updateStudentStatus(user.id, targetStatus, currentAdmin.id, reason)
        
        if (result.success) {
          toast.success(result.message)
          onAction()
          setIsDialogOpen(false)
          setReason('')
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        console.error('Error executing action:', error)
        toast.error('Failed to execute action')
      }
    })
  }

  const handleConfirmAction = () => {
    if (actionType) {
      executeAction(actionType, reason)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !currentAdmin?.id) {
      toast.error('Note cannot be empty')
      return
    }

    setAddingNote(true)
    try {
      const result = await addAdminNote(user.id, newNote, currentAdmin.id)
      
      if (result.success) {
        toast.success('Note added successfully')
        setNewNote('')
        // Refresh notes
        const updatedNotes = await getStudentNotesWithAdmin(user.id)
        setNotes(updatedNotes)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('Failed to add note')
    } finally {
      setAddingNote(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'suspended':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>
      case 'pending':
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">Admin</Badge>
      case 'student':
        return <Badge variant="outline">Student</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const canApprove = user.status === 'pending'
  const canSuspend = user.status === 'active' || user.status === 'pending'
  const canActivate = user.status === 'suspended'

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Admin Controls</span>
          </CardTitle>
          <CardDescription>
            Manage student account and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Student Status & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Account Status</Label>
              <div className="flex items-center space-x-2">
                {getStatusBadge(user.status || 'active')}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Role</Label>
              <div className="flex items-center space-x-2">
                {getRoleBadge(user.role || 'student')}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Actions</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('approve')}
                disabled={!canApprove || isPending}
                className="text-green-600 hover:text-green-700"
              >
                {isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <UserCheck className="h-4 w-4 mr-1" />}
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('suspend')}
                disabled={!canSuspend || isPending}
                className="text-red-600 hover:text-red-700"
              >
                {isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <UserX className="h-4 w-4 mr-1" />}
                Suspend
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('activate')}
                disabled={!canActivate || isPending}
                className="text-blue-600 hover:text-blue-700"
              >
                {isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                Activate
              </Button>
            </div>
          </div>

          {/* Student Info */}
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-gray-500">Email</Label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">User ID</Label>
              <p className="font-mono text-xs break-all">{user.id}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Created</Label>
              <p className="font-medium">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Last Active</Label>
              <p className="font-medium">
                {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Admin Notes</span>
          </CardTitle>
          <CardDescription>
            Internal notes and observations about this student
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Note */}
          <div className="space-y-2">
            <Label htmlFor="new-note">Add New Note</Label>
            <div className="flex gap-2">
              <Textarea
                id="new-note"
                placeholder="Enter your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              onClick={handleAddNote}
              disabled={addingNote || !newNote.trim()}
              size="sm"
              className="w-full"
            >
              {addingNote ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </>
              )}
            </Button>
          </div>

          <Separator />

          {/* Existing Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Recent Notes</Label>
            {loadingNotes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : notes.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No notes yet</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-4">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs text-gray-500">
                        {note.admin_name || 'Unknown Admin'}
                        {note.admin_email && <span className="ml-1">({note.admin_email})</span>}
                      </p>
                      <span className="text-xs text-gray-400">
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Student'}
              {actionType === 'suspend' && 'Suspend Student'}
              {actionType === 'activate' && 'Activate Student'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'This will approve the student account and allow access.'}
              {actionType === 'suspend' && 'This will suspend the student account and prevent login.'}
              {actionType === 'activate' && 'This will reactivate the student account and allow access.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction}
              disabled={isPending}
              variant={actionType === 'suspend' ? 'destructive' : 'default'}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
