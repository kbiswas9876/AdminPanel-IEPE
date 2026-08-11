'use client'

import React, { memo } from 'react'
import { UserRow } from './user-row'
import type { UserProfile } from '@/lib/supabase/admin'

interface VirtualUserTableProps {
  users: UserProfile[]
  selectedUsers: string[]
  onUserSelect: (userId: string, selected: boolean) => void
  onUserAction: (user: UserProfile, action: string) => void
  height?: number
  itemHeight?: number
}

const VirtualUserTable = memo(function VirtualUserTable({
  users,
  selectedUsers,
  onUserSelect,
  onUserAction
}: VirtualUserTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
      <div className="space-y-2 p-4">
        {users.map((user) => {
          const isSelected = selectedUsers.includes(user.id)
          return (
            <UserRow
              key={user.id}
              user={user}
              isSelected={isSelected}
              onSelect={onUserSelect}
              onApprove={(user) => onUserAction(user, 'approve')}
              onSuspend={(user) => onUserAction(user, 'suspend')}
              onPromote={(user) => onUserAction(user, 'promote')}
              onReject={(user) => onUserAction(user, 'reject')}
              showActions={true}
              showCheckbox={true}
            />
          )
        })}
      </div>
    </div>
  )
})

export { VirtualUserTable }