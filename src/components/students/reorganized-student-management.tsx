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
import { AnalyticsOverview } from './analytics-overview'
import { ActivityTimeline } from './activity-timeline'
import { ReportBuilder } from './report-builder'
import { GroupsManagement } from './groups-management'
import { TagsManagement } from './tags-management'
import { PermissionsManagement } from './permissions-management'
import { AuditLogManagement } from './audit-log-management'
import { usePagination } from '@/hooks/use-pagination'
import { useRealtimeNotifications } from '@/hooks/use-realtime-users'
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Wifi, WifiOff, Activity, BarChart3, Clock, FileText, Users, Tag, Shield, 
  FileText as AuditIcon, Settings, ChevronRight
} from 'lucide-react'
import type { UserProfile } from '@/lib/supabase/admin'

interface ReorganizedStudentManagementProps {
  users: UserProfile[]
}

export function ReorganizedStudentManagement({ users }: ReorganizedStudentManagementProps) {
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>(users)
  const [isLoading, setIsLoading] = useState(false)
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(false)
  const [activeMainTab, setActiveMainTab] = useState<'users' | 'analytics' | 'management' | 'settings'>('users')
  const [activeSubTab, setActiveSubTab] = useState<string>('pending')
  const { selectedUsers, setSelectedUsers, handleSelectUser, clearSelection } = useBulkSelection(filteredUsers)
  
  // Wrapper function to match the expected signature
  const handleUserSelect = (userId: string, selected: boolean) => {
    handleSelectUser(userId, selected)
  }
  const [connectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  const { unreadCount, markAsRead } = useRealtimeNotifications()
  
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
    filteredUsers.filter(u => u.status === 'pending' || u.status === 'correction_required'), [filteredUsers]
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

  // Auto-enable virtual scrolling for large datasets
  useEffect(() => {
    setUseVirtualScrolling(filteredUsers.length > 100)
  }, [filteredUsers.length])

  // Show connection status with more context
  const getConnectionStatusDisplay = () => {
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

  const mainTabs = [
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      description: 'Manage user accounts and permissions',
      color: 'blue',
      count: users.length
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'View insights and reports',
      color: 'green',
      count: null
    },
    {
      id: 'management',
      label: 'Management',
      icon: Settings,
      description: 'Organize users and content',
      color: 'purple',
      count: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Shield,
      description: 'Configure permissions and audit',
      color: 'gray',
      count: null
    }
  ]

  const userSubTabs = [
    { id: 'pending', label: 'Pending Approval', count: pendingUsers.length, color: 'red' },
    { id: 'active', label: 'Active Students', count: activeStudents.length, color: 'green' },
    { id: 'admins', label: 'Administrators', count: admins.length, color: 'blue' },
    { id: 'all', label: 'All Users', count: users.length, color: 'gray' }
  ]

  const managementSubTabs = [
    { id: 'groups', label: 'Groups', icon: Users, description: 'Organize users into groups' },
    { id: 'tags', label: 'Tags', icon: Tag, description: 'Categorize users with tags' }
  ]

  const settingsSubTabs = [
    { id: 'permissions', label: 'Permissions', icon: Shield, description: 'Manage role-based access' },
    { id: 'audit', label: 'Audit Logs', icon: AuditIcon, description: 'Track system activities' }
  ]

  const renderUserTabs = () => (
    <div className="space-y-4">
      {/* User Management Sub-tabs */}
      <div className="border-b border-gray-200">
        <SmoothTabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
          <SmoothTabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-transparent h-auto p-0">
            {userSubTabs.map((tab) => (
              <SmoothTabsTrigger 
                key={tab.id}
                value={tab.id}
                className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {tab.count > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {tab.count}
                  </Badge>
                )}
              </SmoothTabsTrigger>
            ))}
          </SmoothTabsList>

          {/* User Tab Contents */}
          <SmoothTabsContent value="pending" className="space-y-4 m-0 p-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Pending Approval</h2>
              <p className="text-sm text-gray-600 mt-1">Review and approve new student registrations.</p>
            </div>
            {isLoading ? (
              <UserTableSkeleton rows={5} showCheckbox={true} />
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

          <SmoothTabsContent value="active" className="space-y-4 m-0 p-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Active Students</h2>
              <p className="text-sm text-gray-600 mt-1">Currently active students with platform access.</p>
            </div>
            {isLoading ? (
              <UserTableSkeleton rows={5} showCheckbox={true} />
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

          <SmoothTabsContent value="admins" className="space-y-4 m-0 p-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Administrators</h2>
              <p className="text-sm text-gray-600 mt-1">Users with administrative privileges.</p>
            </div>
            {isLoading ? (
              <UserTableSkeleton rows={5} showCheckbox={true} />
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

          <SmoothTabsContent value="all" className="space-y-4 m-0 p-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">All Users</h2>
              <p className="text-sm text-gray-600 mt-1">Complete list of all registered users.</p>
            </div>
            {isLoading ? (
              <UserTableSkeleton rows={5} showCheckbox={true} />
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
        </SmoothTabs>
      </div>
    </div>
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-6 p-6">
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">Comprehensive insights into user activity and platform performance.</p>
          </div>
          <ReportBuilder />
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
    </div>
  )

  const renderManagementTab = () => (
    <div className="space-y-6 p-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-900">User Organization</h2>
        <p className="text-sm text-gray-600 mt-1">Organize users into groups and apply tags for better management.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {managementSubTabs.map((tab) => (
          <Card key={tab.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveSubTab(tab.id)}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <tab.icon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{tab.label}</CardTitle>
                  <p className="text-sm text-gray-600">{tab.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Manage {tab.label}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Management Sub-tabs */}
      <SmoothTabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <SmoothTabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
          {managementSubTabs.map((tab) => (
            <SmoothTabsTrigger 
              key={tab.id}
              value={tab.id}
              className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-purple-500"
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </SmoothTabsTrigger>
          ))}
        </SmoothTabsList>

        <SmoothTabsContent value="groups" className="space-y-4 m-0 p-6">
          <GroupsManagement 
            selectedUsers={selectedUsers}
            onClose={() => setActiveSubTab('groups')}
          />
        </SmoothTabsContent>

        <SmoothTabsContent value="tags" className="space-y-4 m-0 p-6">
          <TagsManagement 
            selectedUsers={selectedUsers}
            onClose={() => setActiveSubTab('tags')}
          />
        </SmoothTabsContent>
      </SmoothTabs>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-6 p-6">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-900">System Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Configure permissions, roles, and audit logging.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSubTabs.map((tab) => (
          <Card key={tab.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveSubTab(tab.id)}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <tab.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{tab.label}</CardTitle>
                  <p className="text-sm text-gray-600">{tab.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Configure {tab.label}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings Sub-tabs */}
      <SmoothTabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <SmoothTabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
          {settingsSubTabs.map((tab) => (
            <SmoothTabsTrigger 
              key={tab.id}
              value={tab.id}
              className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-gray-500"
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </SmoothTabsTrigger>
          ))}
        </SmoothTabsList>

        <SmoothTabsContent value="permissions" className="space-y-4 m-0 p-6">
          <PermissionsManagement 
            selectedUsers={selectedUsers}
            onClose={() => setActiveSubTab('permissions')}
          />
        </SmoothTabsContent>

        <SmoothTabsContent value="audit" className="space-y-4 m-0 p-6">
          <AuditLogManagement 
            selectedUsers={selectedUsers}
            onClose={() => setActiveSubTab('audit')}
          />
        </SmoothTabsContent>
      </SmoothTabs>
    </div>
  )

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
      
      {/* Main Navigation Tabs */}
      <SmoothTabs value={activeMainTab} onValueChange={(value) => setActiveMainTab(value as 'users' | 'analytics' | 'management' | 'settings')} className="w-full">
        <div className="border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
          <SmoothTabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-transparent h-auto p-0">
            {mainTabs.map((tab) => (
              <SmoothTabsTrigger 
                key={tab.id}
                value={tab.id}
                className="flex items-center justify-center space-x-2 px-4 py-4 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {tab.count && (
                  <Badge variant="secondary" className="ml-1">
                    {tab.count}
                  </Badge>
                )}
              </SmoothTabsTrigger>
            ))}
          </SmoothTabsList>
        </div>

        {/* Main Tab Contents */}
        <SmoothTabsContent value="users" className="m-0">
          {renderUserTabs()}
        </SmoothTabsContent>

        <SmoothTabsContent value="analytics" className="m-0">
          {renderAnalyticsTab()}
        </SmoothTabsContent>

        <SmoothTabsContent value="management" className="m-0">
          {renderManagementTab()}
        </SmoothTabsContent>

        <SmoothTabsContent value="settings" className="m-0">
          {renderSettingsTab()}
        </SmoothTabsContent>
      </SmoothTabs>
    </div>
  )
}
