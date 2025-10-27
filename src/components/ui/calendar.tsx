'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { format, getDaysInMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isToday, addMonths, subMonths, isSameMonth } from 'date-fns'

export interface CalendarProps {
  className?: string
  selected?: Date | Date[]
  onSelect?: (date: Date) => void
  mode?: 'single' | 'range'
  showOutsideDays?: boolean
}

export function Calendar({ className, selected, onSelect, showOutsideDays = true }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const days = []
  let day = startDate
  
  while (day <= endDate) {
    days.push(new Date(day))
    day = new Date(day.getTime() + 86400000)
  }

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const isSelected = (day: Date) => {
    if (!selected) return false
    if (Array.isArray(selected)) {
      return selected.some(date => isSameDay(date, day))
    }
    return isSameDay(selected, day)
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className={cn('p-3', className)}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={previousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day, i) => (
          <div key={i} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const dayIsSelected = isSelected(day)
          const dayIsToday = isToday(day)

          if (!isCurrentMonth && !showOutsideDays) {
            return <div key={i} className="h-9" />
          }

          return (
            <button
              key={i}
              onClick={() => onSelect?.(day)}
              className={cn(
                'h-9 w-9 rounded-md text-sm transition-colors',
                !isCurrentMonth && 'text-gray-400',
                isCurrentMonth && 'text-gray-700',
                dayIsSelected && 'bg-blue-500 text-white hover:bg-blue-600',
                !dayIsSelected && 'hover:bg-gray-100',
                dayIsToday && !dayIsSelected && 'bg-blue-100'
              )}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

