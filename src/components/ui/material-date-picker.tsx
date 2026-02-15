'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

interface MaterialDatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  label?: string
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  error?: boolean
  helperText?: string
  disabled?: boolean
  showTime?: boolean
}

export function MaterialDatePicker({
  value,
  onChange,
  label = 'Select date',
  minDate,
  maxDate,
  placeholder,
  error = false,
  helperText,
  disabled = false,
  showTime = false,
}: MaterialDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState({ hours: 0, minutes: 0 })
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right' | 'center'>('left')
  const [timeInputValue, setTimeInputValue] = useState('')
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [timePickerPosition, setTimePickerPosition] = useState<'left' | 'right' | 'center'>('left')
  const [use24Hour, setUse24Hour] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeInputRef = useRef<HTMLInputElement>(null)
  const timePickerRef = useRef<HTMLDivElement>(null)

  // Initialize time from value if it exists
  useEffect(() => {
    if (value) {
      const hours = value.getHours()
      const minutes = value.getMinutes()
      setSelectedTime({ hours, minutes })
      setTimeInputValue(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Calculate dropdown position to avoid clipping
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const dropdownWidth = 320
      const viewportWidth = window.innerWidth
      const spaceRight = viewportWidth - containerRect.left
      const spaceLeft = containerRect.left

      // Add some padding to avoid edge clipping
      const padding = 16

      if (spaceRight < dropdownWidth + padding && spaceLeft > dropdownWidth + padding) {
        setDropdownPosition('right')
      } else if (spaceLeft < dropdownWidth + padding && spaceRight > dropdownWidth + padding) {
        setDropdownPosition('left')
      } else if (spaceLeft < dropdownWidth + padding && spaceRight < dropdownWidth + padding) {
        setDropdownPosition('center')
      } else {
        setDropdownPosition('left')
      }
    }
  }, [isOpen])

  // Helper functions
  const formatDate = (date: Date | null) => {
    if (!date) return ''
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    if (showTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
    }
    return date.toLocaleDateString('en-US', options)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    if (!value) return false
    return date.toDateString() === value.toDateString()
  }

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (showTime) {
      newDate.setHours(selectedTime.hours, selectedTime.minutes)
    }
    onChange(newDate)
    if (!showTime) {
      setIsOpen(false)
    }
  }

  const handleTimeChange = (type: 'hours' | 'minutes', value: number) => {
    const newTime = { ...selectedTime, [type]: value }
    setSelectedTime(newTime)
    
    // Update the time input value
    const timeString = `${newTime.hours.toString().padStart(2, '0')}:${newTime.minutes.toString().padStart(2, '0')}`
    setTimeInputValue(timeString)
    
    // Update the main date value if it exists
    if (value) {
      const newDate = new Date(value)
      newDate.setHours(newTime.hours, newTime.minutes)
      onChange(newDate)
    }
  }

  const handleTimeInputChange = (inputValue: string) => {
    setTimeInputValue(inputValue)
    
    // Parse the time input (format: HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/
    const match = inputValue.match(timeRegex)
    
    if (match) {
      const hours = parseInt(match[1])
      const minutes = parseInt(match[2])
      const newTime = { hours, minutes }
      setSelectedTime(newTime)
      
      // Update the main date value if it exists
      if (value) {
        const newDate = new Date(value)
        newDate.setHours(hours, minutes)
        onChange(newDate)
      }
    }
  }

  const handleTimeInputFocus = () => {
    setShowTimePicker(true)
    
    // Calculate time picker position to avoid clipping
    if (timeInputRef.current) {
      const inputRect = timeInputRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const timePickerWidth = 280 // Approximate width of time picker
      const spaceRight = viewportWidth - inputRect.left
      const spaceLeft = inputRect.left
      const padding = 16

      if (spaceRight < timePickerWidth + padding && spaceLeft > timePickerWidth + padding) {
        setTimePickerPosition('right')
      } else if (spaceLeft < timePickerWidth + padding && spaceRight > timePickerWidth + padding) {
        setTimePickerPosition('left')
      } else if (spaceLeft < timePickerWidth + padding && spaceRight < timePickerWidth + padding) {
        setTimePickerPosition('center')
      } else {
        setTimePickerPosition('left')
      }
    }
  }

  const handleTimeInputBlur = () => {
    // Delay hiding the time picker to allow clicking on it
    setTimeout(() => {
      setShowTimePicker(false)
    }, 200)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const generateTimeOptions = (type: 'hours' | 'minutes') => {
    const options = []
    if (type === 'hours') {
      if (use24Hour) {
        for (let i = 0; i <= 23; i++) {
          options.push(i.toString().padStart(2, '0'))
        }
      } else {
        for (let i = 1; i <= 12; i++) {
          options.push(i.toString().padStart(2, '0'))
        }
      }
    } else {
      for (let i = 0; i <= 59; i++) {
        options.push(i.toString().padStart(2, '0'))
      }
    }
    return options
  }

  const getDisplayHours = () => {
    if (use24Hour) {
      return selectedTime.hours
    } else {
      return selectedTime.hours === 0 ? 12 : selectedTime.hours > 12 ? selectedTime.hours - 12 : selectedTime.hours
    }
  }

  const getAmPm = () => {
    return selectedTime.hours < 12 ? 'AM' : 'PM'
  }

  return (
    <div className="material-date-picker-wrapper" ref={containerRef}>
      <style jsx global>{`
        .material-date-picker-wrapper {
          width: 100%;
          position: relative;
        }

        .material-date-picker-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          transition: all 0.2s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .material-date-picker-input:hover {
          border-color: #bdbdbd;
        }

        .material-date-picker-input:focus {
          border-color: #26a69a;
          box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.1);
          outline: none;
        }

        .material-date-picker-input.error {
          border-color: #f44336;
        }

        .material-date-picker-input.error:focus {
          border-color: #f44336;
          box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
        }

        .material-date-picker-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 9999;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          margin-top: 4px;
          width: 320px;
          min-width: 320px;
        }

        /* Responsive positioning for small containers */
        @media (max-width: 400px) {
          .material-date-picker-dropdown {
            left: 50% !important;
            right: auto !important;
            transform: translateX(-50%) !important;
            width: 300px;
            min-width: 300px;
          }
        }

        /* Ensure calendar fits in very small modals */
        @media (max-width: 350px) {
          .material-date-picker-dropdown {
            width: 280px;
            min-width: 280px;
          }
          
          .material-date-picker-day {
            font-size: 12px;
          }
        }

        /* Smart positioning to avoid clipping */
        .material-date-picker-dropdown.position-left {
          left: 0;
          right: auto;
        }

        .material-date-picker-dropdown.position-right {
          left: auto;
          right: 0;
        }

        .material-date-picker-dropdown.position-center {
          left: 50%;
          right: auto;
          transform: translateX(-50%);
        }

        .material-date-picker-header {
          background: #26a69a;
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .material-date-picker-month-year {
          font-size: 18px;
          font-weight: 600;
        }

        .material-date-picker-nav {
          display: flex;
          gap: 8px;
        }

        .material-date-picker-nav-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
        }

        .material-date-picker-nav-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .material-date-picker-calendar {
          padding: 16px;
        }

        .material-date-picker-day-names {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 8px;
        }

        .material-date-picker-day-name {
          text-align: center;
          font-size: 12px;
          font-weight: 500;
          color: #666;
          padding: 8px 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .material-date-picker-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          max-width: 100%;
          overflow: hidden;
        }

        .material-date-picker-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 400;
        }

        .material-date-picker-day:hover {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .material-date-picker-day.selected {
          background-color: #26a69a;
          color: white;
          font-weight: 600;
        }

        .material-date-picker-day.today {
          background-color: #f5f5f5;
          color: #26a69a;
          font-weight: 600;
        }

        .material-date-picker-day.disabled {
          color: #ccc;
          cursor: not-allowed;
        }

        .material-date-picker-day.disabled:hover {
          background-color: transparent;
          color: #ccc;
        }

        .material-date-picker-time {
          border-top: 1px solid #f0f0f0;
          padding: 16px;
          background: #fafafa;
        }

        .material-date-picker-time-label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 12px;
        }

        .material-date-picker-time-input-container {
          position: relative;
          margin-bottom: 16px;
        }

        .material-date-picker-time-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: white;
          font-size: 14px;
          font-family: monospace;
          text-align: center;
        }

        .material-date-picker-time-input:focus {
          border-color: #26a69a;
          outline: none;
          box-shadow: 0 0 0 2px rgba(38, 166, 154, 0.1);
        }

        .material-date-picker-time-picker {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 10000;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          margin-top: 4px;
          /* Ensure it doesn't overlap the input */
          transform: translateY(0);
        }

        /* Smart positioning for time picker to avoid clipping */
        .material-date-picker-time-picker.position-left {
          left: 0;
          right: auto;
        }

        .material-date-picker-time-picker.position-right {
          left: auto;
          right: 0;
        }

        .material-date-picker-time-picker.position-center {
          left: 50%;
          right: auto;
          transform: translateX(-50%);
        }

        .material-date-picker-time-columns {
          display: flex;
          gap: 16px;
          justify-content: space-between;
          padding: 12px;
        }

        .material-date-picker-time-toggle {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          justify-content: center;
        }

        .material-date-picker-time-toggle-button {
          padding: 6px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .material-date-picker-time-toggle-button:hover {
          background-color: #f5f5f5;
        }

        .material-date-picker-time-toggle-button.active {
          background-color: #26a69a;
          color: white;
          border-color: #26a69a;
        }

        .material-date-picker-time-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .material-date-picker-time-column-label {
          font-size: 12px;
          font-weight: 500;
          color: #666;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .material-date-picker-time-list {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          max-height: 120px;
          overflow-y: auto;
          width: 100%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .material-date-picker-time-option {
          padding: 8px 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          border-bottom: 1px solid #f5f5f5;
        }

        .material-date-picker-time-option:last-child {
          border-bottom: none;
        }

        .material-date-picker-time-option:hover {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .material-date-picker-time-option.selected {
          background-color: #26a69a;
          color: white;
          font-weight: 600;
        }

        .material-date-picker-time-option.selected:hover {
          background-color: #1e8a7a;
        }

        /* Custom scrollbar for time lists */
        .material-date-picker-time-list::-webkit-scrollbar {
          width: 4px;
        }

        .material-date-picker-time-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }

        .material-date-picker-time-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }

        .material-date-picker-time-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .material-date-picker-actions {
          padding: 16px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .material-date-picker-button {
          padding: 8px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .material-date-picker-button:hover {
          background-color: #f5f5f5;
        }

        .material-date-picker-button.primary {
          background-color: #26a69a;
          color: white;
          border-color: #26a69a;
        }

        .material-date-picker-button.primary:hover {
          background-color: #1e8a7a;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div 
          className={`material-date-picker-input ${error ? 'error' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span>{value ? formatDate(value) : (placeholder || label)}</span>
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`material-date-picker-dropdown position-${dropdownPosition}`}
            >
              <div className="material-date-picker-header">
                <div className="material-date-picker-month-year">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className="material-date-picker-nav">
                  <button
                    className="material-date-picker-nav-button"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    className="material-date-picker-nav-button"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="material-date-picker-calendar">
                <div className="material-date-picker-day-names">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="material-date-picker-day-name">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="material-date-picker-days">
                  {generateCalendarDays().map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} />
                    }

                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                    const isTodayDate = isToday(date)
                    const isSelectedDate = isSelected(date)
                    const isDisabledDate = isDisabled(date)

                    return (
                      <div
                        key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}-${index}`}
                        className={`material-date-picker-day ${
                          isSelectedDate ? 'selected' : ''
                        } ${isTodayDate ? 'today' : ''} ${
                          isDisabledDate ? 'disabled' : ''
                        }`}
                        onClick={() => !isDisabledDate && handleDateSelect(day)}
                      >
                        {day}
                      </div>
                    )
                  })}
                </div>
              </div>

              {showTime && (
                <div className="material-date-picker-time">
                  <div className="material-date-picker-time-label">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Select Time
                  </div>
                  
                  <div className="material-date-picker-time-input-container">
                    <input
                      ref={timeInputRef}
                      type="text"
                      className="material-date-picker-time-input"
                      value={timeInputValue}
                      onChange={(e) => handleTimeInputChange(e.target.value)}
                      onFocus={handleTimeInputFocus}
                      onBlur={handleTimeInputBlur}
                      placeholder="HH:MM"
                      maxLength={5}
                    />
                    
                    {showTimePicker && (
                      <div 
                        ref={timePickerRef}
                        className={`material-date-picker-time-picker position-${timePickerPosition}`}
                      >
                        <div className="material-date-picker-time-toggle">
                          <button
                            className={`material-date-picker-time-toggle-button ${use24Hour ? 'active' : ''}`}
                            onClick={() => setUse24Hour(true)}
                          >
                            24H
                          </button>
                          <button
                            className={`material-date-picker-time-toggle-button ${!use24Hour ? 'active' : ''}`}
                            onClick={() => setUse24Hour(false)}
                          >
                            12H
                          </button>
                        </div>
                        
                        <div className="material-date-picker-time-columns">
                          <div className="material-date-picker-time-column">
                            <div className="material-date-picker-time-column-label">Hours</div>
                            <div className="material-date-picker-time-list">
                              {generateTimeOptions('hours').map(hour => {
                                const hourValue = use24Hour ? parseInt(hour) : 
                                  (parseInt(hour) === 12 ? 0 : parseInt(hour))
                                return (
                                  <div
                                    key={hour}
                                    className={`material-date-picker-time-option ${
                                      getDisplayHours() === parseInt(hour) ? 'selected' : ''
                                    }`}
                                    onClick={() => handleTimeChange('hours', hourValue)}
                                  >
                                    {hour}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          <div className="material-date-picker-time-column">
                            <div className="material-date-picker-time-column-label">Minutes</div>
                            <div className="material-date-picker-time-list">
                              {generateTimeOptions('minutes').map(minute => (
                                <div
                                  key={minute}
                                  className={`material-date-picker-time-option ${
                                    selectedTime.minutes === parseInt(minute) ? 'selected' : ''
                                  }`}
                                  onClick={() => handleTimeChange('minutes', parseInt(minute))}
                                >
                                  {minute}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {!use24Hour && (
                          <div className="material-date-picker-time-toggle">
                            <button
                              className={`material-date-picker-time-toggle-button ${getAmPm() === 'AM' ? 'active' : ''}`}
                              onClick={() => {
                                if (getAmPm() === 'PM') {
                                  handleTimeChange('hours', selectedTime.hours - 12)
                                }
                              }}
                            >
                              AM
                            </button>
                            <button
                              className={`material-date-picker-time-toggle-button ${getAmPm() === 'PM' ? 'active' : ''}`}
                              onClick={() => {
                                if (getAmPm() === 'AM') {
                                  handleTimeChange('hours', selectedTime.hours + 12)
                                }
                              }}
                            >
                              PM
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="material-date-picker-actions">
                <button
                  className="material-date-picker-button"
                  onClick={() => {
                    onChange(null)
                    setIsOpen(false)
                  }}
                >
                  Clear
                </button>
                <button
                  className="material-date-picker-button"
                  onClick={() => {
                    const today = new Date()
                    if (showTime) {
                      today.setHours(selectedTime.hours, selectedTime.minutes)
                    }
                    onChange(today)
                    setIsOpen(false)
                  }}
                >
                  Today
                </button>
                <button
                  className="material-date-picker-button primary"
                  onClick={() => setIsOpen(false)}
                >
                  {showTime ? 'Confirm' : 'Done'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {error && helperText && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 mt-1"
        >
          {helperText}
        </motion.p>
      )}
    </div>
  )
}