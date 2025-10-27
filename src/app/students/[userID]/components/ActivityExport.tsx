'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { ActivityLogEntry } from '@/lib/types/analytics'

interface ActivityExportProps {
  activities: ActivityLogEntry[]
  studentName?: string
}

export function ActivityExport({ activities, studentName }: ActivityExportProps) {
  const handleExport = () => {
    try {
      // Create CSV content
      const headers = ['Date', 'Time', 'Activity Type', 'Title', 'Details', 'Score']
      const rows = activities.map((activity) => {
        const date = new Date(activity.created_at)
        const timeStr = date.toLocaleTimeString()
        const dateStr = date.toLocaleDateString()
        
        let activityType = activity.activity_type
        let title = ''
        let details = ''
        let score = ''
        
        const meta = activity.metadata as any
        
        switch (activity.activity_type) {
          case 'PRACTICE_SESSION_COMPLETED':
          case 'MOCK_TEST_COMPLETED':
            title = meta.test_name || activity.activity_type
            details = `${meta.total_correct || 0} correct, ${meta.total_incorrect || 0} incorrect, ${meta.total_skipped || 0} skipped`
            score = `${meta.score_percentage || 0}%`
            break
          case 'QUESTION_BOOKMARKED':
          case 'QUESTION_UNBOOKMARKED':
            title = meta.question_chapter || 'Unknown Chapter'
            details = activity.activity_type === 'QUESTION_BOOKMARKED' ? 'Bookmarked' : 'Unbookmarked'
            break
          case 'REVIEW_SESSION_COMPLETED':
            title = 'SRS Review Completed'
            details = `Rating: ${meta.performance_rating}/4`
            break
        }
        
        return [dateStr, timeStr, activityType, title, details, score]
      })
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${studentName || 'activities'}-timeline-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Activities exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export activities')
    }
  }

  if (activities.length === 0) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  )
}

