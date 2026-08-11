'use client'

import { useState, useCallback, useMemo } from 'react'
import type { UserProfile } from '@/lib/supabase/admin'

export function useBulkSelection(users: UserProfile[]) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const handleSelectUser = useCallback((userId: string, selected: boolean): void => {
    setSelectedUsers(prev => {
      if (selected) {
        return [...prev, userId]
      } else {
        return prev.filter(id => id !== userId)
      }
    })
  }, [])

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedUsers(users.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }, [users])

  const clearSelection = useCallback(() => {
    setSelectedUsers([])
  }, [])

  const isAllSelected = useMemo(() => {
    return users.length > 0 && selectedUsers.length === users.length
  }, [users.length, selectedUsers.length])

  const isPartiallySelected = useMemo(() => {
    return selectedUsers.length > 0 && selectedUsers.length < users.length
  }, [selectedUsers.length, users.length])

  const selectedCount = selectedUsers.length

  return {
    selectedUsers,
    setSelectedUsers,
    handleSelectUser,
    handleSelectAll,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
    selectedCount
  }
}
