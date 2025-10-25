'use client'

import { useState } from 'react'
import { CheckSquare, Square, Users, Trash2, UserCheck, UserX, Shield, UserPlus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BulkApproveDialog } from './bulk-approve-dialog'
import { BulkSuspendDialog } from './bulk-suspend-dialog'
import { BulkPromoteDialog } from './bulk-promote-dialog'
import { BulkDeleteDialog } from './bulk-delete-dialog'
import { ExportDialog } from './export-dialog'
import type { UserProfile } from '@/lib/supabase/admin'

interface BulkActionsToolbarProps {
  users: UserProfile[]
  selectedUsers: string[]
  onSelectionChange: (selectedUsers: string[]) => void
  onBulkAction: () => void
}

export function BulkActionsToolbar({ 
  users, 
  selectedUsers, 
  onSelectionChange, 
  onBulkAction 
}: BulkActionsToolbarProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showPromoteDialog, setShowPromoteDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  const isAllSelected = selectedUsers.length === users.length && users.length > 0
  const isIndeterminate = selectedUsers.length > 0 && selectedUsers.length < users.length

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(users.map(user => user.id))
    }
  }

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onSelectionChange(selectedUsers.filter(id => id !== userId))
    } else {
      onSelectionChange([...selectedUsers, userId])
    }
  }

  const handleShiftClick = (userId: string, index: number) => {
    const lastSelectedIndex = users.findIndex(user => user.id === selectedUsers[selectedUsers.length - 1])
    if (lastSelectedIndex !== -1) {
      const start = Math.min(lastSelectedIndex, index)
      const end = Math.max(lastSelectedIndex, index)
      const rangeUsers = users.slice(start, end + 1).map(user => user.id)
      const newSelection = [...new Set([...selectedUsers, ...rangeUsers])]
      onSelectionChange(newSelection)
    } else {
      handleSelectUser(userId)
    }
  }

  const getSelectedUsers = () => {
    return users.filter(user => selectedUsers.includes(user.id))
  }

  const canApprove = getSelectedUsers().some(user => user.status === 'pending')
  const canSuspend = getSelectedUsers().some(user => user.status === 'active')
  const canPromote = getSelectedUsers().some(user => user.role === 'student')
  const canDemote = getSelectedUsers().some(user => user.role === 'admin')

  if (users.length === 0) {
    return null
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex items-center space-x-4">
          {/* Master Checkbox */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="p-1 h-8 w-8"
            >
              {isAllSelected ? (
                <CheckSquare className="h-4 w-4 text-blue-600" />
              ) : isIndeterminate ? (
                <div className="h-4 w-4 border-2 border-blue-600 bg-blue-100 rounded" />
              ) : (
                <Square className="h-4 w-4 text-gray-400" />
              )}
            </Button>
            <span className="text-sm font-medium">
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </span>
          </div>

          {/* Selection Count */}
          {selectedUsers.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {selectedUsers.length} selected
            </Badge>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center space-x-2">
            {/* Approve Selected */}
            {canApprove && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApproveDialog(true)}
                className="text-green-700 border-green-300 hover:bg-green-50"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}

            {/* Suspend Selected */}
            {canSuspend && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSuspendDialog(true)}
                className="text-orange-700 border-orange-300 hover:bg-orange-50"
              >
                <UserX className="h-4 w-4 mr-2" />
                Suspend
              </Button>
            )}

            {/* Promote/Demote Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Role
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {canPromote && (
                  <DropdownMenuItem onClick={() => setShowPromoteDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Promote to Admin
                  </DropdownMenuItem>
                )}
                {canDemote && (
                  <DropdownMenuItem onClick={() => setShowPromoteDialog(true)}>
                    <UserX className="h-4 w-4 mr-2" />
                    Demote to Student
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Selected */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportDialog(true)}
              className="text-blue-700 border-blue-300 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            {/* Delete Selected */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-700 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Action Dialogs */}
      <BulkApproveDialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        selectedUsers={getSelectedUsers()}
        onSuccess={onBulkAction}
      />

      <BulkSuspendDialog
        isOpen={showSuspendDialog}
        onClose={() => setShowSuspendDialog(false)}
        selectedUsers={getSelectedUsers()}
        onSuccess={onBulkAction}
      />

      <BulkPromoteDialog
        isOpen={showPromoteDialog}
        onClose={() => setShowPromoteDialog(false)}
        selectedUsers={getSelectedUsers()}
        onSuccess={onBulkAction}
      />

      <BulkDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        selectedUsers={getSelectedUsers()}
        onSuccess={onBulkAction}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        users={getSelectedUsers()}
        allUsers={users}
      />
    </>
  )
}

// Export the selection handlers for use in table components
export function useBulkSelection(users: UserProfile[]) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const handleSelectUser = (userId: string, index: number, event: React.MouseEvent) => {
    if (event.shiftKey && selectedUsers.length > 0) {
      // Shift-click range selection
      const lastSelectedIndex = users.findIndex(user => user.id === selectedUsers[selectedUsers.length - 1])
      if (lastSelectedIndex !== -1) {
        const start = Math.min(lastSelectedIndex, index)
        const end = Math.max(lastSelectedIndex, index)
        const rangeUsers = users.slice(start, end + 1).map(user => user.id)
        const newSelection = [...new Set([...selectedUsers, ...rangeUsers])]
        setSelectedUsers(newSelection)
      } else {
        setSelectedUsers([...selectedUsers, userId])
      }
    } else {
      // Regular click
      if (selectedUsers.includes(userId)) {
        setSelectedUsers(selectedUsers.filter(id => id !== userId))
      } else {
        setSelectedUsers([...selectedUsers, userId])
      }
    }
  }

  const clearSelection = () => {
    setSelectedUsers([])
  }

  return {
    selectedUsers,
    setSelectedUsers,
    handleSelectUser,
    clearSelection
  }
}
