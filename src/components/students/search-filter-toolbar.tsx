'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, X, Save, ChevronDown, SortAsc, SortDesc } from 'lucide-react'
import { useDebouncedSearch } from '@/hooks/use-performance-monitor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
// Removed unused calendar and popover imports
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useStudentFilters, type StudentFilters } from '@/hooks/use-student-filters'
import type { UserProfile } from '@/lib/supabase/admin'

interface SearchFilterToolbarProps {
  users: UserProfile[]
  onFiltersChange: (filteredUsers: UserProfile[]) => void
}

export function SearchFilterToolbar({ users, onFiltersChange }: SearchFilterToolbarProps) {
  const {
    filters,
    filteredUsers,
    presets,
    isAdvancedOpen,
    setIsAdvancedOpen,
    updateFilter,
    clearFilters,
    savePreset,
    loadPreset,
    deletePreset,
    filterSummary,
    hasActiveFilters
  } = useStudentFilters(users)

  const [presetName, setPresetName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Notify parent of filtered results
  React.useEffect(() => {
    onFiltersChange(filteredUsers)
  }, [filteredUsers, onFiltersChange])

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim())
      setPresetName('')
      setShowSaveDialog(false)
    }
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' }
  ]

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'admin', label: 'Admin' }
  ]

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'created_at', label: 'Registration Date' },
    { value: 'updated_at', label: 'Last Updated' }
  ]

  return (
    <div className="space-y-4">
      {/* Main Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 flex-wrap">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Status
                {filters.status.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.status.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statusOptions.map((option) => (
                <DropdownMenuItem key={option.value} onSelect={(e) => e.preventDefault()}>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={filters.status.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter('status', [...filters.status, option.value])
                        } else {
                          updateFilter('status', filters.status.filter(s => s !== option.value))
                        }
                      }}
                    />
                    <Label htmlFor={`status-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Role Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Role
                {filters.role.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {filters.role.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {roleOptions.map((option) => (
                <DropdownMenuItem key={option.value} onSelect={(e) => e.preventDefault()}>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${option.value}`}
                      checked={filters.role.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter('role', [...filters.role, option.value])
                        } else {
                          updateFilter('role', filters.role.filter(r => r !== option.value))
                        }
                      }}
                    />
                    <Label htmlFor={`role-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Advanced Filters */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced
            <ChevronDown className={cn("h-4 w-4 ml-2 transition-transform", isAdvancedOpen && "rotate-180")} />
          </Button>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => updateFilter('sortBy', option.value as any)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Presets */}
          {presets.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Presets
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Saved Filters</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {presets.map((preset) => (
                  <DropdownMenuItem key={preset.id} onSelect={() => loadPreset(preset)}>
                    <div className="flex items-center justify-between w-full">
                      <span>{preset.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePreset(preset.id)
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Save Current Filters */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            disabled={!hasActiveFilters}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isAdvancedOpen && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Registration Date Range</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="From date"
                  value={filters.dateRange.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null
                    updateFilter('dateRange', { ...filters.dateRange, from: date })
                  }}
                  className="flex-1"
                />
                <Input
                  type="date"
                  placeholder="To date"
                  value={filters.dateRange.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null
                    updateFilter('dateRange', { ...filters.dateRange, to: date })
                  }}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filterSummary.map((filter, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {filter}
            </Badge>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Save Preset Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Save Filter Preset</h3>
            <Input
              placeholder="Enter preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
