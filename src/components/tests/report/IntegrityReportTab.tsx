'use client'

import { useState, useEffect, useMemo, Fragment } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, AlertTriangle, Shield, X, ChevronDown, ChevronUp, Monitor, Laptop, Tablet, Smartphone } from 'lucide-react'
import { getTestViolationLog } from '@/lib/actions/test-reports'
import type { ViolationLogEntry, ViolationSummary } from '@/lib/actions/test-reports'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface IntegrityReportTabProps {
  testId: number
}

const VIOLATION_TYPES = [
  'FULLSCREEN_EXIT',
  'TAB_SWITCH',
  'REFRESH_ATTEMPT',
  'BACK_BUTTON_VIOLATION',
  'BROWSER_CLOSE_VIOLATION',
  'VISIBILITY_CHANGE',
  'WINDOW_BLUR',
  'REFRESH_ATTEMPT_CTRL_R',
  'REFRESH_ATTEMPT_F5'
]

export function IntegrityReportTab({ testId }: IntegrityReportTabProps) {
  const [violations, setViolations] = useState<ViolationLogEntry[]>([])
  const [summary, setSummary] = useState<ViolationSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [violationTypeFilter, setViolationTypeFilter] = useState<string>('all')
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const limit = 50

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setLoading(true)
        setError(null)

        const filters: {
          studentSearch?: string
          violationType?: string
          outcome?: 'submitted' | 'cancelled'
        } = {}

        if (violationTypeFilter !== 'all') {
          filters.violationType = violationTypeFilter
        }

        if (outcomeFilter !== 'all') {
          filters.outcome = outcomeFilter as 'submitted' | 'cancelled'
        }

        if (searchTerm) {
          filters.studentSearch = searchTerm
        }

        const result = await getTestViolationLog(testId, filters, { page, limit })

        setViolations(result.violations)
        setSummary(result.summary)
        setTotalCount(result.totalCount)
      } catch (err) {
        console.error('Error fetching violations:', err)
        setError('Failed to load violation data')
      } finally {
        setLoading(false)
      }
    }

    fetchViolations()
  }, [testId, page, violationTypeFilter, outcomeFilter, searchTerm])

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatViolationType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  const getDeviceIcon = (deviceType: string | null) => {
    if (!deviceType) return <Monitor className="h-4 w-4 text-slate-400" />
    
    const type = deviceType.toLowerCase()
    if (type.includes('desktop')) return <Monitor className="h-4 w-4 text-slate-600" />
    if (type.includes('tablet')) return <Tablet className="h-4 w-4 text-slate-600" />
    if (type.includes('mobile')) return <Smartphone className="h-4 w-4 text-slate-600" />
    return <Monitor className="h-4 w-4 text-slate-400" />
  }

  const getOutcomeBadge = (outcome: string) => {
    if (outcome === 'submitted') {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
          Submitted
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
        Cancelled
      </Badge>
    )
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total Violations</span>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{summary.totalViolations}</div>
          </Card>

          <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Most Common</span>
              <Shield className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {summary.mostCommonViolation 
                ? formatViolationType(summary.mostCommonViolation)
                : 'N/A'}
            </div>
          </Card>

          <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Students Flagged</span>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{summary.studentsWithViolations}</div>
          </Card>

          <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Outcome</span>
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-sm text-slate-600">
              <span className="text-red-600 font-semibold">{summary.submittedCount}</span> Submitted /{' '}
              <span className="text-green-600 font-semibold">{summary.cancelledCount}</span> Cancelled
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by student name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1) // Reset to first page on search
              }}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select
              value={violationTypeFilter}
              onValueChange={(value) => {
                setViolationTypeFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Violation Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Violations</SelectItem>
                {VIOLATION_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {formatViolationType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={outcomeFilter}
              onValueChange={(value) => {
                setOutcomeFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Violations Table */}
      <Card className="border-slate-200 bg-white/60 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Violation Log ({violations.length} of {totalCount} shown)
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Complete log of all security violations for this test
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
            <p className="text-sm text-slate-500 mt-4">Loading violations...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : violations.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {totalCount === 0
                ? 'No violations recorded for this test'
                : 'No violations match your filters'}
            </p>
            {(searchTerm || violationTypeFilter !== 'all' || outcomeFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setViolationTypeFilter('all')
                  setOutcomeFilter('all')
                  setPage(1)
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Violation Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Outcome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-[100px]">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {violations.map((violation) => {
                    const isExpanded = expandedRows.has(violation.id)
                    // Handle user_profiles - can be null, single object, or array
                    const profile = violation.user_profiles
                      ? (Array.isArray(violation.user_profiles)
                          ? violation.user_profiles[0]
                          : violation.user_profiles)
                      : null

                    return (
                      <Fragment key={violation.id}>
                        <tr
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {profile?.full_name || 'Unknown Student'}
                              </div>
                              <div className="text-xs text-slate-500">
                                {profile?.email || 'No email'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                              {formatViolationType(violation.violation_type)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">
                              {formatTimestamp(violation.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getOutcomeBadge(violation.outcome)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(violation.device_type)}
                              <span className="text-sm text-slate-600">
                                {violation.browser_name || 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(violation.id)}
                              className="h-8 gap-1.5"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Show
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 bg-slate-50">
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-xs font-medium text-slate-500 mb-1">Device Type</p>
                                    <p className="text-sm text-slate-900">{violation.device_type || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-slate-500 mb-1">Browser</p>
                                    <p className="text-sm text-slate-900">{violation.browser_name || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-slate-500 mb-1">OS</p>
                                    <p className="text-sm text-slate-900">{violation.os_name || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-slate-500 mb-1">Test Result ID</p>
                                    <p className="text-sm text-slate-900">{violation.test_result_id || 'N/A'}</p>
                                  </div>
                                </div>
                                {violation.user_agent_string && (
                                  <div>
                                    <p className="text-xs font-medium text-slate-500 mb-1">User Agent</p>
                                    <p className="text-xs text-slate-600 font-mono break-all">
                                      {violation.user_agent_string}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

