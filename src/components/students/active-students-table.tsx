'use client'

import type { UserProfile } from '@/lib/supabase/admin'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { User, Mail, Calendar, Shield } from 'lucide-react'
import Link from 'next/link'
import { SuspendUserDialog } from './suspend-user-dialog'
import { PromoteToAdminDialog } from './promote-to-admin-dialog'

interface ActiveStudentsTableProps {
  users: UserProfile[]
  onUserAction: () => void
}

export function ActiveStudentsTable({ users, onUserAction }: ActiveStudentsTableProps) {

  const handleUserAction = () => {
    onUserAction() // Notify parent component to refresh data
  }



  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Students</h3>
        <p className="text-gray-500">No students have been approved yet.</p>
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
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Link href={`/students/${user.id}`} className="hover:bg-gray-50 rounded-md p-2 -m-2 block">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 hover:text-blue-600">
                        {user.full_name || 'No name provided'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Click to view profile
                      </p>
                    </div>
                  </div>
                </Link>
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <PromoteToAdminDialog 
                    user={user} 
                    onPromote={handleUserAction}
                  />
                  <SuspendUserDialog 
                    user={user} 
                    onSuspend={handleUserAction}
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
