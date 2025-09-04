'use client'

import { useState, useEffect } from 'react'
import { getUserCounts } from '@/lib/actions/students'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PendingApprovalTable } from './pending-approval-table'
import { ActiveStudentsTable } from './active-students-table'
import { AllStudentsTable } from './all-students-table'

export function StudentManagement() {
  const [userCounts, setUserCounts] = useState({
    pending: 0,
    active: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const counts = await getUserCounts()
        setUserCounts(counts)
      } catch (error) {
        console.error('Error fetching user counts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [])

  const refreshCounts = async () => {
    try {
      const counts = await getUserCounts()
      setUserCounts(counts)
    } catch (error) {
      console.error('Error refreshing counts:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending" className="relative">
          Pending Approval
          {userCounts.pending > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {userCounts.pending}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="active">
          Active Students
          {userCounts.active > 0 && (
            <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-1">
              {userCounts.active}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="all">
          All Students
          {userCounts.total > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
              {userCounts.total}
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
        <PendingApprovalTable onUserAction={refreshCounts} />
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
        <ActiveStudentsTable onUserAction={refreshCounts} />
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
        <AllStudentsTable onUserAction={refreshCounts} />
      </TabsContent>
    </Tabs>
  )
}
