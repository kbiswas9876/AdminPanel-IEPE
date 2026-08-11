'use client'

import React, { useState } from 'react'
import { Download, Mail, Eye, UserCheck, FileText, Send, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { type UserProfile } from '@/lib/supabase/admin'
import { exportUserData, sendCustomEmail, getUserLogs, impersonateUser } from '@/lib/actions/advanced-user-actions'

interface AdvancedUserActionsProps {
  user: UserProfile
  onClose: () => void
}

export function AdvancedUserActions({ user, onClose }: AdvancedUserActionsProps) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [logsDialogOpen, setLogsDialogOpen] = useState(false)
  const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userLogs, setUserLogs] = useState<any[]>([])

  // Email form state
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    template: 'custom'
  })

  // Export form state
  const [exportData, setExportData] = useState({
    format: 'csv',
    includeActivity: true,
    includeGroups: true,
    includeTags: true,
    dateRange: 'all'
  })

  const emailTemplates = [
    { value: 'custom', label: 'Custom Message' },
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'reminder', label: 'Reminder Email' },
    { value: 'warning', label: 'Warning Email' },
    { value: 'suspension', label: 'Suspension Notice' }
  ]

  const exportFormats = [
    { value: 'csv', label: 'CSV' },
    { value: 'excel', label: 'Excel' },
    { value: 'json', label: 'JSON' },
    { value: 'pdf', label: 'PDF' }
  ]

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '1year', label: 'Last Year' }
  ]

  const handleExportUserData = async () => {
    try {
      setLoading(true)
      const result = await exportUserData(user.id, {
        ...exportData,
        format: exportData.format as 'csv' | 'excel' | 'json' | 'pdf'
      })
      if (result.success) {
        toast.success('User data exported successfully')
        setExportDialogOpen(false)
        onClose()
      } else {
        toast.error(result.error || 'Failed to export user data')
      }
    } catch (error) {
      console.error('Error exporting user data:', error)
      toast.error('Failed to export user data')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    try {
      setLoading(true)
      const result = await sendCustomEmail(user.id, emailData)
      if (result.success) {
        toast.success('Email sent successfully')
        setEmailDialogOpen(false)
        onClose()
      } else {
        toast.error(result.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error('Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  const handleViewLogs = async () => {
    try {
      setLoading(true)
      const result = await getUserLogs(user.id)
      if (result.success) {
        setUserLogs(result.logs || [])
        setLogsDialogOpen(true)
      } else {
        toast.error(result.error || 'Failed to fetch user logs')
      }
    } catch (error) {
      console.error('Error fetching user logs:', error)
      toast.error('Failed to fetch user logs')
    } finally {
      setLoading(false)
    }
  }

  const handleImpersonate = async () => {
    try {
      setLoading(true)
      const result = await impersonateUser(user.id)
      if (result.success) {
        toast.success('Impersonation started')
        setImpersonateDialogOpen(false)
        onClose()
        // Redirect to student portal with impersonation token
        window.open(`/student-portal?impersonate=${result.token}`, '_blank')
      } else {
        toast.error(result.error || 'Failed to start impersonation')
      }
    } catch (error) {
      console.error('Error starting impersonation:', error)
      toast.error('Failed to start impersonation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Advanced Actions</h2>
          <p className="text-gray-600">Advanced management options for {user.full_name || user.email}</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export User Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Export User Data
            </CardTitle>
            <CardDescription>
              Download comprehensive user data and activity logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export User Data</DialogTitle>
                  <DialogDescription>
                    Choose export options for {user.full_name || user.email}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="format">Export Format</Label>
                    <Select value={exportData.format} onValueChange={(value) => setExportData({ ...exportData, format: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {exportFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateRange">Date Range</Label>
                    <Select value={exportData.dateRange} onValueChange={(value) => setExportData({ ...exportData, dateRange: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dateRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Include in Export</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={exportData.includeActivity}
                          onChange={(e) => setExportData({ ...exportData, includeActivity: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">Activity Logs</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={exportData.includeGroups}
                          onChange={(e) => setExportData({ ...exportData, includeGroups: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">Group Memberships</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={exportData.includeTags}
                          onChange={(e) => setExportData({ ...exportData, includeTags: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm">Tags</span>
                      </label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleExportUserData} disabled={loading}>
                    {loading ? 'Exporting...' : 'Export Data'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Send Custom Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              Send Email
            </CardTitle>
            <CardDescription>
              Send custom email to the user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Email to User</DialogTitle>
                  <DialogDescription>
                    Send a custom email to {user.full_name || user.email}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template">Email Template</Label>
                    <Select value={emailData.template} onValueChange={(value) => setEmailData({ ...emailData, template: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map((template) => (
                          <SelectItem key={template.value} value={template.value}>
                            {template.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={emailData.subject}
                      onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                      placeholder="Enter email subject"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={emailData.message}
                      onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                      placeholder="Enter email message"
                      rows={6}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendEmail} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Email'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* View User Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              View Logs
            </CardTitle>
            <CardDescription>
              View user activity and system logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleViewLogs} disabled={loading}>
              <Eye className="w-4 h-4 mr-2" />
              {loading ? 'Loading...' : 'View Logs'}
            </Button>
          </CardContent>
        </Card>

        {/* Impersonate User */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-orange-600" />
              Impersonate User
            </CardTitle>
            <CardDescription>
              Login as this user for testing purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog open={impersonateDialogOpen} onOpenChange={setImpersonateDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Impersonate User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Impersonate User
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to impersonate <strong>{user.full_name || user.email}</strong>? 
                    This will log you in as this user for testing purposes. You can return to admin mode anytime.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleImpersonate}
                    disabled={loading}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {loading ? 'Starting...' : 'Start Impersonation'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>

      {/* User Logs Dialog */}
      <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>User Activity Logs</DialogTitle>
            <DialogDescription>
              Activity logs for {user.full_name || user.email}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {userLogs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No logs found</p>
            ) : (
              <div className="space-y-2">
                {userLogs.map((log, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.type}</Badge>
                        <span className="text-sm font-medium">{log.description}</span>
                      </div>
                      <span className="text-xs text-gray-500">{log.timestamp}</span>
                    </div>
                    {log.details && (
                      <div className="mt-2 text-sm text-gray-600">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
