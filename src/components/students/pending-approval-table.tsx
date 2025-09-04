'use client'

import { useState, useEffect } from 'react'
import { getUsersByStatus } from '@/lib/actions/students'
import type { UserProfile } from '@/lib/supabase/admin'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { User, Mail, Calendar } from 'lucide-react'
import { ApproveUserDialog } from './approve-user-dialog'
import { RejectUserDialog } from './reject-user-dialog'

interface PendingApprovalTableProps {
  onUserAction: () => void
}

export function PendingApprovalTable({ onUserAction }: PendingApprovalTableProps) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const pendingUsers = await getUsersByStatus('pending')
        setUsers(pendingUsers)
      } catch (err) {
        setError('Failed to fetch pending users')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleUserAction = () => {
    // Refresh the users list
    const fetchUsers = async () => {
      try {
        const pendingUsers = await getUsersByStatus('pending')
        setUsers(pendingUsers)
      } catch (err) {
        setError('Failed to fetch pending users')
        console.error('Error:', err)
      }
    }
    
    fetchUsers()
    onUserAction() // Notify parent component to refresh counts
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
        <p className="text-gray-500">All users have been processed. Check back later for new registrations.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.full_name || 'No name provided'}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{user.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <ApproveUserDialog 
                    user={user} 
                    onApprove={handleUserAction}
                  />
                  <RejectUserDialog 
                    user={user} 
                    onReject={handleUserAction}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
