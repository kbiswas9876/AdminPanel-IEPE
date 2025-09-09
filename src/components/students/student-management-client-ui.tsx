'use client'

import { useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PendingApprovalTable } from './pending-approval-table'
import { ActiveStudentsTable } from './active-students-table'
import { AllStudentsTable } from './all-students-table'
import { AdminsTable } from './admins-table'
import type { UserProfile } from '@/lib/supabase/admin'

interface StudentManagementClientUIProps {
  users: UserProfile[]
}

export function StudentManagementClientUI({ users }: StudentManagementClientUIProps) {
  // Client-side filtering logic
  const pendingUsers = useMemo(() => 
    users.filter(u => u.status === 'pending'), [users]
  )
  
  const activeStudents = useMemo(() => 
    users.filter(u => u.status === 'active' && u.role === 'student'), [users]
  )
  
  const admins = useMemo(() => 
    users.filter(u => u.role === 'admin'), [users]
  )

  const refreshData = () => {
    // Refresh the page to get updated data from server
    window.location.reload()
  }

  return (
    <Tabs defaultValue="pending" className="w-full">
      <div className="border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-transparent h-auto p-0 gap-1">
          <TabsTrigger 
            value="pending" 
            className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-red-500 transition-all duration-200 relative touch-target"
          >
            <span className="hidden sm:inline">Pending Approval</span>
            <span className="sm:hidden">Pending</span>
            {pendingUsers.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold animate-pulse">
                {pendingUsers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="active"
            className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-green-500 transition-all duration-200 touch-target"
          >
            <span className="hidden sm:inline">Active Students</span>
            <span className="sm:hidden">Active</span>
            {activeStudents.length > 0 && (
              <span className="bg-green-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold">
                {activeStudents.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="admins"
            className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-200 touch-target"
          >
            <span className="hidden sm:inline">Administrators</span>
            <span className="sm:hidden">Admins</span>
            {admins.length > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold">
                {admins.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="all"
            className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-gray-500 transition-all duration-200 touch-target"
          >
            <span className="hidden sm:inline">All Users</span>
            <span className="sm:hidden">All</span>
            {users.length > 0 && (
              <span className="bg-gray-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold">
                {users.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="pending" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
        <div className="border-b border-gray-100/50 pb-4 sm:pb-6">
          <h2 className="mobile-text-lg font-bold text-gray-900 tracking-tight">
            Pending Approval
          </h2>
          <p className="mobile-text-sm text-gray-600 font-medium mt-1">
            Review and approve new student registrations.
          </p>
        </div>
        <PendingApprovalTable 
          users={pendingUsers} 
          onUserAction={refreshData} 
        />
      </TabsContent>
      
      <TabsContent value="active" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
        <div className="border-b border-gray-100/50 pb-4 sm:pb-6">
          <h2 className="mobile-text-lg font-bold text-gray-900 tracking-tight">
            Active Students
          </h2>
          <p className="mobile-text-sm text-gray-600 font-medium mt-1">
            Currently active students with platform access.
          </p>
        </div>
        <ActiveStudentsTable 
          users={activeStudents} 
          onUserAction={refreshData} 
        />
      </TabsContent>
      
      <TabsContent value="admins" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
        <div className="border-b border-gray-100/50 pb-4 sm:pb-6">
          <h2 className="mobile-text-lg font-bold text-gray-900 tracking-tight">
            Administrators
          </h2>
          <p className="mobile-text-sm text-gray-600 font-medium mt-1">
            Users with administrative privileges.
          </p>
        </div>
        <AdminsTable 
          users={admins} 
          onUserAction={refreshData} 
        />
      </TabsContent>
      
      <TabsContent value="all" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
        <div className="border-b border-gray-100/50 pb-4 sm:pb-6">
          <h2 className="mobile-text-lg font-bold text-gray-900 tracking-tight">
            All Users
          </h2>
          <p className="mobile-text-sm text-gray-600 font-medium mt-1">
            Complete list of all registered users.
          </p>
        </div>
        <AllStudentsTable users={users} />
      </TabsContent>
    </Tabs>
  )
}
