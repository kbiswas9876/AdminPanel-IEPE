'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Eye, CheckCircle, RotateCcw, ExternalLink, User, Calendar, ChevronDown, ChevronUp, Clock, FileText, BookOpen, Tag, AlertCircle } from 'lucide-react'
import { getErrorReportsByStatus, updateErrorReportStatus } from '@/lib/actions/error-reports'
import type { ErrorReportWithDetails } from '@/lib/supabase/admin'
import { toast } from 'sonner'
import Link from 'next/link'
import { REPORT_OPTIONS } from '@/lib/constants'

export function InReviewReportsTableRedesigned() {
  const [reports, setReports] = useState<ErrorReportWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [expandedReports, setExpandedReports] = useState<Set<number>>(new Set())

  const renderCategoryBadge = (reportTag: string) => {
    const option = REPORT_OPTIONS.find(opt => opt.tag === reportTag)
    const label = option ? option.label : reportTag?.replace('_', ' ') || 'N/A'
    
    const getCategoryColor = (tag: string) => {
      switch (tag) {
        case 'wrong_question': return 'bg-red-100 text-red-800 border-red-200'
        case 'wrong_answer': return 'bg-orange-100 text-orange-800 border-orange-200'
        case 'formatting_issue': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'no_solution': return 'bg-purple-100 text-purple-800 border-purple-200'
        case 'translation_issue': return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'other': return 'bg-gray-100 text-gray-800 border-gray-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }

    return (
      <Badge variant="outline" className={`${getCategoryColor(reportTag)} font-medium`}>
        <Tag className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    )
  }

  const toggleExpanded = (reportId: number) => {
    const newExpanded = new Set(expandedReports)
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId)
    } else {
      newExpanded.add(reportId)
    }
    setExpandedReports(newExpanded)
  }

  const getReviewDuration = (report: ErrorReportWithDetails) => {
    const daysSinceUpdated = Math.floor((Date.now() - new Date(report.updated_at || report.created_at).getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceUpdated
  }

  const getReviewStatus = (daysInReview: number) => {
    if (daysInReview > 3) return { level: 'overdue', color: 'bg-red-500', text: 'Overdue' }
    if (daysInReview > 1) return { level: 'pending', color: 'bg-yellow-500', text: 'Pending' }
    return { level: 'recent', color: 'bg-blue-500', text: 'Recent' }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await getErrorReportsByStatus('reviewed')
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
        loadReports()
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
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm bg-white/50">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-6 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white/50">
        <CardContent className="p-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No reports in review</h3>
            <p className="text-slate-500">
              All reports have been processed. Great work on maintaining efficiency!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">In Review Reports</h2>
          <p className="text-slate-600">Reports currently being reviewed by administrators</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {reports.length} In Progress
        </Badge>
      </div>

      {reports.map((report) => {
        const daysInReview = getReviewDuration(report)
        const reviewStatus = getReviewStatus(daysInReview)
        const isExpanded = expandedReports.has(report.id)

        return (
          <Card key={report.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-0">
              {/* Main Report Card */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Review Status Indicator */}
                    <div className={`w-1 h-16 rounded-full ${reviewStatus.color}`}></div>
                    
                    {/* Report Content */}
                    <div className="flex-1 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Link 
                            href={`/content/edit/${report.question_id}`}
                            className="text-lg font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
                          >
                            Question #{report.question_id}
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          {renderCategoryBadge(report.report_tag)}
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                            In Review
                          </Badge>
                          {reviewStatus.level === 'overdue' && (
                            <Badge variant="destructive" className="animate-pulse">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4" />
                          {daysInReview === 0 ? 'Today' : `${daysInReview} day${daysInReview > 1 ? 's' : ''} in review`}
                        </div>
                      </div>

                      {/* Description Preview */}
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-slate-700 leading-relaxed">
                              {isExpanded ? report.report_description : 
                               report.report_description?.length > 150 
                                 ? `${report.report_description.substring(0, 150)}...` 
                                 : report.report_description}
                            </p>
                            {report.report_description && report.report_description.length > 150 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(report.id)}
                                className="mt-2 h-auto p-0 text-blue-600 hover:text-blue-800"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    Show more
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(report.id)}>
                        <CollapsibleContent className="space-y-3 mt-4">
                          {/* Question Context */}
                          {report.question_text && (
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                              <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-600">Question Context</span>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {report.question_text.length > 200 
                                  ? `${report.question_text.substring(0, 200)}...` 
                                  : report.question_text}
                              </p>
                              {report.book_source && (
                                <div className="mt-2 text-xs text-slate-500">
                                  Source: {report.book_source} {report.chapter_name && `• ${report.chapter_name}`}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Reporter Information */}
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">
                                {report.user_full_name || 'Anonymous User'}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span>{report.user_email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Submitted {new Date(report.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-4 flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(report.id, 'new')}
                      disabled={updating === report.id}
                      className="text-slate-600 border-slate-300 hover:bg-slate-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {updating === report.id ? 'Processing...' : 'Revert to New'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(report.id, 'resolved')}
                      disabled={updating === report.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {updating === report.id ? 'Processing...' : 'Mark as Resolved'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
