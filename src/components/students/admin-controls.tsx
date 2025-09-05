'use client'

import { useState } from 'react'
import { activateUser, suspendUser, triggerPasswordReset } from '@/lib/actions/student-analytics'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, UserCheck, Key, AlertTriangle } from 'lucide-react'
import type { UserProfile } from '@/lib/supabase/admin'

interface AdminControlsProps {
  user: UserProfile
  onAction: () => void
}

export function AdminControls({ user, onAction }: AdminControlsProps) {
  const [isActivating, setIsActivating] = useState(false)
  const [isSuspending, setIsSuspending] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const handleActivate = async () => {
    setIsActivating(true)
    try {
      const result = await activateUser(user.id)
      
      if (result.success) {
        onAction()
      } else {
        console.error('Activation failed:', result.message)
        alert(result.message)
      }
    } catch (error) {
      console.error('Error activating user:', error)
      alert('An error occurred while activating the user')
    } finally {
      setIsActivating(false)
    }
  }

  const handleSuspend = async () => {
    setIsSuspending(true)
    try {
      const result = await suspendUser(user.id)
      
      if (result.success) {
        onAction()
      } else {
        console.error('Suspension failed:', result.message)
        alert(result.message)
      }
    } catch (error) {
      console.error('Error suspending user:', error)
      alert('An error occurred while suspending the user')
    } finally {
      setIsSuspending(false)
    }
  }

  const handlePasswordReset = async () => {
    setIsResetting(true)
    try {
      const result = await triggerPasswordReset(user.id)
      
      if (result.success) {
        alert('Password reset email sent successfully!')
      } else {
        console.error('Password reset failed:', result.message)
        alert(result.message)
      }
    } catch (error) {
      console.error('Error triggering password reset:', error)
      alert('An error occurred while sending password reset')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Admin Controls</span>
        </CardTitle>
        <CardDescription>
          Manage this student&apos;s account and access permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Activate User */}
          {user.status !== 'active' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Activate User Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to activate this user&apos;s account?
                    <br />
                    <br />
                    <strong>User:</strong> {user.full_name || 'No name provided'}
                    <br />
                    <strong>Email:</strong> {user.email}
                    <br />
                    <br />
                    This will grant them full access to the platform.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleActivate}
                    disabled={isActivating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isActivating ? 'Activating...' : 'Activate Account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Suspend User */}
          {user.status === 'active' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Suspend User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Suspend User Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to suspend this user&apos;s account?
                    <br />
                    <br />
                    <strong>User:</strong> {user.full_name || 'No name provided'}
                    <br />
                    <strong>Email:</strong> {user.email}
                    <br />
                    <br />
                    This will revoke their access to the platform but keep their data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSuspend}
                    disabled={isSuspending}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isSuspending ? 'Suspending...' : 'Suspend Account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Trigger Password Reset */}
          <Button
            variant="outline"
            className="w-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            onClick={handlePasswordReset}
            disabled={isResetting}
          >
            <Key className="h-4 w-4 mr-2" />
            {isResetting ? 'Sending...' : 'Send Password Reset'}
          </Button>
        </div>

        {/* Status Information */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Current Status</h4>
          <div className="text-sm text-gray-600">
            <p><strong>Account Status:</strong> {user.status}</p>
            <p><strong>Last Updated:</strong> {user.updated_at ? new Date(user.updated_at).toLocaleString() : 'Never'}</p>
            <p><strong>Registration Date:</strong> {new Date(user.created_at).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


