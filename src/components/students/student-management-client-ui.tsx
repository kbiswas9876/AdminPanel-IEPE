'use client'

import { useMemo, useState, useEffect } from 'react'
import { SmoothTabs, SmoothTabsContent, SmoothTabsList, SmoothTabsTrigger } from '@/components/ui/smooth-tabs'
import { SearchFilterToolbar } from './search-filter-toolbar'
import { BulkActionsToolbar } from './bulk-actions-toolbar'
import { useBulkSelection } from '@/hooks/use-bulk-selection'
import { TablePagination } from './table-pagination'
import { PendingApprovalTable } from './pending-approval-table'
import { ActiveStudentsTable } from './active-students-table'
import { AllStudentsTable } from './all-students-table'
import { AdminsTable } from './admins-table'
import { UserTableSkeleton } from './user-table-skeleton'
import { VirtualUserTable } from './virtual-user-table'
import { AnalyticsOverview } from './analytics-overview'
import { ActivityTimeline } from './activity-timeline'
import { ReportBuilder } from './report-builder'
import { GroupsManagement } from './groups-management'
import { TagsManagement } from './tags-management'
import { PermissionsManagement } from './permissions-management'
import { AuditLogManagement } from './audit-log-management'
import { usePagination } from '@/hooks/use-pagination'
import { useRealtimeUsers, useRealtimeNotifications } from '@/hooks/use-realtime-users'
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, Activity, BarChart3, Clock, FileText, Users, Tag, Shield, FileText as AuditIcon } from 'lucide-react'
import type { UserProfile } from '@/lib/supabase/admin'

interface StudentManagementClientUIProps {
  users: UserProfile[]
}

export function StudentManagementClientUI({ users }: StudentManagementClientUIProps) {
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>(users)
  const [isLoading, setIsLoading] = useState(false)
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(false)
  const { selectedUsers, setSelectedUsers, handleSelectUser, clearSelection } = useBulkSelection(filteredUsers)
  
  // Wrapper function to match the expected signature
  const handleUserSelect = (userId: string, selected: boolean) => {
    handleSelectUser(userId, selected)
  }
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  const { unreadCount, addNotification, markAsRead } = useRealtimeNotifications()
  const [showGroupsManagement, setShowGroupsManagement] = useState(false)
  const [showTagsManagement, setShowTagsManagement] = useState(false)
  
  // Performance monitoring
  const { 
    metrics, 
    isMonitoring, 
    startMonitoring, 
    stopMonitoring, 
    measureBulkOperation 
  } = usePerformanceMonitor()

  // Client-side filtering logic based on filtered results
  const pendingUsers = useMemo(() => 
    filteredUsers.filter(u => u.status === 'pending'), [filteredUsers]
  )
  
  const activeStudents = useMemo(() => 
    filteredUsers.filter(u => u.status === 'active' && u.role === 'student'), [filteredUsers]
  )
  
  const admins = useMemo(() => 
    filteredUsers.filter(u => u.role === 'admin'), [filteredUsers]
  )

  // Pagination for each tab
  const pendingPagination = usePagination(pendingUsers, 25)
  const activePagination = usePagination(activeStudents, 25)
  const adminsPagination = usePagination(admins, 25)
  const allPagination = usePagination(filteredUsers, 25)

  const refreshData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.reload()
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkAction = async () => {
    await measureBulkOperation(async () => {
      clearSelection()
      await refreshData()
    })
  }

  // Start performance monitoring on mount
  useEffect(() => {
    startMonitoring()
    return () => stopMonitoring()
  }, [startMonitoring, stopMonitoring])

  // Real-time updates (optional feature - disabled until Supabase Realtime is available)
  const realtimeEnabled = false // Disabled until Supabase Realtime is available in your project
  
  const { connectionStatus: realtimeStatus } = useRealtimeUsers(
    (update) => {
      if (realtimeEnabled) {
        console.log('Real-time user update:', update)
        addNotification(update)
        
        // Update the filtered users list with animation
        setFilteredUsers(prevUsers => {
          switch (update.type) {
            case 'INSERT':
              return [...prevUsers, update.user]
            case 'UPDATE':
              return prevUsers.map(user => 
                user.id === update.user.id ? update.user : user
              )
            case 'DELETE':
              return prevUsers.filter(user => user.id !== update.user.id)
            default:
              return prevUsers
          }
        })
      }
    },
    () => {
      // Connection status is handled by the hook
    }
  )

  // Update connection status
  useEffect(() => {
    if (realtimeEnabled) {
      setConnectionStatus(realtimeStatus)
    } else {
      setConnectionStatus('disconnected')
    }
  }, [realtimeStatus, realtimeEnabled])

  // Show connection status with more context
  const getConnectionStatusDisplay = () => {
    if (!realtimeEnabled) {
      return { text: 'Offline Mode (Realtime Coming Soon)', variant: 'outline' as const, icon: 'WifiOff' }
    }
    
    switch (connectionStatus) {
      case 'connected':
        return { text: 'Live Updates', variant: 'default' as const, icon: 'Wifi' }
      case 'connecting':
        return { text: 'Connecting...', variant: 'secondary' as const, icon: 'Loading' }
      case 'error':
        return { text: 'Connection Error', variant: 'destructive' as const, icon: 'WifiOff' }
      case 'disconnected':
        return { text: 'Reconnecting...', variant: 'outline' as const, icon: 'WifiOff' }
      default:
        return { text: 'Offline Mode', variant: 'outline' as const, icon: 'WifiOff' }
    }
  }

  // Auto-enable virtual scrolling for large datasets
  useEffect(() => {
    setUseVirtualScrolling(filteredUsers.length > 100)
  }, [filteredUsers.length])

  return (
    <div className="w-full space-y-6">
          {/* Connection Status & Performance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                const status = getConnectionStatusDisplay()
                const IconComponent = status.icon === 'Wifi' ? Wifi : 
                                   status.icon === 'Loading' ? 
                                   () => <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div> :
                                   WifiOff
                
                return (
                  <Badge variant={status.variant} className="flex items-center gap-1">
                    <IconComponent className="h-3 w-3" />
                    {status.text}
                  </Badge>
                )
              })()}
          {unreadCount > 0 && (
            <Badge variant="secondary" className="animate-pulse">
              {unreadCount} new updates
            </Badge>
          )}
          {isMonitoring && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {metrics.memoryUsage.toFixed(1)}MB
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark as read
            </button>
          )}
          {useVirtualScrolling && (
            <Badge variant="outline" className="text-xs">
              Virtual Scrolling
            </Badge>
          )}
        </div>
      </div>

      {/* Search and Filter Toolbar */}
      <SearchFilterToolbar 
        users={users} 
        onFiltersChange={setFilteredUsers} 
      />
      
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        users={filteredUsers}
        selectedUsers={selectedUsers}
        onSelectionChange={setSelectedUsers}
        onBulkAction={handleBulkAction}
      />
      
          <SmoothTabs defaultValue="pending" className="w-full">
            <div className="border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
              <SmoothTabsList className="grid w-full grid-cols-2 sm:grid-cols-9 bg-transparent h-auto p-0">
          <SmoothTabsTrigger 
            value="pending" 
            className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-red-500 relative"
          >
            <span className="hidden sm:inline">Pending Approval</span>
            <span className="sm:hidden">Pending</span>
            {pendingUsers.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1 sm:px-2 py-1 font-bold animate-pulse">
                {pendingUsers.length}
              </span>
            )}
          </SmoothTabsTrigger>
          <SmoothTabsTrigger 
            value="active"
            className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-green-500"
          >
            <span className="hidden sm:inline">Active Students</span>
            <span className="sm:hidden">Active</span>
            {activeStudents.length > 0 && (
              <span className="bg-green-500 text-white text-xs rounded-full px-1 sm:px-2 py-1 font-bold">
                {activeStudents.length}
              </span>
            )}
          </SmoothTabsTrigger>
          <SmoothTabsTrigger 
            value="admins"
            className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
          >
            <span className="hidden sm:inline">Administrators</span>
            <span className="sm:hidden">Admins</span>
            {admins.length > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-1 sm:px-2 py-1 font-bold">
                {admins.length}
              </span>
            )}
          </SmoothTabsTrigger>
              <SmoothTabsTrigger 
                value="all"
                className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-gray-500"
              >
                <span className="hidden sm:inline">All Users</span>
                <span className="sm:hidden">All</span>
                {users.length > 0 && (
                  <span className="bg-gray-500 text-white text-xs rounded-full px-1 sm:px-2 py-1 font-bold">
                    {users.length}
                  </span>
                )}
              </SmoothTabsTrigger>
              <SmoothTabsTrigger 
                value="analytics"
                className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </SmoothTabsTrigger>
              <SmoothTabsTrigger 
                value="groups"
                className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Groups</span>
                <span className="sm:hidden">Groups</span>
              </SmoothTabsTrigger>
              <SmoothTabsTrigger 
                value="tags"
                className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-green-500"
              >
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Tags</span>
                <span className="sm:hidden">Tags</span>
              </SmoothTabsTrigger>
              <SmoothTabsTrigger 
                value="permissions"
                className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Permissions</span>
                <span className="sm:hidden">Perms</span>
              </SmoothTabsTrigger>
              <SmoothTabsTrigger 
                value="audit"
                className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-gray-500"
              >
                <AuditIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Audit Logs</span>
                <span className="sm:hidden">Audit</span>
              </SmoothTabsTrigger>
        </SmoothTabsList>
      </div>
      
            <SmoothTabsContent value="pending" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
              <div className="border-b border-gray-100/50 pb-4 sm:pb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  Pending Approval
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  Review and approve new student registrations.
                </p>
              </div>
              {isLoading ? (
                <UserTableSkeleton rows={5} showCheckbox={true} />
              ) : useVirtualScrolling && pendingUsers.length > 50 ? (
                <VirtualUserTable
                  users={pendingUsers}
                  selectedUsers={selectedUsers}
                  onUserSelect={handleUserSelect}
                  onUserAction={refreshData}
                  height={400}
                  itemHeight={80}
                />
              ) : (
                <>
                  <PendingApprovalTable 
                    users={pendingPagination.paginatedData} 
                    onUserAction={refreshData}
                    selectedUsers={selectedUsers}
                    onUserSelect={handleUserSelect}
                  />
                  <TablePagination
                    currentPage={pendingPagination.pagination.currentPage}
                    totalPages={pendingPagination.pagination.totalPages}
                    pageSize={pendingPagination.pagination.pageSize}
                    totalItems={pendingPagination.pagination.totalItems}
                    onPageChange={pendingPagination.setCurrentPage}
                    onPageSizeChange={pendingPagination.setPageSize}
                  />
                </>
              )}
            </SmoothTabsContent>
      
            <SmoothTabsContent value="active" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
              <div className="border-b border-gray-100/50 pb-4 sm:pb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  Active Students
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  Currently active students with platform access.
                </p>
              </div>
              {isLoading ? (
                <UserTableSkeleton rows={5} showCheckbox={true} />
              ) : useVirtualScrolling && activeStudents.length > 50 ? (
                <VirtualUserTable
                  users={activeStudents}
                  selectedUsers={selectedUsers}
                  onUserSelect={handleUserSelect}
                  onUserAction={refreshData}
                  height={400}
                  itemHeight={80}
                />
              ) : (
                <>
                  <ActiveStudentsTable 
                    users={activePagination.paginatedData} 
                    onUserAction={refreshData}
                    selectedUsers={selectedUsers}
                    onUserSelect={handleUserSelect}
                  />
                  <TablePagination
                    currentPage={activePagination.pagination.currentPage}
                    totalPages={activePagination.pagination.totalPages}
                    pageSize={activePagination.pagination.pageSize}
                    totalItems={activePagination.pagination.totalItems}
                    onPageChange={activePagination.setCurrentPage}
                    onPageSizeChange={activePagination.setPageSize}
                  />
                </>
              )}
            </SmoothTabsContent>
      
            <SmoothTabsContent value="admins" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
              <div className="border-b border-gray-100/50 pb-4 sm:pb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  Administrators
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  Users with administrative privileges.
                </p>
              </div>
              {isLoading ? (
                <UserTableSkeleton rows={5} showCheckbox={true} />
              ) : useVirtualScrolling && admins.length > 50 ? (
                <VirtualUserTable
                  users={admins}
                  selectedUsers={selectedUsers}
                  onUserSelect={handleUserSelect}
                  onUserAction={refreshData}
                  height={400}
                  itemHeight={80}
                />
              ) : (
                <>
                  <AdminsTable 
                    users={adminsPagination.paginatedData} 
                    onUserAction={refreshData}
                    selectedUsers={selectedUsers}
                    onUserSelect={handleUserSelect}
                  />
                  <TablePagination
                    currentPage={adminsPagination.pagination.currentPage}
                    totalPages={adminsPagination.pagination.totalPages}
                    pageSize={adminsPagination.pagination.pageSize}
                    totalItems={adminsPagination.pagination.totalItems}
                    onPageChange={adminsPagination.setCurrentPage}
                    onPageSizeChange={adminsPagination.setPageSize}
                  />
                </>
              )}
            </SmoothTabsContent>
      
            <SmoothTabsContent value="all" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
              <div className="border-b border-gray-100/50 pb-4 sm:pb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  All Users
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  Complete list of all registered users.
                </p>
              </div>
              {isLoading ? (
                <UserTableSkeleton rows={5} showCheckbox={true} />
              ) : useVirtualScrolling && filteredUsers.length > 50 ? (
                <VirtualUserTable
                  users={filteredUsers}
                  selectedUsers={selectedUsers}
                  onUserSelect={handleUserSelect}
                  onUserAction={refreshData}
                  height={400}
                  itemHeight={80}
                />
              ) : (
                <>
                  <AllStudentsTable 
                    users={allPagination.paginatedData}
                    selectedUsers={selectedUsers}
                    onUserSelect={handleUserSelect}
                  />
                  <TablePagination
                    currentPage={allPagination.pagination.currentPage}
                    totalPages={allPagination.pagination.totalPages}
                    pageSize={allPagination.pagination.pageSize}
                    totalItems={allPagination.pagination.totalItems}
                    onPageChange={allPagination.setCurrentPage}
                    onPageSizeChange={allPagination.setPageSize}
                  />
                </>
              )}
            </SmoothTabsContent>
            
            <SmoothTabsContent value="analytics" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
              <div className="border-b border-gray-100/50 pb-4 sm:pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                      Analytics Dashboard
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                      Comprehensive insights into user activity and platform performance.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ReportBuilder />
                  </div>
                </div>
              </div>
              
              <AnalyticsOverview />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActivityTimeline showFilters={true} />
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Export User Data</div>
                          <div className="text-sm text-gray-500">Download comprehensive user reports</div>
                        </div>
                      </div>
                    </button>
                    <button className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">Performance Metrics</div>
                          <div className="text-sm text-gray-500">View detailed performance analytics</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </SmoothTabsContent>

            <SmoothTabsContent value="groups" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
              <GroupsManagement 
                selectedUsers={selectedUsers}
                onClose={() => setShowGroupsManagement(false)}
              />
            </SmoothTabsContent>

            <SmoothTabsContent value="tags" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
              <TagsManagement 
                selectedUsers={selectedUsers}
                onClose={() => setShowTagsManagement(false)}
              />
            </SmoothTabsContent>

            <SmoothTabsContent value="permissions" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
              <PermissionsManagement 
                selectedUsers={selectedUsers}
                onClose={() => setShowGroupsManagement(false)}
              />
            </SmoothTabsContent>

            <SmoothTabsContent value="audit" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
              <AuditLogManagement 
                selectedUsers={selectedUsers}
                onClose={() => setShowGroupsManagement(false)}
              />
            </SmoothTabsContent>
          </SmoothTabs>
        </div>
      )
    }
