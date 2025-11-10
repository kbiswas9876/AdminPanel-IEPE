'use client'

import type { Test } from '@/lib/supabase/admin'
import { Calendar, PlayCircle, StopCircle, CheckCircle2 } from 'lucide-react'
import { ResultStatus } from './ResultStatus'
import { useEffect, useState } from 'react'

interface TimelineProps {
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

const isPerpetualTest = (test: Test) => {
  return test.status === 'scheduled' && !test.end_time
}

export function Timeline({ test }: TimelineProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const calculateProgress = () => {
      if (test.status !== 'live' || !test.start_time || !test.end_time) {
        setProgress(test.status === 'completed' ? 100 : 0)
        return
      }

      const now = new Date().getTime()
      const startTime = new Date(test.start_time).getTime()
      const endTime = new Date(test.end_time).getTime()

      if (now < startTime) {
        setProgress(0)
      } else if (now > endTime) {
        setProgress(100)
      } else {
        const totalDuration = endTime - startTime
        const elapsed = now - startTime
        setProgress((elapsed / totalDuration) * 100)
      }
    }

    calculateProgress()
  }, [test.status, test.start_time, test.end_time])

  const getStatusColor = () => {
    if (test.dynamic_status === 'live') return 'bg-green-500'
    if (test.dynamic_status === 'scheduled') return 'bg-blue-500'
    return 'bg-gray-400'
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className={`w-6 h-6 rounded-full ${getStatusColor()} flex items-center justify-center`}>
            <PlayCircle className="h-4 w-4 text-white" />
          </div>
          <div className="w-0.5 flex-grow relative">
            <div className={`absolute top-0 left-0 h-full w-full ${getStatusColor()}`} style={{ height: `${progress}%` }}></div>
            <div className="absolute top-0 left-0 h-full w-full bg-gray-200"></div>
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-800">Start</p>
          <p className="text-sm text-gray-600">{formatDateTime(test.start_time)}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className={`w-6 h-6 rounded-full ${getStatusColor()} flex items-center justify-center`}>
            <StopCircle className="h-4 w-4 text-white" />
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-800">End</p>
          <p className={`text-sm ${isPerpetualTest(test) ? 'text-green-700' : 'text-gray-600'}`}>
            {isPerpetualTest(test) ? '∞ Perpetual' : formatDateTime(test.end_time)}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className={`w-6 h-6 rounded-full ${getStatusColor()} flex items-center justify-center`}>
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
        </div>
        <div>
          <ResultStatus test={test} />
        </div>
      </div>
    </div>
  )
}
