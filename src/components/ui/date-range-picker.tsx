'use client'

import { useState } from 'react'
import { Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface DateRange {
  from: Date
  to: Date
}

interface DatePickerWithRangeProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
}

export function DatePickerWithRange({ 
  value, 
  onChange, 
  className 
}: DatePickerWithRangeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempRange, setTempRange] = useState<DateRange | undefined>(value)

  const handleApply = () => {
    if (tempRange) {
      onChange?.(tempRange)
    }
    setIsOpen(false)
  }

  const handleClear = () => {
    setTempRange(undefined)
    onChange?.(undefined)
    setIsOpen(false)
  }

  const handleFromChange = (dateString: string) => {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      setTempRange(prev => ({
        from: date,
        to: prev?.to || date
      }))
    }
  }

  const handleToChange = (dateString: string) => {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      setTempRange(prev => ({
        from: prev?.from || date,
        to: date
      }))
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {value ? (
            <>
              {format(value.from, "MMM dd, yyyy")} - {format(value.to, "MMM dd, yyyy")}
            </>
          ) : (
            "Pick a date range"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from-date">From</Label>
            <Input
              id="from-date"
              type="date"
              value={tempRange?.from ? format(tempRange.from, 'yyyy-MM-dd') : ''}
              onChange={(e) => handleFromChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to-date">To</Label>
            <Input
              id="to-date"
              type="date"
              value={tempRange?.to ? format(tempRange.to, 'yyyy-MM-dd') : ''}
              onChange={(e) => handleToChange(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
            <Button size="sm" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
