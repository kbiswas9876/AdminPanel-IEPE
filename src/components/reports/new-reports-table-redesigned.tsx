'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AlertTriangle, Eye, ExternalLink, User, Calendar, ChevronDown, ChevronUp, Clock, FileText, BookOpen, Tag } from 'lucide-react'
import { getErrorReportsByStatus, updateErrorReportStatus } from '@/lib/actions/error-reports'
import type { ErrorReportWithDetails } from '@/lib/supabase/admin'
import { toast } from 'sonner'
import Link from 'next/link'
import { REPORT_OPTIONS } from '@/lib/constants'

export function NewReportsTableRedesigned() {
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

  const getPriorityLevel = (report: ErrorReportWithDetails) => {
    // Priority based on category and age
    const daysSinceCreated = Math.floor((Date.now() - new Date(report.created_at).getTime()) / (1000 * 60 * 60 * 24))
    
    if (report.report_tag === 'wrong_question' || report.report_tag === 'wrong_answer') {
      return daysSinceCreated > 1 ? 'high' : 'critical'
    }
    if (daysSinceCreated > 3) return 'high'
    if (daysSinceCreated > 1) return 'medium'
    return 'low'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await getErrorReportsByStatus('new')
      setReports(data)
    } catch (error) {
      console.error('Error loading new reports:', error)
      toast.error('Failed to load new reports')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsInReview = async (reportId: number) => {
    try {
      setUpdating(reportId)
      const result = await updateErrorReportStatus(reportId, 'reviewed')
      
      if (result.success) {
        toast.success('Report marked as in review')
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
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No new reports</h3>
            <p className="text-slate-500">
              All error reports have been reviewed. Great job maintaining quality!
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
          <h2 className="text-2xl font-bold text-slate-900">New Error Reports</h2>
          <p className="text-slate-600">Reports requiring immediate attention</p>
        </div>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          {reports.length} Pending
        </Badge>
      </div>

      {reports.map((report) => {
        const priority = getPriorityLevel(report)
        const isExpanded = expandedReports.has(report.id)
        const daysSinceCreated = Math.floor((Date.now() - new Date(report.created_at).getTime()) / (1000 * 60 * 60 * 24))

        return (
          <Card key={report.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-0">
              {/* Main Report Card */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Priority Indicator */}
                    <div className={`w-1 h-16 rounded-full ${getPriorityColor(priority)}`}></div>
                    
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
                          <Badge variant="destructive" className="animate-pulse">
                            New
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="h-4 w-4" />
                          {daysSinceCreated === 0 ? 'Today' : `${daysSinceCreated} day${daysSinceCreated > 1 ? 's' : ''} ago`}
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

                  {/* Action Button */}
                  <div className="ml-4">
                    <Button
                      size="lg"
                      onClick={() => handleMarkAsInReview(report.id)}
                      disabled={updating === report.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      {updating === report.id ? 'Processing...' : 'Mark as In Review'}
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
