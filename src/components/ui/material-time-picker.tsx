'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'

interface MaterialTimePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  label?: string
  minTime?: Date
  maxTime?: Date
  placeholder?: string
  error?: boolean
  helperText?: string
  disabled?: boolean
}

export function MaterialTimePicker({
  value,
  onChange,
  label = 'Select time',
  minTime,
  maxTime,
  placeholder,
  error = false,
  helperText,
  disabled = false,
}: MaterialTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState({ hours: 0, minutes: 0 })
  const [timeInputValue, setTimeInputValue] = useState('')
  const [use24Hour, setUse24Hour] = useState(true)
  const [timePickerPosition, setTimePickerPosition] = useState<'left' | 'right' | 'center'>('left')
  const containerRef = useRef<HTMLDivElement>(null)
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

  // Helper functions
  const formatTime = (date: Date | null) => {
    if (!date) return ''
    const hours = date.getHours()
    const minutes = date.getMinutes()
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
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
    setIsOpen(true)
    
    // Calculate time picker position to avoid clipping
    if (timeInputRef.current) {
      const inputRect = timeInputRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const timePickerWidth = 240 // Compact width
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
    setTimeout(() => {
      setIsOpen(false)
    }, 200)
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
    <div className="material-time-picker-wrapper" ref={containerRef}>
      <style jsx global>{`
        .material-time-picker-wrapper {
          width: 100%;
          position: relative;
        }

        .material-time-picker-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          transition: all 0.2s ease;
          cursor: text;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .material-time-picker-input:hover {
          border-color: #bdbdbd;
        }

        .material-time-picker-input:focus {
          border-color: #26a69a;
          box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.1);
          outline: none;
        }

        .material-time-picker-input.error {
          border-color: #f44336;
        }

        .material-time-picker-input.error:focus {
          border-color: #f44336;
          box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
        }

        .material-time-picker-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 9999;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          margin-top: 4px;
          width: 240px;
          min-width: 240px;
          max-width: 240px;
        }

        .material-time-picker-time-columns {
          display: flex;
          gap: 8px;
          justify-content: space-between;
          padding: 6px;
        }

        .material-time-picker-time-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .material-time-picker-time-column-label {
          font-size: 12px;
          font-weight: 500;
          color: #666;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .material-time-picker-time-list {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          max-height: 100px;
          overflow-y: auto;
          width: 100%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .material-time-picker-time-option {
          padding: 4px 6px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
          border-bottom: 1px solid #f5f5f5;
        }

        .material-time-picker-time-option:last-child {
          border-bottom: none;
        }

        .material-time-picker-time-option:hover {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .material-time-picker-time-option.selected {
          background-color: #26a69a;
          color: white;
          font-weight: 600;
        }

        .material-time-picker-time-option.selected:hover {
          background-color: #1e8a7a;
        }

        .material-time-picker-time-toggle {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
          justify-content: center;
        }

        .material-time-picker-time-toggle-button {
          padding: 4px 8px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .material-time-picker-time-toggle-button:hover {
          background-color: #f5f5f5;
        }

        .material-time-picker-time-toggle-button.active {
          background-color: #26a69a;
          color: white;
          border-color: #26a69a;
        }

        /* Smart positioning */
        .material-time-picker-dropdown.position-left {
          left: 0;
          right: auto;
        }

        .material-time-picker-dropdown.position-right {
          left: auto;
          right: 0;
        }

        .material-time-picker-dropdown.position-center {
          left: 50%;
          right: auto;
          transform: translateX(-50%);
        }

        /* Custom scrollbar */
        .material-time-picker-time-list::-webkit-scrollbar {
          width: 4px;
        }

        .material-time-picker-time-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }

        .material-time-picker-time-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }

        .material-time-picker-time-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Responsive adjustments for smaller screens */
        @media (max-width: 400px) {
          .material-time-picker-dropdown {
            width: 220px;
            min-width: 220px;
            max-width: 220px;
          }
          
          .material-time-picker-time-columns {
            gap: 6px;
            padding: 4px;
          }
          
          .material-time-picker-time-option {
            padding: 3px 4px;
            font-size: 11px;
          }
          
          .material-time-picker-time-list {
            max-height: 80px;
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div 
          className={`material-time-picker-input ${error ? 'error' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span>{value ? formatTime(value) : (placeholder || label)}</span>
          <Clock className="w-4 h-4 text-gray-400" />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={timePickerRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`material-time-picker-dropdown position-${timePickerPosition}`}
            >
              <div className="material-time-picker-time-toggle">
                <button
                  className={`material-time-picker-time-toggle-button ${use24Hour ? 'active' : ''}`}
                  onClick={() => setUse24Hour(true)}
                >
                  24H
                </button>
                <button
                  className={`material-time-picker-time-toggle-button ${!use24Hour ? 'active' : ''}`}
                  onClick={() => setUse24Hour(false)}
                >
                  12H
                </button>
              </div>
              
              <div className="material-time-picker-time-columns">
                <div className="material-time-picker-time-column">
                  <div className="material-time-picker-time-column-label">Hours</div>
                  <div className="material-time-picker-time-list">
                    {generateTimeOptions('hours').map(hour => {
                      const hourValue = use24Hour ? parseInt(hour) : 
                        (parseInt(hour) === 12 ? 0 : parseInt(hour))
                      return (
                        <div
                          key={hour}
                          className={`material-time-picker-time-option ${
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
                <div className="material-time-picker-time-column">
                  <div className="material-time-picker-time-column-label">Minutes</div>
                  <div className="material-time-picker-time-list">
                    {generateTimeOptions('minutes').map(minute => (
                      <div
                        key={minute}
                        className={`material-time-picker-time-option ${
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
                <div className="material-time-picker-time-toggle">
                  <button
                    className={`material-time-picker-time-toggle-button ${getAmPm() === 'AM' ? 'active' : ''}`}
                    onClick={() => {
                      if (getAmPm() === 'PM') {
                        handleTimeChange('hours', selectedTime.hours - 12)
                      }
                    }}
                  >
                    AM
                  </button>
                  <button
                    className={`material-time-picker-time-toggle-button ${getAmPm() === 'PM' ? 'active' : ''}`}
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
