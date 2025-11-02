'use client'

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Violation {
  id: number
  violation_type: string
  outcome: string
  device_type: string | null
  browser_name: string | null
  os_name: string | null
  user_agent_string: string | null
  created_at: string
}

interface ViolationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  testResultId: number | null
  studentName?: string
  testName?: string
}

/**
 * Get human-readable violation type name
 */
function getViolationTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    page_refresh_attempt: 'Page Refresh Attempt',
    fullscreen_exit: 'Fullscreen Exit',
    tab_switch_or_app_switch: 'Tab/App Switch',
    focus_loss: 'Window Focus Loss',
  }
  return typeMap[type] || type
}

/**
 * Get device context summary
 */
function getDeviceContextSummary(violation: Violation): string {
  const device = violation.device_type === 'desktop' 
    ? 'Desktop' 
    : violation.device_type?.charAt(0).toUpperCase() + violation.device_type?.slice(1) || 'Unknown'
  
  return `${device} - ${violation.browser_name || 'Unknown'} (${violation.os_name || 'Unknown'})`
}

/**
 * Format timestamp to readable date/time
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export default function ViolationDetailsModal({
  isOpen,
  onClose,
  testResultId,
  studentName,
  testName
}: ViolationDetailsModalProps) {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && testResultId) {
      fetchViolations()
    }
  }, [isOpen, testResultId])

  const fetchViolations = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/security-violations?testResultId=${testResultId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch violations')
      }

      setViolations(result.data || [])
    } catch (err) {
      console.error('Error fetching violations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load violations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                {/* Header */}
                <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-1" />
                      <div>
                        <Dialog.Title className="text-lg font-semibold text-red-900">
                          Security Violation Log
                        </Dialog.Title>
                        {studentName && (
                          <p className="text-sm text-red-700 mt-1">
                            Student: <span className="font-medium">{studentName}</span>
                          </p>
                        )}
                        {testName && (
                          <p className="text-sm text-red-700">
                            Test: <span className="font-medium">{testName}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-md text-red-400 hover:text-red-500 focus:outline-none"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-96 overflow-y-auto">
                  {loading && (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      <p className="ml-3 text-gray-600">Loading violations...</p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800">{error}</p>
                    </div>
                  )}

                  {!loading && !error && violations.length === 0 && (
                    <div className="text-center py-8">
                      <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No security violations recorded for this test attempt.</p>
                    </div>
                  )}

                  {!loading && !error && violations.length > 0 && (
                    <div className="space-y-3">
                      {violations.map((violation) => (
                        <div
                          key={violation.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {getViolationTypeName(violation.violation_type)}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatTimestamp(violation.created_at)}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                violation.outcome === 'submitted'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {violation.outcome === 'submitted' ? 'Test Submitted' : 'Cancelled'}
                            </span>
                          </div>

                          <div className="bg-gray-50 rounded-md p-3 mt-3">
                            <h5 className="text-xs font-semibold text-gray-700 mb-2">Device Context</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Device:</span>
                                <span className="ml-2 text-gray-900">{violation.device_type || 'Unknown'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Browser:</span>
                                <span className="ml-2 text-gray-900">{violation.browser_name || 'Unknown'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">OS:</span>
                                <span className="ml-2 text-gray-900">{violation.os_name || 'Unknown'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Summary:</span>
                                <span className="ml-2 text-gray-900 font-medium">
                                  {getDeviceContextSummary(violation)}
                                </span>
                              </div>
                            </div>
                            
                            {violation.user_agent_string && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <span className="text-xs text-gray-500">User Agent:</span>
                                <p className="text-xs text-gray-700 mt-1 break-all font-mono">
                                  {violation.user_agent_string}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {violations.length} violation{violations.length !== 1 ? 's' : ''} recorded
                    </p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

