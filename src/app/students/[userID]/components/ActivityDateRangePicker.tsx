'use client'

import { useState } from 'react'
import { Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { addDays, format, startOfWeek, startOfMonth, startOfYear, subDays } from 'date-fns'

interface ActivityDateRangePickerProps {
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void
}

export function ActivityDateRangePicker({ onDateRangeChange }: ActivityDateRangePickerProps) {
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null })
  const [open, setOpen] = useState(false)

  const quickPresets = [
    { label: 'Today', range: { start: new Date(), end: new Date() } },
    { label: 'Yesterday', range: { start: addDays(new Date(), -1), end: addDays(new Date(), -1) } },
    { label: 'This Week', range: { start: startOfWeek(new Date()), end: new Date() } },
    { label: 'Last Week', range: { start: startOfWeek(subDays(new Date(), 7)), end: startOfWeek(new Date()) } },
    { label: 'This Month', range: { start: startOfMonth(new Date()), end: new Date() } },
    { label: 'All Time', range: { start: null, end: null } },
  ]

  const handlePreset = (range: { start: Date | null; end: Date | null }) => {
    setSelectedRange(range)
    onDateRangeChange(range)
    setOpen(false)
  }

  const displayText = selectedRange.start && selectedRange.end
    ? `${format(selectedRange.start, 'MMM d')} - ${format(selectedRange.end, 'MMM d')}`
    : 'Select date range'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 gap-2 px-4">
          <Calendar className="h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quick Select</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickPresets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs"
                  onClick={() => handlePreset(preset.range)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          
          {selectedRange.start && selectedRange.end && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Badge variant="secondary" className="gap-1 text-xs">
                {format(selectedRange.start, 'MMM d')} - {format(selectedRange.end, 'MMM d')}
                <button
                  onClick={() => handlePreset({ start: null, end: null })}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

