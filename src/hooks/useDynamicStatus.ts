'use client'

import { useState, useEffect } from 'react'
import type { Test } from '@/lib/supabase/admin'

type TestWithDynamicStatus = Test & {
  dynamic_status?: 'draft' | 'scheduled' | 'live' | 'completed'
}

export function useDynamicStatus(initialTests: TestWithDynamicStatus[]) {
  const [tests, setTests] = useState(initialTests)

  useEffect(() => {
    const updateStatuses = () => {
      const now = new Date()
      const updatedTests = initialTests.map((test) => {
        let dynamic_status = test.status

        if (test.status === 'scheduled') {
          const startTime = new Date(test.start_time || '')
          const endTime = test.end_time ? new Date(test.end_time) : null

          if (startTime > now) {
            dynamic_status = 'scheduled'
          } else if (!endTime || endTime > now) {
            dynamic_status = 'live'
          } else {
            dynamic_status = 'completed'
          }
        }
        
        return { ...test, dynamic_status }
      })
      setTests(updatedTests)
    }

    updateStatuses()
  }, [initialTests])

  return tests
}
