'use client'

import type { UserProfile } from '@/lib/supabase/admin'
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MobileResponsiveTable, MobileTableCard, MobileCardRow } from '@/components/shared/mobile-responsive-table'
import { User, Mail, Calendar } from 'lucide-react'
import { ApproveUserDialog } from './approve-user-dialog'
import { RejectUserDialog } from './reject-user-dialog'

interface PendingApprovalTableProps {
  users: UserProfile[]
  onUserAction: () => void
}

export function PendingApprovalTable({ users, onUserAction }: PendingApprovalTableProps) {

  const handleUserAction = () => {
    onUserAction() // Notify parent component to refresh data
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
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block rounded-md border">
        <MobileResponsiveTable>
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
                    <span className="text-sm text-gray-900">{user.email || 'No email'}</span>
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
        </MobileResponsiveTable>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {users.map((user) => (
          <MobileTableCard key={user.id}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 truncate">
                    {user.full_name || 'No name provided'}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{user.email || 'No email'}</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
            </div>
            
            <MobileCardRow 
              label="Registration Date" 
              value={
                <span className="text-sm text-gray-600">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              } 
            />
            
            <div className="pt-3 border-t border-gray-100">
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
            </div>
          </MobileTableCard>
        ))}
      </div>
    </>
  )
}
