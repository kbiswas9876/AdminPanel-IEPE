'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, Search, Filter, ChevronDown, ChevronUp, ExternalLink, User, TrendingUp, Activity, X, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  
  // Filter state
  const [filters, setFilters] = useState({
    category: 'all',
    dateRange: 'all',
    sortBy: 'newest'
  })
  const [showFilters, setShowFilters] = useState(false)

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

  const filteredReports = reports[activeTab as keyof typeof reports]
    .filter(report => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = (
          String(report.question_id).toLowerCase().includes(query) ||
          report.report_description?.toLowerCase().includes(query) ||
          report.user_full_name?.toLowerCase().includes(query) ||
          report.user_email.toLowerCase().includes(query) ||
          getCategoryLabel(report.report_tag).toLowerCase().includes(query)
        )
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.category !== 'all' && report.report_tag !== filters.category) {
        return false
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const reportDate = new Date(report.created_at)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (filters.dateRange) {
          case 'today':
            if (daysDiff > 0) return false
            break
          case 'week':
            if (daysDiff > 7) return false
            break
          case 'month':
            if (daysDiff > 30) return false
            break
        }
      }

      return true
    })
    .sort((a, b) => {
      // Sort filter
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'category':
          return getCategoryLabel(a.report_tag).localeCompare(getCategoryLabel(b.report_tag))
        case 'reporter':
          return (a.user_full_name || '').localeCompare(b.user_full_name || '')
        default:
          return 0
      }
    })

  const currentReports = filteredReports

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Material Design 3 Header */}
      <div className="bg-surface-container-low shadow-elevation-1 border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-on-primary" />
                </div>
                <div>
                  <h1 className="text-headline-small font-medium text-on-surface tracking-tight">
                    Error Reports Management
                  </h1>
                  <p className="text-body-medium text-on-surface-variant mt-0.5">
                    Monitor and resolve user-reported content issues
                  </p>
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
                
                {/* Functional Filter Button */}
                <Popover open={showFilters} onOpenChange={setShowFilters}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-9 px-3 border-slate-200 hover:bg-slate-50 ${
                        (filters.category !== 'all' || filters.dateRange !== 'all' || filters.sortBy !== 'newest') 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : ''
                      }`}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                      {((filters.category !== 'all' || filters.dateRange !== 'all' || filters.sortBy !== 'newest')) && (
                        <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                          {(filters.category !== 'all' ? 1 : 0) + (filters.dateRange !== 'all' ? 1 : 0) + (filters.sortBy !== 'newest' ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900">Filter Reports</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFilters({ category: 'all', dateRange: 'all', sortBy: 'newest' })
                            setShowFilters(false)
                          }}
                          className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Clear All
                        </Button>
                      </div>
                      
                      {/* Category Filter */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-700">Category</label>
                        <Select
                          value={filters.category}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {REPORT_OPTIONS.map((option) => (
                              <SelectItem key={option.tag} value={option.tag}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date Range Filter */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-700">Date Range</label>
                        <Select
                          value={filters.dateRange}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="All Time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">Last 30 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sort Filter */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-700">Sort By</label>
                        <Select
                          value={filters.sortBy}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                            <SelectItem value="reporter">Reporter Name</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Active Filters Summary */}
                      {((filters.category !== 'all' || filters.dateRange !== 'all' || filters.sortBy !== 'newest')) && (
                        <div className="pt-2 border-t border-slate-200">
                          <div className="flex flex-wrap gap-1">
                            {filters.category !== 'all' && (
                              <Badge variant="secondary" className="text-xs">
                                {getCategoryLabel(filters.category)}
                                <X 
                                  className="w-3 h-3 ml-1 cursor-pointer" 
                                  onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
                                />
                              </Badge>
                            )}
                            {filters.dateRange !== 'all' && (
                              <Badge variant="secondary" className="text-xs">
                                {filters.dateRange === 'today' ? 'Today' : 
                                 filters.dateRange === 'week' ? 'Last 7 Days' : 
                                 filters.dateRange === 'month' ? 'Last 30 Days' : filters.dateRange}
                                <X 
                                  className="w-3 h-3 ml-1 cursor-pointer" 
                                  onClick={() => setFilters(prev => ({ ...prev, dateRange: 'all' }))}
                                />
                              </Badge>
                            )}
                            {filters.sortBy !== 'newest' && (
                              <Badge variant="secondary" className="text-xs">
                                {filters.sortBy === 'oldest' ? 'Oldest First' :
                                 filters.sortBy === 'category' ? 'By Category' :
                                 filters.sortBy === 'reporter' ? 'By Reporter' : filters.sortBy}
                                <X 
                                  className="w-3 h-3 ml-1 cursor-pointer" 
                                  onClick={() => setFilters(prev => ({ ...prev, sortBy: 'newest' }))}
                                />
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
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
