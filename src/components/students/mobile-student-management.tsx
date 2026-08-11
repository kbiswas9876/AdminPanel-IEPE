'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Filter, 
  Users, 
  CheckSquare, 
  X, 
  Download,
  MoreHorizontal,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { MobileUserCard } from './mobile-user-card'
import { MobileFilterSheet, MobileBulkActionsSheet } from '@/components/ui/mobile-bottom-sheet'
import { UserProfile } from '@/lib/supabase/admin'
import { useStudentFilters } from '@/hooks/use-student-filters'
import { useBulkSelection } from '@/hooks/use-bulk-selection'
import { usePagination } from '@/hooks/use-pagination'

interface MobileStudentManagementProps {
  users: UserProfile[]
  onUserAction: (action: string, userId: string) => void
  onBulkAction: (action: string, userIds: string[]) => void
}

export function MobileStudentManagement({ 
  users, 
  onUserAction, 
  onBulkAction 
}: MobileStudentManagementProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortField, setSortField] = useState<'name' | 'email' | 'created_at'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const {
    filters,
    filteredUsers,
    updateFilter
  } = useStudentFilters(users)

  const {
    selectedUsers,
    handleSelectUser,
    handleSelectAll,
    isAllSelected,
    isPartiallySelected,
    clearSelection
  } = useBulkSelection(filteredUsers)

  const {
    paginatedData,
    pagination,
    setCurrentPage,
    setPageSize
  } = usePagination(filteredUsers, 10)

  // Sort users
  const sortedUsers = [...paginatedData].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortField) {
      case 'name':
        aValue = a.full_name || a.email || ''
        bValue = b.full_name || b.email || ''
        break
      case 'email':
        aValue = a.email || ''
        bValue = b.email || ''
        break
      case 'created_at':
        aValue = new Date(a.created_at || '').getTime()
        bValue = new Date(b.created_at || '').getTime()
        break
      default:
        return 0
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSort = (field: 'name' | 'email' | 'created_at') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getStatusCounts = () => {
    const counts = {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      pending: users.filter(u => u.status === 'pending').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      admins: users.filter(u => u.role === 'admin').length
    }
    return counts
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Student Management</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Counts */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          <Badge variant="outline" className="whitespace-nowrap">
            Total: {statusCounts.total}
          </Badge>
          <Badge variant="outline" className="whitespace-nowrap">
            Active: {statusCounts.active}
          </Badge>
          <Badge variant="outline" className="whitespace-nowrap">
            Pending: {statusCounts.pending}
          </Badge>
          <Badge variant="outline" className="whitespace-nowrap">
            Admins: {statusCounts.admins}
          </Badge>
        </div>
      </div>

      {/* Selection Bar */}
      {selectedUsers.length > 0 && (
        <div className="sticky top-16 z-10 bg-blue-50 border-b border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {selectedUsers.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsBulkActionsOpen(true)}
              >
                Actions
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
          <Button
            size="sm"
            variant={sortField === 'name' ? 'default' : 'outline'}
            onClick={() => handleSort('name')}
            className="whitespace-nowrap"
          >
            Name {sortField === 'name' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />)}
          </Button>
          <Button
            size="sm"
            variant={sortField === 'email' ? 'default' : 'outline'}
            onClick={() => handleSort('email')}
            className="whitespace-nowrap"
          >
            Email {sortField === 'email' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />)}
          </Button>
          <Button
            size="sm"
            variant={sortField === 'created_at' ? 'default' : 'outline'}
            onClick={() => handleSort('created_at')}
            className="whitespace-nowrap"
          >
            Date {sortField === 'created_at' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />)}
          </Button>
        </div>
      </div>

      {/* User Cards */}
      <div className="p-4 space-y-3">
        {sortedUsers.map((user) => (
          <MobileUserCard
            key={user.id}
            user={user}
            isSelected={selectedUsers.includes(user.id)}
            onSelect={handleSelectUser}
            onAction={onUserAction}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Filter Bottom Sheet */}
      <MobileFilterSheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'active', 'pending', 'suspended'].map((status) => (
                <Button
                  key={status}
                  variant={filters.status.includes(status) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newStatus = filters.status.includes(status)
                      ? filters.status.filter(s => s !== status)
                      : [...filters.status, status]
                    updateFilter('status', newStatus)
                  }}
                  className="justify-start"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'admin', 'student'].map((role) => (
                <Button
                  key={role}
                  variant={filters.role.includes(role) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const newRole = filters.role.includes(role)
                      ? filters.role.filter(r => r !== role)
                      : [...filters.role, role]
                    updateFilter('role', newRole)
                  }}
                  className="justify-start"
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </MobileFilterSheet>

      {/* Bulk Actions Bottom Sheet */}
      <MobileBulkActionsSheet isOpen={isBulkActionsOpen} onClose={() => setIsBulkActionsOpen(false)}>
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => {
                onBulkAction('approve', selectedUsers)
                setIsBulkActionsOpen(false)
              }}
            >
              Approve
            </Button>
            <Button
              variant="outline"
              className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
              onClick={() => {
                onBulkAction('suspend', selectedUsers)
                setIsBulkActionsOpen(false)
              }}
            >
              Suspend
            </Button>
            <Button
              variant="outline"
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
              onClick={() => {
                onBulkAction('promote', selectedUsers)
                setIsBulkActionsOpen(false)
              }}
            >
              Promote
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                onBulkAction('delete', selectedUsers)
                setIsBulkActionsOpen(false)
              }}
            >
              Delete
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onBulkAction('export', selectedUsers)
              setIsBulkActionsOpen(false)
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Selected
          </Button>
        </div>
      </MobileBulkActionsSheet>
    </div>
  )
}
