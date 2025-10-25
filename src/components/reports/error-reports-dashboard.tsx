'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, Search, Filter, ChevronDown, ChevronUp, ExternalLink, User, TrendingUp, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getErrorReportsByStatus, updateErrorReportStatus, getNewErrorReportsCount } from '@/lib/actions/error-reports'
import type { ErrorReportWithDetails } from '@/lib/supabase/admin'
import { toast } from 'sonner'
import Link from 'next/link'
import { REPORT_OPTIONS } from '@/lib/constants'

const ErrorReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState('new')
  const [expandedReport, setExpandedReport] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [reports, setReports] = useState<{
    new: ErrorReportWithDetails[]
    review: ErrorReportWithDetails[]
    resolved: ErrorReportWithDetails[]
  }>({
    new: [],
    review: [],
    resolved: []
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    inReview: 0,
    avgResolutionTime: '0',
    resolvedPercentage: 0,
    weeklyTrend: '+0%'
  })

  // Load all reports data
  const loadReports = async () => {
    try {
      setLoading(true)
      const [newReports, reviewReports, resolvedReports] = await Promise.all([
        getErrorReportsByStatus('new'),
        getErrorReportsByStatus('reviewed'),
        getErrorReportsByStatus('resolved')
      ])

      setReports({
        new: newReports,
        review: reviewReports,
        resolved: resolvedReports
      })

      // Calculate stats
      const total = newReports.length + reviewReports.length + resolvedReports.length
      const resolved = resolvedReports.length
      const pending = newReports.length
      const inReview = reviewReports.length
      const resolvedPercentage = total > 0 ? Math.round((resolved / total) * 100) : 0
      
      // Calculate average resolution time
      const avgResolutionTime = resolvedReports.length > 0 ? 
        Math.round(resolvedReports.reduce((acc, report) => {
          const created = new Date(report.created_at)
          const resolved = new Date(report.updated_at || report.created_at)
          return acc + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        }, 0) / resolvedReports.length * 10) / 10 : 0

      setStats({
        total,
        resolved,
        pending,
        inReview,
        avgResolutionTime: avgResolutionTime.toString(),
        resolvedPercentage,
        weeklyTrend: '+12%' // This would be calculated from historical data
      })
    } catch (error) {
      console.error('Error loading reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'wrong_question': 'bg-red-100 text-red-700 border-red-200',
      'wrong_answer': 'bg-orange-100 text-orange-700 border-orange-200',
      'formatting_issue': 'bg-blue-100 text-blue-700 border-blue-200',
      'no_solution': 'bg-purple-100 text-purple-700 border-purple-200',
      'translation_issue': 'bg-purple-100 text-purple-700 border-purple-200',
      'other': 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getCategoryLabel = (category: string) => {
    const option = REPORT_OPTIONS.find(opt => opt.tag === category)
    return option ? option.label : category?.replace('_', ' ') || 'N/A'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-amber-100 text-amber-800 border-amber-200',
      'reviewed': 'bg-blue-100 text-blue-800 border-blue-200',
      'resolved': 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status: string) => {
    if (status === 'new') return <AlertCircle className="w-4 h-4" />
    if (status === 'reviewed') return <Clock className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'new': 'New',
      'reviewed': 'In Review',
      'resolved': 'Resolved'
    }
    return labels[status] || status
  }

  const handleStatusUpdate = async (reportId: number, newStatus: 'new' | 'reviewed' | 'resolved') => {
    try {
      setUpdating(reportId)
      const result = await updateErrorReportStatus(reportId, newStatus)
      
      if (result.success) {
        toast.success(`Report ${newStatus === 'resolved' ? 'marked as resolved' : 
                     newStatus === 'reviewed' ? 'marked as in review' : 
                     'reverted to new'}`)
        loadReports() // Refresh the data
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

  const filteredReports = reports[activeTab as keyof typeof reports].filter(report => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      report.question_id.toLowerCase().includes(query) ||
      report.report_description?.toLowerCase().includes(query) ||
      report.user_full_name?.toLowerCase().includes(query) ||
      report.user_email.toLowerCase().includes(query) ||
      getCategoryLabel(report.report_tag).toLowerCase().includes(query)
    )
  })

  const currentReports = filteredReports

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Professional Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Error Reports Management</h1>
              <p className="text-sm text-slate-600 mt-1">Monitor and resolve user-reported content issues</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs text-slate-500 uppercase tracking-wide">System Status</div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-700">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Professional Quality Control Overview */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Quality Control Overview</h2>
                <p className="text-sm text-slate-500 mt-0.5">Real-time metrics and performance indicators</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-600 font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.weeklyTrend} this week</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 divide-x divide-slate-100">
            {/* Total Reports */}
            <div className="px-6 py-5 bg-gradient-to-br from-slate-50 to-white">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.total}</div>
              <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">Total Reports</div>
            </div>

            {/* Pending */}
            <div className="px-6 py-5 bg-gradient-to-br from-amber-50/50 to-white">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.pending}</div>
              <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">Pending Review</div>
            </div>

            {/* In Review */}
            <div className="px-6 py-5 bg-gradient-to-br from-blue-50/50 to-white">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.inReview}</div>
              <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">In Review</div>
            </div>

            {/* Resolved */}
            <div className="px-6 py-5 bg-gradient-to-br from-green-50/50 to-white">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.resolved}</div>
              <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">Resolved</div>
            </div>

            {/* Resolution Rate */}
            <div className="px-6 py-5 bg-gradient-to-br from-purple-50/50 to-white">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.resolvedPercentage}%</div>
              <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">Resolution Rate</div>
            </div>

            {/* Avg Time */}
            <div className="px-6 py-5 bg-gradient-to-br from-indigo-50/50 to-white">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.avgResolutionTime}</div>
              <div className="text-xs font-medium text-slate-600 uppercase tracking-wide">Avg Days to Resolve</div>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('new')}
                  className={`relative px-6 py-2.5 rounded-lg font-medium transition-all ${
                    activeTab === 'new'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  New Reports
                  {stats.pending > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {stats.pending}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('review')}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                    activeTab === 'review'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  In Review
                </button>
                <button
                  onClick={() => setActiveTab('resolved')}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                    activeTab === 'resolved'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  Resolved
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <Filter className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-lg font-medium">Loading reports...</p>
              </div>
            ) : currentReports.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-lg font-medium">
                  {searchQuery ? 'No reports match your search' : 'No reports in this category'}
                </p>
                {searchQuery && (
                  <p className="text-sm text-slate-400 mt-1">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              currentReports.map((report) => (
                <div key={report.id} className="hover:bg-slate-50/50 transition-colors">
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Link
                            href={`/content/edit/${report.question_id}`}
                            className="text-blue-600 hover:text-blue-700 font-semibold text-lg flex items-center space-x-1 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Question #{report.question_id}</span>
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Badge variant="outline" className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(report.report_tag)}`}>
                            {getCategoryLabel(report.report_tag)}
                          </Badge>
                          <Badge variant="outline" className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            <span>{getStatusLabel(report.status)}</span>
                          </Badge>
                        </div>

                        <p className="text-slate-700 mb-3 leading-relaxed">
                          {expandedReport === report.id ? 
                            report.report_description : 
                            report.report_description && report.report_description.length > 150 
                              ? `${report.report_description.substring(0, 150)}...` 
                              : report.report_description}
                        </p>

                        <div className="flex items-center space-x-6 text-sm text-slate-500">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {(report.user_full_name || 'Anonymous').split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <span>{report.user_full_name || 'Anonymous User'}</span>
                          </div>
                          <div>Submitted: {new Date(report.created_at).toLocaleDateString()}</div>
                          {report.updated_at && report.status === 'resolved' && (
                            <div>Resolved: {new Date(report.updated_at).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>

                      <div className="ml-6 flex items-center space-x-2">
                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                          {expandedReport === report.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {expandedReport === report.id && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex space-x-3">
                        {activeTab === 'new' && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusUpdate(report.id, 'reviewed')
                            }}
                            disabled={updating === report.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          >
                            {updating === report.id ? 'Processing...' : 'Mark as In Review'}
                          </Button>
                        )}
                        {activeTab === 'review' && (
                          <>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusUpdate(report.id, 'resolved')
                              }}
                              disabled={updating === report.id}
                              className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                            >
                              {updating === report.id ? 'Processing...' : 'Mark as Resolved'}
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusUpdate(report.id, 'new')
                              }}
                              disabled={updating === report.id}
                              variant="outline"
                              className="border-slate-200 text-slate-700 hover:bg-slate-50"
                            >
                              {updating === report.id ? 'Processing...' : 'Revert to New'}
                            </Button>
                          </>
                        )}
                        {activeTab === 'resolved' && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusUpdate(report.id, 'reviewed')
                            }}
                            disabled={updating === report.id}
                            variant="outline"
                            className="border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            {updating === report.id ? 'Processing...' : 'Reopen Report'}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorReportsDashboard
