'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MoreHorizontal, 
  Mail, 
  Calendar, 
  Shield, 
  UserCheck, 
  UserX, 
  Crown,
  Settings,
  ExternalLink
} from 'lucide-react'
import { UserProfile } from '@/lib/supabase/admin'
import { format } from 'date-fns'
import { UserGroupsTagsDisplay } from './user-groups-tags-display'
import { AdvancedUserActions } from './advanced-user-actions'
import { useState } from 'react'

interface MobileUserCardProps {
  user: UserProfile
  isSelected: boolean
  onSelect: (userId: string, selected: boolean) => void
  onAction: (action: string, userId: string) => void
}

export function MobileUserCard({ user, isSelected, onSelect, onAction }: MobileUserCardProps) {
  const [showAdvancedActions, setShowAdvancedActions] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'rejected':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'student':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <Card className="w-full hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Selection Checkbox */}
            <div className="pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(user.id, checked as boolean)}
                className="h-4 w-4"
              />
            </div>

            {/* User Avatar */}
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {getInitials(user.full_name || user.email || 'U')}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {user.full_name || 'No name provided'}
                  </h3>
                  <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    {user.email}
                  </p>
                </div>

                {/* Status and Role Badges */}
                <div className="flex flex-col gap-1 ml-2">
                  <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                    {user.status}
                  </Badge>
                  <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                    {user.role}
                  </Badge>
                </div>
              </div>

              {/* Registration Date */}
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>
                  {user.created_at 
                    ? format(new Date(user.created_at), 'MMM dd, yyyy')
                    : 'Invalid Date'
                  }
                </span>
              </div>

              {/* Groups and Tags */}
              <div className="mt-2">
                <UserGroupsTagsDisplay userId={user.id} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex gap-2">
              {user.status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => onAction('approve', user.id)}
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Approve
                </Button>
              )}
              
              {user.status === 'active' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                  onClick={() => onAction('suspend', user.id)}
                >
                  <UserX className="h-3 w-3 mr-1" />
                  Suspend
                </Button>
              )}

              {user.role === 'student' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  onClick={() => onAction('promote', user.id)}
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Promote
                </Button>
              )}
            </div>

            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setShowAdvancedActions(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => onAction('view', user.id)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Actions Modal */}
      {showAdvancedActions && (
        <AdvancedUserActions
          user={user}
          onClose={() => setShowAdvancedActions(false)}
        />
      )}
    </>
  )
}
