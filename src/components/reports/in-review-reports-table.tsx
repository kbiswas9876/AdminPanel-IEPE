'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, CheckCircle, RotateCcw, ExternalLink, User, Calendar } from 'lucide-react'
import { getErrorReportsByStatus, updateErrorReportStatus } from '@/lib/actions/error-reports'
import type { ErrorReportWithDetails } from '@/lib/supabase/admin'
import { toast } from 'sonner'
import Link from 'next/link'

export function InReviewReportsTable() {
  const [reports, setReports] = useState<ErrorReportWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await getErrorReportsByStatus('in_review')
      setReports(data)
    } catch (error) {
      console.error('Error loading in-review reports:', error)
      toast.error('Failed to load in-review reports')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (reportId: number, newStatus: 'new' | 'resolved') => {
    try {
      setUpdating(reportId)
      const result = await updateErrorReportStatus(reportId, newStatus)
      
      if (result.success) {
        toast.success(`Report ${newStatus === 'resolved' ? 'marked as resolved' : 'reverted to new'}`)
        loadReports() // Refresh the list
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error updating report status:', error)
      toast.error('Failed to update report status')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            In Review Reports
          </CardTitle>
          <CardDescription>
            Reports currently being reviewed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading reports...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-500" />
          In Review Reports
          <Badge variant="secondary">{reports.length}</Badge>
        </CardTitle>
        <CardDescription>
          Reports currently being reviewed
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No reports in review</h3>
              <p className="text-sm text-muted-foreground">
                All reports have been processed
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question ID</TableHead>
                  <TableHead>Report Description</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/content/edit/${report.question_id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        {report.question_id}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm line-clamp-2">
                          {report.report_description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {report.user_full_name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {report.user_email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">In Review</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(report.id, 'new')}
                          disabled={updating === report.id}
                          className="flex items-center gap-1"
                        >
                          <RotateCcw className="h-4 w-4" />
                          {updating === report.id ? 'Updating...' : 'Revert to New'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(report.id, 'resolved')}
                          disabled={updating === report.id}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {updating === report.id ? 'Updating...' : 'Mark as Resolved'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
