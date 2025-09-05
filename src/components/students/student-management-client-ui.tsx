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
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="pending" className="relative">
          Pending Approval
          {pendingUsers.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {pendingUsers.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="active">
          Active Students
          {activeStudents.length > 0 && (
            <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-1">
              {activeStudents.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="admins">
          Administrators
          {admins.length > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
              {admins.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="all">
          All Users
          {users.length > 0 && (
            <span className="ml-2 bg-gray-500 text-white text-xs rounded-full px-2 py-1">
              {users.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending" className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Approval
          </h2>
          <p className="text-sm text-gray-600">
            Review and approve new student registrations.
          </p>
        </div>
        <PendingApprovalTable 
          users={pendingUsers} 
          onUserAction={refreshData} 
        />
      </TabsContent>
      
      <TabsContent value="active" className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Active Students
          </h2>
          <p className="text-sm text-gray-600">
            Currently active students with platform access.
          </p>
        </div>
        <ActiveStudentsTable 
          users={activeStudents} 
          onUserAction={refreshData} 
        />
      </TabsContent>
      
      <TabsContent value="admins" className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Administrators
          </h2>
          <p className="text-sm text-gray-600">
            Users with administrative privileges.
          </p>
        </div>
        <AdminsTable 
          users={admins} 
          onUserAction={refreshData} 
        />
      </TabsContent>
      
      <TabsContent value="all" className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            All Users
          </h2>
          <p className="text-sm text-gray-600">
            Complete list of all registered users.
          </p>
        </div>
        <AllStudentsTable users={users} />
      </TabsContent>
    </Tabs>
  )
}
