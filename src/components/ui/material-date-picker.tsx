'use client'

import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import { motion } from 'framer-motion'
import 'react-datepicker/dist/react-datepicker.css'

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
}: MaterialDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="material-date-picker-wrapper">
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

        .material-date-picker-popper {
          z-index: 99999 !important;
          transform: translateX(30px) !important;
        }
        
        .material-date-picker-calendar {
          border: none !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          overflow: hidden !important;
          width: 320px !important;
        }

        /* Header with Material Design styling */
        .material-date-picker-calendar .react-datepicker__header {
          background: #26a69a !important;
          border: none !important;
          padding: 24px 20px !important;
          text-align: center !important;
          position: relative !important;
        }

        /* Year display - small text at top */
        .material-date-picker-calendar .react-datepicker__current-month {
          color: rgba(255, 255, 255, 0.8) !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          margin: 0 0 8px 0 !important;
          line-height: 1 !important;
        }

        /* Selected date display - large prominent text */
        .material-date-picker-calendar .react-datepicker__day-name {
          color: white !important;
          font-size: 20px !important;
          font-weight: 600 !important;
          margin: 0 !important;
          line-height: 1.2 !important;
        }

        /* Navigation arrows - positioned in header */
        .material-date-picker-calendar .react-datepicker__navigation {
          top: 24px !important;
          border: none !important;
          background: rgba(255, 255, 255, 0.2) !important;
          border-radius: 50% !important;
          width: 36px !important;
          height: 36px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
        }

        .material-date-picker-calendar .react-datepicker__navigation:hover {
          background: rgba(255, 255, 255, 0.3) !important;
        }

        .material-date-picker-calendar .react-datepicker__navigation--previous {
          left: 16px !important;
        }

        .material-date-picker-calendar .react-datepicker__navigation--next {
          right: 16px !important;
        }

        .material-date-picker-calendar .react-datepicker__navigation-icon::before {
          border-color: white !important;
          border-width: 2px 2px 0 0 !important;
          width: 8px !important;
          height: 8px !important;
        }

        /* Month/Year navigation - clean white section */
        .material-date-picker-calendar .react-datepicker__month-container {
          background: white !important;
        }

        .material-date-picker-calendar .react-datepicker__month-dropdown-container {
          background: white !important;
          padding: 16px 20px 8px 20px !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }

        .material-date-picker-calendar .react-datepicker__month-read-view {
          color: #333 !important;
          font-size: 16px !important;
          font-weight: 500 !important;
        }

        .material-date-picker-calendar .react-datepicker__month-read-view--down-arrow {
          border-color: #666 !important;
        }

        /* Days of week - light gray background */
        .material-date-picker-calendar .react-datepicker__day-names {
          background: #fafafa !important;
          margin: 0 !important;
          padding: 12px 0 !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }

        .material-date-picker-calendar .react-datepicker__day-name {
          color: #666 !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          width: 14.28% !important;
        }

        /* Calendar grid */
        .material-date-picker-calendar .react-datepicker__month {
          margin: 0 !important;
          padding: 12px 16px 20px 16px !important;
        }

        /* Individual days - EXACT MATCH */
        .material-date-picker-calendar .react-datepicker__day {
          color: #333 !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          border-radius: 50% !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          margin: 2px !important;
          transition: all 0.2s ease !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .material-date-picker-calendar .react-datepicker__day:hover {
          background-color: #e3f2fd !important;
          color: #1976d2 !important;
        }

        .material-date-picker-calendar .react-datepicker__day--selected {
          background-color: #26a69a !important;
          color: white !important;
          font-weight: 600 !important;
        }

        .material-date-picker-calendar .react-datepicker__day--outside-month {
          color: #ccc !important;
        }

        .material-date-picker-calendar .react-datepicker__day--today {
          background-color: #f5f5f5 !important;
          color: #26a69a !important;
          font-weight: 600 !important;
        }

        /* Hide the clear button */
        .material-date-picker-calendar .react-datepicker__close-icon {
          display: none !important;
        }

        /* Ensure proper layout for month/year navigation */
        .material-date-picker-calendar .react-datepicker__month-dropdown {
          background: white !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 4px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }

        .material-date-picker-calendar .react-datepicker__month-option {
          padding: 8px 12px !important;
          color: #333 !important;
          font-size: 14px !important;
        }

        .material-date-picker-calendar .react-datepicker__month-option:hover {
          background-color: #f5f5f5 !important;
        }

        .material-date-picker-calendar .react-datepicker__month-option--selected {
          background-color: #26a69a !important;
          color: white !important;
        }

        /* Year dropdown */
        .material-date-picker-calendar .react-datepicker__year-dropdown {
          background: white !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 4px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }

        .material-date-picker-calendar .react-datepicker__year-option {
          padding: 8px 12px !important;
          color: #333 !important;
          font-size: 14px !important;
        }

        .material-date-picker-calendar .react-datepicker__year-option:hover {
          background-color: #f5f5f5 !important;
        }

        .material-date-picker-calendar .react-datepicker__year-option--selected {
          background-color: #26a69a !important;
          color: white !important;
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
          dateFormat="MMMM d, yyyy"
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          placeholderText={placeholder || label}
          className={`material-date-picker-input ${error ? 'error' : ''}`}
          popperClassName="material-date-picker-popper"
          calendarClassName="material-date-picker-calendar"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          yearDropdownItemNumber={15}
          scrollableYearDropdown
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