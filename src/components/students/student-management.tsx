'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PendingApprovalTable } from './pending-approval-table'
import { ActiveStudentsTable } from './active-students-table'
import { AllStudentsTable } from './all-students-table'
import type { UserProfile } from '@/lib/supabase/admin'

interface StudentManagementProps {
  initialPendingUsers: UserProfile[]
  initialActiveUsers: UserProfile[]
  initialAllUsers: UserProfile[]
}

export function StudentManagement({ 
  initialPendingUsers, 
  initialActiveUsers, 
  initialAllUsers 
}: StudentManagementProps) {
  const pendingUsers = initialPendingUsers
  const activeUsers = initialActiveUsers
  const allUsers = initialAllUsers

  const refreshData = () => {
    // Refresh the page to get updated data from server
    window.location.reload()
  }

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
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
          {activeUsers.length > 0 && (
            <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-1">
              {activeUsers.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="all">
          All Students
          {allUsers.length > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
              {allUsers.length}
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
          users={activeUsers} 
          onUserAction={refreshData} 
        />
      </TabsContent>
      
      <TabsContent value="all" className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            All Students
          </h2>
          <p className="text-sm text-gray-600">
            Complete list of all registered students.
          </p>
        </div>
        <AllStudentsTable users={allUsers} />
      </TabsContent>
    </Tabs>
  )
}
