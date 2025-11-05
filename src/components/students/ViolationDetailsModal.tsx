'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Shield, Monitor, Laptop, Tablet, Smartphone, Clock, X } from 'lucide-react'
import { getViolationsForAttempt } from '@/lib/actions/test-reports'
import type { ViolationLogEntry } from '@/lib/actions/test-reports'

interface ViolationDetailsModalProps {
  resultId: number | null
  isOpen: boolean
  onClose: () => void
}

export function ViolationDetailsModal({ resultId, isOpen, onClose }: ViolationDetailsModalProps) {
  const [violations, setViolations] = useState<ViolationLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && resultId) {
      fetchViolations()
    } else {
      setViolations([])
      setError(null)
    }
  }, [isOpen, resultId])

  const fetchViolations = async () => {
    if (!resultId) return

    setLoading(true)
    setError(null)

    try {
      const data = await getViolationsForAttempt(resultId)
      setViolations(data)
    } catch (err) {
      console.error('Error fetching violations:', err)
      setError('Failed to load violation data')
    } finally {
      setLoading(false)
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Security Violations Timeline
          </DialogTitle>
          <DialogDescription>
            Chronological timeline of all violations detected during this test attempt
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : violations.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600">No violations recorded for this attempt</p>
            <p className="text-xs text-slate-500 mt-1">The student completed the test without any security violations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Card */}
            <Card className="p-4 bg-slate-50 border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Total Violations: <span className="text-red-600 font-semibold">{violations.length}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {violations.filter(v => v.outcome === 'submitted').length} resulted in auto-submission
                  </p>
                </div>
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
            </Card>

            {/* Violations Timeline */}
            <div className="space-y-3">
              {violations.map((violation, index) => (
                <Card
                  key={violation.id}
                  className="p-4 border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Timeline Number */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center">
                      <span className="text-xs font-semibold text-red-700">{index + 1}</span>
                    </div>

                    {/* Violation Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                              {formatViolationType(violation.violation_type)}
                            </Badge>
                            {getOutcomeBadge(violation.outcome)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(violation.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Device Information */}
                      {(violation.device_type || violation.browser_name || violation.os_name) && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                            {violation.device_type && (
                              <div className="flex items-center gap-2">
                                {getDeviceIcon(violation.device_type)}
                                <span className="text-slate-600">
                                  <span className="font-medium">Device:</span> {violation.device_type}
                                </span>
                              </div>
                            )}
                            {violation.browser_name && (
                              <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-600">
                                  <span className="font-medium">Browser:</span> {violation.browser_name}
                                </span>
                              </div>
                            )}
                            {violation.os_name && (
                              <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-600">
                                  <span className="font-medium">OS:</span> {violation.os_name}
                                </span>
                              </div>
                            )}
                          </div>
                          {violation.user_agent_string && (
                            <div className="mt-2 pt-2 border-t border-slate-100">
                              <p className="text-xs font-medium text-slate-500 mb-1">User Agent:</p>
                              <p className="text-xs text-slate-600 font-mono break-all">
                                {violation.user_agent_string}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

