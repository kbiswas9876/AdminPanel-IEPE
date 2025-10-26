'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Download, 
  FileText, 
  Table, 
  Calendar,
  Filter,
  CheckSquare
} from 'lucide-react'
import { toast } from 'sonner'

interface ExportFunctionalityProps {
  data: any[]
  columns: { key: string; label: string; exportable?: boolean }[]
  filename?: string
  onExport?: (format: string, selectedColumns: string[], filters?: any) => void
}

export function ExportFunctionality({ 
  data, 
  columns, 
  filename = 'student-data',
  onExport 
}: ExportFunctionalityProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('csv')
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [includeFilters, setIncludeFilters] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportableColumns = columns.filter(col => col.exportable !== false)

  const handleColumnToggle = (columnKey: string, checked: boolean) => {
    if (checked) {
      setSelectedColumns(prev => [...prev, columnKey])
    } else {
      setSelectedColumns(prev => prev.filter(key => key !== columnKey))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedColumns(exportableColumns.map(col => col.key))
    } else {
      setSelectedColumns([])
    }
  }

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      toast.error('Please select at least one column to export')
      return
    }

    setIsExporting(true)
    try {
      if (onExport) {
        await onExport(selectedFormat, selectedColumns, includeFilters)
      } else {
        await defaultExport(selectedFormat, selectedColumns)
      }
      toast.success('Export completed successfully')
      setIsOpen(false)
    } catch (error) {
      toast.error('Export failed. Please try again.')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const defaultExport = async (format: string, selectedColumns: string[]) => {
    const filteredData = data.map(row => {
      const filteredRow: any = {}
      selectedColumns.forEach(key => {
        filteredRow[key] = row[key]
      })
      return filteredRow
    })

    if (format === 'csv') {
      exportToCSV(filteredData, selectedColumns)
    } else if (format === 'excel') {
      exportToExcel(filteredData, selectedColumns)
    }
  }

  const exportToCSV = (data: any[], columns: string[]) => {
    const headers = columns.map(key => key)
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        columns.map(key => {
          const value = row[key]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value || ''
        }).join(',')
      )
    ].join('\n')

    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  }

  const exportToExcel = (data: any[], columns: string[]) => {
    // For Excel export, we'll create a simple HTML table that Excel can open
    const headers = columns.map(key => key)
    
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => 
                `<tr>${columns.map(key => `<td>${row[key] || ''}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    downloadFile(htmlContent, `${filename}.xls`, 'application/vnd.ms-excel')
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const isAllSelected = selectedColumns.length === exportableColumns.length
  const isIndeterminate = selectedColumns.length > 0 && selectedColumns.length < exportableColumns.length

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-700"
      >
        <Download className="h-4 w-4 mr-2" />
        Export Data
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export Data</span>
            </DialogTitle>
            <DialogDescription>
              Choose the format and columns you want to export
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Export Format */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Export Format</Label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>CSV (Comma Separated Values)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center space-x-2">
                      <Table className="h-4 w-4" />
                      <span>Excel Spreadsheet</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Column Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Select Columns</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm">
                    Select All
                  </Label>
                </div>
              </div>
              
              <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                {exportableColumns.map((column) => (
                  <div key={column.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={column.key}
                      checked={selectedColumns.includes(column.key)}
                      onCheckedChange={(checked) => 
                        handleColumnToggle(column.key, checked as boolean)
                      }
                    />
                    <Label htmlFor={column.key} className="text-sm">
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Additional Options</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-filters"
                  checked={includeFilters}
                  onCheckedChange={(checked) => setIncludeFilters(checked === true)}
                />
                <Label htmlFor="include-filters" className="text-sm">
                  Include current filters in export
                </Label>
              </div>
            </div>

            {/* Export Summary */}
            <div className="bg-gray-50 rounded-md p-3">
              <div className="text-sm text-gray-600">
                <p><strong>Export Summary:</strong></p>
                <p>• Format: {selectedFormat.toUpperCase()}</p>
                <p>• Columns: {selectedColumns.length} of {exportableColumns.length}</p>
                <p>• Records: {data.length}</p>
                {includeFilters && <p>• Includes current filters</p>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting || selectedColumns.length === 0}
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Quick export buttons for common formats
export function QuickExportButtons({ 
  data, 
  columns, 
  filename 
}: {
  data: any[]
  columns: { key: string; label: string }[]
  filename?: string
}) {
  const handleQuickExport = (format: 'csv' | 'excel') => {
    const selectedColumns = columns.map(col => col.key)
    
    if (format === 'csv') {
      exportToCSV(data, selectedColumns, filename)
    } else {
      exportToExcel(data, selectedColumns, filename)
    }
    
    toast.success(`${format.toUpperCase()} export completed`)
  }

  const exportToCSV = (data: any[], columns: string[], filename = 'export') => {
    const headers = columns.map(key => key)
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        columns.map(key => {
          const value = row[key]
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value || ''
        }).join(',')
      )
    ].join('\n')

    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  }

  const exportToExcel = (data: any[], columns: string[], filename = 'export') => {
    const headers = columns.map(key => key)
    
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => 
                `<tr>${columns.map(key => `<td>${row[key] || ''}</td>`).join('')}</tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    downloadFile(htmlContent, `${filename}.xls`, 'application/vnd.ms-excel')
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickExport('csv')}
        className="text-green-600 hover:text-green-700"
      >
        <FileText className="h-4 w-4 mr-2" />
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickExport('excel')}
        className="text-blue-600 hover:text-blue-700"
      >
        <Table className="h-4 w-4 mr-2" />
        Excel
      </Button>
    </div>
  )
}
