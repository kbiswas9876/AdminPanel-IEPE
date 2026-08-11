'use client'

import type { Test } from '@/lib/supabase/admin'
import { Calendar, CheckCircle2, Zap, HelpCircle } from 'lucide-react'

interface ResultStatusProps {
  test: Test
}

const formatDateTime = (dateTime: string | null | undefined) => {
  if (!dateTime) return 'Not set'
  return new Date(dateTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function ResultStatus({ test }: ResultStatusProps) {
  const renderStatus = () => {
    switch (test.result_declaration_status) {
      case 'instant':
        return (
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Zap className="h-4 w-4" strokeWidth={1.5} />
            <span className="font-medium">Instantly on submission</span>
          </div>
        )
      case 'declared':
        return (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
            <span className="font-medium">Declared on {formatDateTime(test.result_release_at)}</span>
          </div>
        )
      case 'scheduled':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="h-4 w-4" strokeWidth={1.5} />
            <span className="font-medium">Scheduled for {formatDateTime(test.result_release_at)}</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <HelpCircle className="h-4 w-4" strokeWidth={1.5} />
            <span className="font-medium">Not configured</span>
          </div>
        )
    }
  }

  return (
    <div className="py-4">
      <p className="text-xs text-gray-500 mb-1">Results</p>
      {renderStatus()}
    </div>
  )
}
