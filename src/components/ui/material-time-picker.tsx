'use client'

import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import { motion } from 'framer-motion'
import 'react-datepicker/dist/react-datepicker.css'

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

  return (
    <div className="material-time-picker-wrapper">
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
          cursor: pointer;
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

        .material-time-picker-popper {
          z-index: 99999 !important;
          transform: translateX(30px) !important;
        }

        .material-time-picker-calendar {
          border: none !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          overflow: hidden !important;
          width: 200px !important;
        }

        /* Header with Material Design styling */
        .material-time-picker-calendar .react-datepicker__header {
          background: #26a69a !important;
          border: none !important;
          padding: 16px !important;
          text-align: center !important;
          position: relative !important;
        }

        /* Time header */
        .material-time-picker-calendar .react-datepicker__header--time {
          background: #26a69a !important;
          color: white !important;
          font-size: 16px !important;
          font-weight: 500 !important;
          padding: 12px !important;
          text-align: center !important;
        }

        /* Time list container */
        .material-time-picker-calendar .react-datepicker__time-container {
          border: none !important;
          background: white !important;
          width: 100% !important;
        }

        .material-time-picker-calendar .react-datepicker__time-list {
          background: white !important;
          max-height: 200px !important;
          padding: 8px 0 !important;
        }

        /* Time list items */
        .material-time-picker-calendar .react-datepicker__time-list-item {
          color: #333 !important;
          font-size: 14px !important;
          padding: 8px 16px !important;
          transition: all 0.2s ease !important;
          text-align: center !important;
          border-radius: 4px !important;
          margin: 2px 8px !important;
        }

        .material-time-picker-calendar .react-datepicker__time-list-item:hover {
          background-color: #e3f2fd !important;
          color: #1976d2 !important;
        }

        .material-time-picker-calendar .react-datepicker__time-list-item--selected {
          background-color: #26a69a !important;
          color: white !important;
          font-weight: 600 !important;
        }

        /* Hide the clear button */
        .material-time-picker-calendar .react-datepicker__close-icon {
          display: none !important;
        }

        /* Custom scrollbar for time list */
        .material-time-picker-calendar .react-datepicker__time-list::-webkit-scrollbar {
          width: 6px;
        }

        .material-time-picker-calendar .react-datepicker__time-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .material-time-picker-calendar .react-datepicker__time-list::-webkit-scrollbar-thumb {
          background: #26a69a;
          border-radius: 3px;
        }

        .material-time-picker-calendar .react-datepicker__time-list::-webkit-scrollbar-thumb:hover {
          background: #00796b;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <DatePicker
          selected={value}
          onChange={onChange}
          showTimeSelect
          showTimeSelectOnly
          timeFormat="HH:mm"
          timeIntervals={1}
          dateFormat="h:mm aa"
          timeCaption="Time"
          minTime={minTime}
          maxTime={maxTime}
          disabled={disabled}
          placeholderText={placeholder || label}
          className={`material-time-picker-input ${error ? 'error' : ''}`}
          popperClassName="material-time-picker-popper"
          calendarClassName="material-time-picker-calendar"
          onCalendarOpen={() => setIsOpen(true)}
          onCalendarClose={() => setIsOpen(false)}
        />
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
