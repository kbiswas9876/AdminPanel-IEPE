'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Shield, 
  Mail, 
  Download, 
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import type { UserProfile } from '@/lib/supabase/admin'

interface AdminControlsProps {
  user: UserProfile
  onAction: () => void
}

export function AdminControls({ user, onAction }: AdminControlsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: string) => {
    if (action === 'suspend' || action === 'activate' || action === 'promote' || action === 'demote') {
      setActionType(action)
      setIsDialogOpen(true)
    } else {
      await executeAction(action, '')
    }
  }

  const executeAction = async (action: string, reason: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`Student ${action}ed successfully`)
      onAction()
      setIsDialogOpen(false)
      setReason('')
    } catch (error) {
      toast.error(`Failed to ${action} student`)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAction = () => {
    if (actionType) {
      executeAction(actionType, reason)
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
      case 'moderator':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Moderator</Badge>
      case 'student':
        return <Badge variant="outline">Student</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <>
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
                className="text-green-600 hover:text-green-700"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('suspend')}
                className="text-red-600 hover:text-red-700"
              >
                <UserX className="h-4 w-4 mr-1" />
                Suspend
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('activate')}
                className="text-blue-600 hover:text-blue-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Activate
              </Button>
            </div>
          </div>

          {/* Advanced Actions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Advanced Actions</Label>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4 mr-1" />
                    More Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleAction('promote')}>
                    <Shield className="h-4 w-4 mr-2" />
                    Promote to Moderator
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('demote')}>
                    <UserX className="h-4 w-4 mr-2" />
                    Demote to Student
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleAction('email')}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('export')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('view-logs')}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Activity Logs
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Student Info */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-gray-500">Email</Label>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">User ID</Label>
                <p className="font-mono text-xs">{user.id}</p>
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
          </div>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'suspend' && 'Suspend Student'}
              {actionType === 'activate' && 'Activate Student'}
              {actionType === 'promote' && 'Promote Student'}
              {actionType === 'demote' && 'Demote Student'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'suspend' && 'This will suspend the student account and prevent login.'}
              {actionType === 'activate' && 'This will activate the student account and allow login.'}
              {actionType === 'promote' && 'This will promote the student to moderator role.'}
              {actionType === 'demote' && 'This will demote the student to regular student role.'}
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction}
              disabled={loading}
              variant={actionType === 'suspend' || actionType === 'demote' ? 'destructive' : 'default'}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}