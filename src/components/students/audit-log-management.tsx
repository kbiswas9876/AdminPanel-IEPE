'use client'

import React, { useState, useEffect } from 'react'
import { FileText, Search, Filter, Download, Calendar, User, Activity, BarChart3, Clock, AlertTriangle, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { type AuditLog, type AuditLogFilter, type AuditLogStats, type AuditLogSearchParams } from '@/lib/supabase/admin'
import { 
  getAuditLogs, 
  getAuditLogStats, 
  getAuditLogFilters, 
  createAuditLogFilter, 
  updateAuditLogFilter, 
  deleteAuditLogFilter,
  exportAuditLogs
} from '@/lib/actions/audit-logs'
import { AUDIT_ACTIONS, RESOURCE_TYPES } from '@/lib/constants/audit-actions'

interface AuditLogManagementProps {
  selectedUsers: string[]
  onClose: () => void
}

export function AuditLogManagement({ selectedUsers, onClose }: AuditLogManagementProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filters, setFilters] = useState<AuditLogFilter[]>([])
  const [stats, setStats] = useState<AuditLogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('logs')
  
  // Search and filter states
  const [searchParams, setSearchParams] = useState<AuditLogSearchParams>({
    limit: 50,
    offset: 0
  })
  const [totalLogs, setTotalLogs] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filter management states
  const [createFilterDialogOpen, setCreateFilterDialogOpen] = useState(false)
  const [editFilterDialogOpen, setEditFilterDialogOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<AuditLogFilter | null>(null)
  
  // Export states
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json'>('csv')
  
  // Form states
  const [filterForm, setFilterForm] = useState({
    name: '',
    description: '',
    filters: {} as Record<string, any>
  })

  const actionTypes = Object.values(AUDIT_ACTIONS)
  const resourceTypes = Object.values(RESOURCE_TYPES)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs()
    } else if (activeTab === 'stats') {
      loadStats()
    }
  }, [activeTab, searchParams])

  const loadData = async () => {
    try {
      setLoading(true)
      const [filtersData] = await Promise.all([
        getAuditLogFilters()
      ])
      setFilters(filtersData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load audit log data')
    } finally {
      setLoading(false)
    }
  }

  const loadLogs = async () => {
    try {
      setLoading(true)
      const result = await getAuditLogs(searchParams)
      setLogs(result.logs)
      setTotalLogs(result.total)
    } catch (error) {
      console.error('Error loading audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await getAuditLogStats()
      setStats(statsData)
    } catch (error) {
      console.error('Error loading audit log stats:', error)
      toast.error('Failed to load audit log statistics')
    }
  }

  const handleSearch = (newParams: Partial<AuditLogSearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...newParams, offset: 0 }))
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    const offset = (page - 1) * (searchParams.limit || 50)
    setSearchParams(prev => ({ ...prev, offset }))
    setCurrentPage(page)
  }

  const handleCreateFilter = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await createAuditLogFilter(filterForm)
      if (result.success) {
        toast.success('Filter created successfully')
        setCreateFilterDialogOpen(false)
        setFilterForm({ name: '', description: '', filters: {} })
        loadData()
      } else {
        toast.error(result.error || 'Failed to create filter')
      }
    } catch (error) {
      console.error('Error creating filter:', error)
      toast.error('Failed to create filter')
    }
  }

  const handleUpdateFilter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFilter) return

    try {
      const result = await updateAuditLogFilter(selectedFilter.id, filterForm)
      if (result.success) {
        toast.success('Filter updated successfully')
        setEditFilterDialogOpen(false)
        setSelectedFilter(null)
        setFilterForm({ name: '', description: '', filters: {} })
        loadData()
      } else {
        toast.error(result.error || 'Failed to update filter')
      }
    } catch (error) {
      console.error('Error updating filter:', error)
      toast.error('Failed to update filter')
    }
  }

  const handleDeleteFilter = async (filterId: string) => {
    try {
      const result = await deleteAuditLogFilter(filterId)
      if (result.success) {
        toast.success('Filter deleted successfully')
        loadData()
      } else {
        toast.error(result.error || 'Failed to delete filter')
      }
    } catch (error) {
      console.error('Error deleting filter:', error)
      toast.error('Failed to delete filter')
    }
  }

  const handleApplyFilter = (filter: AuditLogFilter) => {
    setSearchParams(prev => ({ ...prev, ...filter.filters, offset: 0 }))
    setCurrentPage(1)
  }

  const handleExport = async () => {
    try {
      setLoading(true)
      const result = await exportAuditLogs(searchParams, exportFormat)
      if (result.success) {
        // Create and download file
        const blob = new Blob([result.data], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${exportFormat}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        toast.success('Audit logs exported successfully')
        setExportDialogOpen(false)
      } else {
        toast.error(result.error || 'Failed to export audit logs')
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error)
      toast.error('Failed to export audit logs')
    } finally {
      setLoading(false)
    }
  }

  const openEditFilterDialog = (filter: AuditLogFilter) => {
    setSelectedFilter(filter)
    setFilterForm({
      name: filter.name,
      description: filter.description || '',
      filters: filter.filters
    })
    setEditFilterDialogOpen(true)
  }

  const getActionBadgeColor = (actionType: string) => {
    if (actionType.includes('created') || actionType.includes('approved')) return 'bg-green-100 text-green-800'
    if (actionType.includes('updated') || actionType.includes('assigned')) return 'bg-blue-100 text-blue-800'
    if (actionType.includes('deleted') || actionType.includes('removed')) return 'bg-red-100 text-red-800'
    if (actionType.includes('suspended') || actionType.includes('revoked')) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Log Management</h2>
          <p className="text-gray-600">Track and monitor all admin actions and system changes</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Audit Logs</DialogTitle>
                <DialogDescription>
                  Export audit logs in your preferred format
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select value={exportFormat} onValueChange={(value: 'csv' | 'excel' | 'json') => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExport} disabled={loading}>
                  {loading ? 'Exporting...' : 'Export'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="filters">Saved Filters</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Search and Filter Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search-term">Search Term</Label>
                  <Input
                    id="search-term"
                    placeholder="Search logs..."
                    value={searchParams.search_term || ''}
                    onChange={(e) => handleSearch({ search_term: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="action-type">Action Type</Label>
                  <Select 
                    value={searchParams.action_types?.[0] || ''} 
                    onValueChange={(value) => handleSearch({ action_types: value && value !== 'all' ? [value] : undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All actions</SelectItem>
                      {actionTypes.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action.replace(/_/g, ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="resource-type">Resource Type</Label>
                  <Select 
                    value={searchParams.resource_types?.[0] || ''} 
                    onValueChange={(value) => handleSearch({ resource_types: value && value !== 'all' ? [value] : undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All resources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All resources</SelectItem>
                      {resourceTypes.map((resource) => (
                        <SelectItem key={resource} value={resource}>
                          {resource.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-range">Date Range</Label>
                  <Select 
                    value={searchParams.start_date || ''} 
                    onValueChange={(value) => {
                      const now = new Date()
                      let startDate = ''
                      if (value === '7days') {
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
                      } else if (value === '30days') {
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
                      } else if (value === '90days') {
                        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
                      }
                      handleSearch({ start_date: startDate || undefined })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Audit Logs ({totalLogs} total)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge className={getActionBadgeColor(log.action_type)}>
                            {log.action_type.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {log.admin_id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            {log.resource_type}
                            {log.resource_id && ` (${log.resource_id})`}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.description}
                        </TableCell>
                        <TableCell>
                          {log.ip_address || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {formatDate(log.created_at)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * (searchParams.limit || 50)) + 1} to {Math.min(currentPage * (searchParams.limit || 50), totalLogs)} of {totalLogs} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {Math.ceil(totalLogs / (searchParams.limit || 50))}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(totalLogs / (searchParams.limit || 50))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Saved Filters</h3>
            <Dialog open={createFilterDialogOpen} onOpenChange={setCreateFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Filter className="w-4 h-4 mr-2" />
                  Create Filter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Filter</DialogTitle>
                  <DialogDescription>
                    Create a saved filter for audit log queries
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateFilter} className="space-y-4">
                  <div>
                    <Label htmlFor="filter-name">Filter Name</Label>
                    <Input
                      id="filter-name"
                      value={filterForm.name}
                      onChange={(e) => setFilterForm({ ...filterForm, name: e.target.value })}
                      placeholder="Enter filter name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="filter-description">Description</Label>
                    <Textarea
                      id="filter-description"
                      value={filterForm.description}
                      onChange={(e) => setFilterForm({ ...filterForm, description: e.target.value })}
                      placeholder="Describe this filter"
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateFilterDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Filter</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filters.map((filter) => (
              <Card key={filter.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{filter.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApplyFilter(filter)}
                      >
                        Apply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditFilterDialog(filter)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFilter(filter.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{filter.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(filter.filters, null, 2)}</pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_actions || 0}</div>
                <p className="text-xs text-gray-600">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.unique_admins || 0}</div>
                <p className="text-xs text-gray-600">Unique users</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Most Common Action</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{stats?.most_common_action || '-'}</div>
                <p className="text-xs text-gray-600">{stats?.action_count || 0} times</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Most Active Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{stats?.most_active_admin || '-'}</div>
                <p className="text-xs text-gray-600">{stats?.admin_action_count || 0} actions</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Filter Dialog */}
      <Dialog open={editFilterDialogOpen} onOpenChange={setEditFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Filter</DialogTitle>
            <DialogDescription>
              Update filter information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateFilter} className="space-y-4">
            <div>
              <Label htmlFor="edit-filter-name">Filter Name</Label>
              <Input
                id="edit-filter-name"
                value={filterForm.name}
                onChange={(e) => setFilterForm({ ...filterForm, name: e.target.value })}
                placeholder="Enter filter name"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-filter-description">Description</Label>
              <Textarea
                id="edit-filter-description"
                value={filterForm.description}
                onChange={(e) => setFilterForm({ ...filterForm, description: e.target.value })}
                placeholder="Describe this filter"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditFilterDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Filter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
