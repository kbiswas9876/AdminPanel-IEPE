'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportStudentData } from '@/lib/actions/studentDataExport'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth'

interface ExportDataButtonProps {
  userId: string
}

export function ExportDataButton({ userId }: ExportDataButtonProps) {
  const [exporting, setExporting] = useState(false)
  const { user: currentAdmin } = useAuth()

  const handleExport = async (format: 'json' | 'csv') => {
    if (!currentAdmin?.id) {
      toast.error('Admin authentication required')
      return
    }

    setExporting(true)
    try {
      const result = await exportStudentData(userId, format, currentAdmin.id)
      
      if (result.success && result.data && result.fileName) {
        // Trigger download
        const blob = new Blob([result.data], { 
          type: format === 'json' ? 'application/json' : 'text/csv' 
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = result.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        toast.success(`Data exported successfully as ${format.toUpperCase()}`)
      } else {
        toast.error(result.message || 'Failed to export data')
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting}>
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

