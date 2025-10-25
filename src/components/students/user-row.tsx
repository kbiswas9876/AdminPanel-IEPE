'use client'

import React, { memo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { 
  CheckCircle, 
  XCircle, 
  UserX, 
  Shield, 
  UserCheck,
  MoreHorizontal,
  Settings
} from 'lucide-react'
import type { UserProfile } from '@/lib/supabase/admin'
import { AdvancedUserActions } from './advanced-user-actions'
import { useState } from 'react'

interface UserRowProps {
  user: UserProfile
  isSelected?: boolean
  onSelect?: (userId: string, selected: boolean) => void
  onApprove?: (user: UserProfile) => void
  onSuspend?: (user: UserProfile) => void
  onPromote?: (user: UserProfile) => void
  onReject?: (user: UserProfile) => void
  showActions?: boolean
  showCheckbox?: boolean
}

const UserRow = memo(function UserRow({
  user,
  isSelected = false,
  onSelect,
  onApprove,
  onSuspend,
  onPromote,
  onReject,
  showActions = true,
  showCheckbox = true
}: UserRowProps) {
  const [showAdvancedActions, setShowAdvancedActions] = useState(false)
  const handleSelect = (checked: boolean) => {
    onSelect?.(user.id, checked)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'suspended':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Suspended</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Admin</Badge>
      case 'student':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Student</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      {showCheckbox && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleSelect}
          className="data-[state=checked]:bg-blue-600"
        />
      )}
      
      <Avatar className="h-10 w-10">
        <AvatarImage src="" alt={user.full_name || 'User'} />
        <AvatarFallback className="bg-blue-100 text-blue-800">
          {getInitials(user.full_name || 'U')}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {user.full_name || 'No name provided'}
          </h3>
          {getStatusBadge(user.status)}
          {getRoleBadge(user.role)}
        </div>
        <p className="text-sm text-gray-500 truncate">
          {user.email || 'No email provided'}
        </p>
        <p className="text-xs text-gray-400">
          Joined {format(new Date(user.created_at), 'MMM dd, yyyy')}
        </p>
      </div>
      
      {showActions && (
        <div className="flex items-center space-x-2">
          {user.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="bg-green-50 text-green-700 hover:bg-green-100"
                onClick={() => onApprove?.(user)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-red-50 text-red-700 hover:bg-red-100"
                onClick={() => onReject?.(user)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          
          {user.status === 'active' && user.role === 'student' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                onClick={() => onSuspend?.(user)}
              >
                <UserX className="h-4 w-4 mr-1" />
                Suspend
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                onClick={() => onPromote?.(user)}
              >
                <Shield className="h-4 w-4 mr-1" />
                Promote
              </Button>
            </>
          )}
          
          {user.status === 'suspended' && (
            <Button
              size="sm"
              variant="outline"
              className="bg-green-50 text-green-700 hover:bg-green-100"
              onClick={() => onApprove?.(user)}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Activate
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowAdvancedActions(true)}
            className="bg-purple-50 text-purple-700 hover:bg-purple-100"
          >
            <Settings className="h-4 w-4 mr-1" />
            Advanced
          </Button>
          <Button size="sm" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {showAdvancedActions && (
        <AdvancedUserActions
          user={user}
          onClose={() => setShowAdvancedActions(false)}
        />
      )}
    </div>
  )
})

export { UserRow }