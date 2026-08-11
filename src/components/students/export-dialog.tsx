'use client'

import { useState } from 'react'
import { Download, FileText, Table } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { exportToCSV, exportToExcel } from '@/lib/utils/export-helpers'
import type { UserProfile } from '@/lib/supabase/admin'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  users: UserProfile[]
  allUsers: UserProfile[]
}

const exportColumns = [
  { key: 'full_name', label: 'Full Name', default: true },
  { key: 'email', label: 'Email', default: true },
  { key: 'role', label: 'Role', default: true },
  { key: 'status', label: 'Status', default: true },
  { key: 'created_at', label: 'Registration Date', default: true },
  { key: 'updated_at', label: 'Last Updated', default: false },
  { key: 'id', label: 'User ID', default: false }
]

export function ExportDialog({ isOpen, onClose, users, allUsers }: ExportDialogProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    exportColumns.filter(col => col.default).map(col => col.key)
  )
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv')
  const [isExporting, setIsExporting] = useState(false)
  const [exportAll, setExportAll] = useState(false)

  const handleColumnToggle = (columnKey: string) => {
    if (selectedColumns.includes(columnKey)) {
      setSelectedColumns(selectedColumns.filter(key => key !== columnKey))
    } else {
      setSelectedColumns([...selectedColumns, columnKey])
    }
  }

  const handleSelectAllColumns = () => {
    if (selectedColumns.length === exportColumns.length) {
      setSelectedColumns([])
    } else {
      setSelectedColumns(exportColumns.map(col => col.key))
    }
  }

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      alert('Please select at least one column to export.')
      return
    }

    setIsExporting(true)
    
    try {
      const dataToExport = exportAll ? allUsers : users
      const filteredData = dataToExport.map(user => {
        const row: Record<string, string> = {}
        selectedColumns.forEach(columnKey => {
          switch (columnKey) {
            case 'created_at':
              row[columnKey] = new Date(user.created_at).toLocaleString()
              break
            case 'updated_at':
              row[columnKey] = user.updated_at ? new Date(user.updated_at).toLocaleString() : 'Never'
              break
            case 'active_flags':
              row[columnKey] = Array.isArray(user.active_flags) ? user.active_flags.join(', ') : ''
              break
            default:
              row[columnKey] = typeof user[columnKey as keyof UserProfile] === 'object' 
                ? JSON.stringify(user[columnKey as keyof UserProfile])
                : (user[columnKey as keyof UserProfile]?.toString() || '')
          }
        })
        return row
      })

      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `users-export-${timestamp}`

      if (exportFormat === 'csv') {
        await exportToCSV(filteredData, `${filename}.csv`)
      } else {
        await exportToExcel(filteredData, `${filename}.xlsx`)
      }

      onClose()
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    setSelectedColumns(exportColumns.filter(col => col.default).map(col => col.key))
    setExportFormat('csv')
    setExportAll(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Users
          </DialogTitle>
          <DialogDescription>
            Export {exportAll ? allUsers.length : users.length} users to {exportFormat.toUpperCase()} format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Scope */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Scope</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-selected"
                  checked={!exportAll}
                  onCheckedChange={(checked) => setExportAll(!checked)}
                />
                <Label htmlFor="export-selected" className="text-sm">
                  Export selected users only ({users.length} users)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-all"
                  checked={exportAll}
                  onCheckedChange={(checked) => setExportAll(!!checked)}
                />
                <Label htmlFor="export-all" className="text-sm">
                  Export all users ({allUsers.length} users)
                </Label>
              </div>
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={exportFormat === 'csv' ? 'default' : 'outline'}
                onClick={() => setExportFormat('csv')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                CSV
              </Button>
              <Button
                variant={exportFormat === 'excel' ? 'default' : 'outline'}
                onClick={() => setExportFormat('excel')}
                className="flex items-center gap-2"
              >
                <Table className="h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>

          {/* Column Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Columns to Export</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllColumns}
                className="text-xs"
              >
                {selectedColumns.length === exportColumns.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
              {exportColumns.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`column-${column.key}`}
                    checked={selectedColumns.includes(column.key)}
                    onCheckedChange={() => handleColumnToggle(column.key)}
                  />
                  <Label htmlFor={`column-${column.key}`} className="text-sm">
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Preview</Label>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p><strong>File:</strong> users-export-{new Date().toISOString().split('T')[0]}.{exportFormat}</p>
              <p><strong>Rows:</strong> {exportAll ? allUsers.length : users.length}</p>
              <p><strong>Columns:</strong> {selectedColumns.length} selected</p>
              <p><strong>Format:</strong> {exportFormat.toUpperCase()}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || selectedColumns.length === 0}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export {exportAll ? allUsers.length : users.length} Users
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
