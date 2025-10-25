'use client'

import { useState } from 'react'
import { Download, FileText, Calendar, BarChart3, Users, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { format } from 'date-fns'

interface ReportConfig {
  name: string
  metrics: string[]
  dateRange: {
    from: Date
    to: Date
  }
  groupBy: 'day' | 'week' | 'month'
  format: 'pdf' | 'excel' | 'csv'
  includeCharts: boolean
  filters: {
    status?: string[]
    role?: string[]
    dateRange?: {
      from: Date
      to: Date
    }
  }
}

const AVAILABLE_METRICS = [
  { id: 'registrations', label: 'User Registrations', icon: Users },
  { id: 'approvals', label: 'Account Approvals', icon: Users },
  { id: 'activity', label: 'User Activity', icon: BarChart3 },
  { id: 'performance', label: 'Test Performance', icon: BarChart3 },
  { id: 'engagement', label: 'User Engagement', icon: BarChart3 }
]

const REPORT_TEMPLATES = [
  {
    id: 'weekly_summary',
    name: 'Weekly Summary',
    description: 'Overview of user activity for the past week',
    config: {
      metrics: ['registrations', 'approvals', 'activity'],
      groupBy: 'day' as const,
      format: 'pdf' as const,
      includeCharts: true
    }
  },
  {
    id: 'monthly_analytics',
    name: 'Monthly Analytics',
    description: 'Comprehensive monthly user analytics',
    config: {
      metrics: ['registrations', 'approvals', 'activity', 'performance', 'engagement'],
      groupBy: 'week' as const,
      format: 'excel' as const,
      includeCharts: true
    }
  },
  {
    id: 'user_export',
    name: 'User Export',
    description: 'Export user data for external analysis',
    config: {
      metrics: ['registrations', 'approvals'],
      groupBy: 'month' as const,
      format: 'csv' as const,
      includeCharts: false
    }
  }
]

export function ReportBuilder() {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    metrics: [],
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      to: new Date()
    },
    groupBy: 'day',
    format: 'pdf',
    includeCharts: true,
    filters: {}
  })

  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const handleTemplateSelect = (templateId: string) => {
    const template = REPORT_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setConfig(prev => ({
        ...prev,
        name: template.name,
        ...template.config
      }))
      setSelectedTemplate(templateId)
    }
  }

  const handleMetricToggle = (metricId: string) => {
    setConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metricId)
        ? prev.metrics.filter(id => id !== metricId)
        : [...prev.metrics, metricId]
    }))
  }

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true)
      
      const response = await fetch('/api/students/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${config.name || 'report'}_${format(new Date(), 'yyyy-MM-dd')}.${config.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setIsOpen(false)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Report Builder
          </DialogTitle>
          <DialogDescription>
            Create custom reports with analytics and user data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Name */}
          <div className="space-y-2">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              value={config.name}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter report name"
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">{template.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Metrics Selection */}
          <div className="space-y-2">
            <Label>Select Metrics</Label>
            <div className="grid grid-cols-1 gap-2">
              {AVAILABLE_METRICS.map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric.id}
                    checked={config.metrics.includes(metric.id)}
                    onCheckedChange={() => handleMetricToggle(metric.id)}
                  />
                  <Label htmlFor={metric.id} className="flex items-center gap-2 cursor-pointer">
                    <metric.icon className="h-4 w-4" />
                    {metric.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <DatePickerWithRange
              value={config.dateRange}
              onChange={(range) => setConfig(prev => ({ 
                ...prev, 
                dateRange: range || prev.dateRange 
              }))}
            />
          </div>

          {/* Group By */}
          <div className="space-y-2">
            <Label htmlFor="group-by">Group By</Label>
            <Select
              value={config.groupBy}
              onValueChange={(value: 'day' | 'week' | 'month') => 
                setConfig(prev => ({ ...prev, groupBy: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select
              value={config.format}
              onValueChange={(value: 'pdf' | 'excel' | 'csv') => 
                setConfig(prev => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-charts"
                checked={config.includeCharts}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, includeCharts: !!checked }))
                }
              />
              <Label htmlFor="include-charts">Include Charts</Label>
            </div>
          </div>

          {/* Selected Metrics Preview */}
          {config.metrics.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Metrics</Label>
              <div className="flex flex-wrap gap-2">
                {config.metrics.map((metricId) => {
                  const metric = AVAILABLE_METRICS.find(m => m.id === metricId)
                  return (
                    <Badge key={metricId} variant="secondary" className="flex items-center gap-1">
                      {metric && <metric.icon className="h-3 w-3" />}
                      {metric?.label}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating || config.metrics.length === 0}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
