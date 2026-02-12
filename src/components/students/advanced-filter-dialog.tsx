'use client'

import { useState } from 'react'
import { Save, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { StudentFilters } from '@/hooks/use-student-filters'

interface AdvancedFilterDialogProps {
  isOpen: boolean
  onClose: () => void
  filters: StudentFilters
  onFiltersChange: (filters: StudentFilters) => void
  onSavePreset: (name: string) => void
}

export function AdvancedFilterDialog({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onSavePreset
}: AdvancedFilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<StudentFilters>(filters)
  const [presetName, setPresetName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleReset = () => {
    setLocalFilters({
      search: '',
      status: [],
      role: [],
      dateRange: { from: null, to: null },
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
  }

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim())
      setPresetName('')
      setShowSaveDialog(false)
    }
  }

  const updateLocalFilter = <K extends keyof StudentFilters>(
    key: K,
    value: StudentFilters[K]
  ) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending Approval' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' }
  ]

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'admin', label: 'Administrator' }
  ]

  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'email', label: 'Email' },
    { value: 'created_at', label: 'Registration Date' },
    { value: 'updated_at', label: 'Last Updated' }
  ]

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
            </DialogTitle>
            <DialogDescription>
              Set up detailed filters to find specific users. You can save these filters as presets for quick access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={localFilters.search}
                onChange={(e) => updateLocalFilter('search', e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-3">
              <Label>Status</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={localFilters.status.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateLocalFilter('status', [...localFilters.status, option.value])
                        } else {
                          updateLocalFilter('status', localFilters.status.filter(s => s !== option.value))
                        }
                      }}
                    />
                    <Label htmlFor={`status-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Filter */}
            <div className="space-y-3">
              <Label>Role</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roleOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${option.value}`}
                      checked={localFilters.role.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateLocalFilter('role', [...localFilters.role, option.value])
                        } else {
                          updateLocalFilter('role', localFilters.role.filter(r => r !== option.value))
                        }
                      }}
                    />
                    <Label htmlFor={`role-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <Label>Registration Date Range</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">From</Label>
                  <Input
                    type="date"
                    value={localFilters.dateRange.from ? localFilters.dateRange.from.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null
                      updateLocalFilter('dateRange', { 
                        ...localFilters.dateRange, 
                        from: date 
                      })
                    }}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">To</Label>
                  <Input
                    type="date"
                    value={localFilters.dateRange.to ? localFilters.dateRange.to.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null
                      updateLocalFilter('dateRange', { 
                        ...localFilters.dateRange, 
                        to: date 
                      })
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Sorting */}
            <div className="space-y-3">
              <Label>Sort By</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Field</Label>
                  <select
                    value={localFilters.sortBy}
                    onChange={(e) => updateLocalFilter('sortBy', e.target.value as 'name' | 'email' | 'created_at' | 'updated_at')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Order</Label>
                  <select
                    value={localFilters.sortOrder}
                    onChange={(e) => updateLocalFilter('sortOrder', e.target.value as 'asc' | 'desc')}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
                <Save className="h-4 w-4 mr-2" />
                Save Preset
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleApply}>
                Apply Filters
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Preset Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Give this filter combination a name so you can quickly apply it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
