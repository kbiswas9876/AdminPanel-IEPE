'use client'

import { useState, useEffect } from 'react'
import { MaterialDatePicker } from '@/components/ui/material-date-picker'
import { MaterialTimePicker } from '@/components/ui/material-time-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar, Clock, AlertCircle, Infinity, CheckCircle, XCircle, Zap } from 'lucide-react'
import { 
  toUTCISOString, 
  fromUTCISOString, 
  getDefaultTime,
  isFutureDate,
  isEndDateAfterStart
} from '@/lib/utils/timezone'
import type { Test } from '@/lib/supabase/admin'

export interface UnifiedPublishData {
  startTime: string
  endTime: string
  schedulingMode: 'fixed' | 'perpetual'
  resultPolicy: 'instant' | 'scheduled'
  resultReleaseAt: string
}

interface UnifiedPublishModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (publishData: UnifiedPublishData) => void
  isProcessing: boolean
  test?: Test // Optional test data for editing scenarios
  mode?: 'new' | 'edit' | 'reschedule' // Context for different use cases
}

export function UnifiedPublishModal({
  open,
  onClose,
  onConfirm,
  isProcessing,
  test,
  mode = 'new'
}: UnifiedPublishModalProps) {
  const [publishData, setPublishData] = useState<UnifiedPublishData>({
    startTime: '',
    endTime: '',
    schedulingMode: 'fixed',
    resultPolicy: 'instant',
    resultReleaseAt: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  
  // Separate state for date picker values to ensure controlled components
  const [startDateValue, setStartDateValue] = useState<Date | null>(null)
  const [endDateValue, setEndDateValue] = useState<Date | null>(null)
  const [resultDateValue, setResultDateValue] = useState<Date | null>(null)

  // Initialize with sensible defaults when modal opens
  useEffect(() => {
    if (open) {
      const defaultStart = getDefaultTime(1) // 1 hour from now
      const defaultEnd = getDefaultTime(3) // 3 hours from now
      
      setPublishData({
        startTime: toUTCISOString(defaultStart),
        endTime: toUTCISOString(defaultEnd),
        schedulingMode: 'fixed',
        resultPolicy: 'instant',
        resultReleaseAt: ''
      })
      
      // Set date picker values
      setStartDateValue(defaultStart)
      setEndDateValue(defaultEnd)
      setResultDateValue(null)
      
      setErrors({})
      setTouched({})
    }
  }, [open])

  // Helper function to convert UTC string to Date object for react-datepicker
  const getDateFromUTC = (utcString: string): Date | null => {
    if (!utcString) return null
    try {
      const date = fromUTCISOString(utcString)
      return isNaN(date.getTime()) ? null : date
    } catch (error) {
      console.error('Error parsing UTC string:', error)
      return null
    }
  }

  // Intelligent logic: Update result policy when scheduling mode changes
  const handleSchedulingModeChange = (mode: 'fixed' | 'perpetual') => {
    setPublishData(prev => ({
      ...prev,
      schedulingMode: mode,
      // If switching to perpetual, force result policy to instant
      resultPolicy: mode === 'perpetual' ? 'instant' : prev.resultPolicy,
      // Clear result release date if switching to perpetual
      resultReleaseAt: mode === 'perpetual' ? '' : prev.resultReleaseAt
    }))
    
    // Clear result date value when switching to perpetual
    if (mode === 'perpetual') {
      setResultDateValue(null)
    }
    
    // Clear related errors
    setErrors(prev => ({
      ...prev,
      endTime: '',
      resultReleaseAt: ''
    }))
  }

  // Intelligent logic: Validate result policy against scheduling mode
  const handleResultPolicyChange = (policy: 'instant' | 'scheduled') => {
    setPublishData(prev => ({
      ...prev,
      resultPolicy: policy,
      // Clear result release date if switching to instant
      resultReleaseAt: policy === 'instant' ? '' : prev.resultReleaseAt
    }))
    
    // Clear related errors
    setErrors(prev => ({
      ...prev,
      resultReleaseAt: ''
    }))
  }

  const validatePublishData = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Start time validation
    if (!publishData.startTime) {
      newErrors.startTime = 'Start time is required'
    } else {
      try {
        const startDate = fromUTCISOString(publishData.startTime)
        if (!isFutureDate(startDate)) {
          newErrors.startTime = 'Start time must be in the future'
        }
      } catch {
        newErrors.startTime = 'Invalid start date format'
      }
    }
    
    // End time validation (only for fixed scheduling)
    if (publishData.schedulingMode === 'fixed') {
      if (!publishData.endTime) {
        newErrors.endTime = 'End time is required for fixed time window'
      } else {
        try {
          const startDate = fromUTCISOString(publishData.startTime)
          const endDate = fromUTCISOString(publishData.endTime)
          
          if (!isEndDateAfterStart(startDate, endDate)) {
            newErrors.endTime = 'End time must be after start time'
          }
        } catch {
          newErrors.endTime = 'Invalid end date format'
        }
      }
    }
    
    // Result release date validation (only for scheduled results)
    if (publishData.resultPolicy === 'scheduled') {
      if (!publishData.resultReleaseAt) {
        newErrors.resultReleaseAt = 'Result release date is required'
      } else {
        try {
          const releaseDate = fromUTCISOString(publishData.resultReleaseAt)
          const startDate = fromUTCISOString(publishData.startTime)
          
          // For fixed scheduling, result release must be after test end
          if (publishData.schedulingMode === 'fixed') {
            const endDate = fromUTCISOString(publishData.endTime)
            if (releaseDate <= endDate) {
              newErrors.resultReleaseAt = 'Result release must be after test end time'
            }
          } else {
            // For perpetual, result release must be after start
            if (releaseDate <= startDate) {
              newErrors.resultReleaseAt = 'Result release must be after test start time'
            }
          }
        } catch {
          newErrors.resultReleaseAt = 'Invalid result release date format'
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirm = () => {
    if (validatePublishData()) {
      onConfirm(publishData)
    }
  }

  const handlePublishNow = () => {
    // Get current timestamp
    const now = new Date()
    const startTimeNow = toUTCISOString(now)

    // Determine end time based on scheduling mode
    let endTime = ''
    if (publishData.schedulingMode === 'fixed') {
      // If end time is already set, use it; otherwise default to 24 hours from now
      if (publishData.endTime) {
        try {
          const currentEndDate = fromUTCISOString(publishData.endTime)
          // Only use existing end time if it's in the future relative to now
          if (currentEndDate > now) {
            endTime = publishData.endTime
          } else {
            // Default to 24 hours from now
            const defaultEndDate = new Date(now)
            defaultEndDate.setHours(defaultEndDate.getHours() + 24)
            endTime = toUTCISOString(defaultEndDate)
          }
        } catch {
          // If parsing fails, default to 24 hours from now
          const defaultEndDate = new Date(now)
          defaultEndDate.setHours(defaultEndDate.getHours() + 24)
          endTime = toUTCISOString(defaultEndDate)
        }
      } else {
        // Default to 24 hours from now
        const defaultEndDate = new Date(now)
        defaultEndDate.setHours(defaultEndDate.getHours() + 24)
        endTime = toUTCISOString(defaultEndDate)
      }
    }

    // Determine result release time
    let resultReleaseAt = publishData.resultReleaseAt
    if (publishData.resultPolicy === 'scheduled') {
      if (!resultReleaseAt) {
        // Default result release time
        if (publishData.schedulingMode === 'fixed' && endTime) {
          // For fixed scheduling, default to end time + 1 hour
          try {
            const endDate = fromUTCISOString(endTime)
            const releaseDate = new Date(endDate)
            releaseDate.setHours(releaseDate.getHours() + 1)
            resultReleaseAt = toUTCISOString(releaseDate)
          } catch {
            // Fallback: start time + 25 hours (24 hours + 1 hour)
            const releaseDate = new Date(now)
            releaseDate.setHours(releaseDate.getHours() + 25)
            resultReleaseAt = toUTCISOString(releaseDate)
          }
        } else {
          // For perpetual, default to start time + 1 hour
          const releaseDate = new Date(now)
          releaseDate.setHours(releaseDate.getHours() + 1)
          resultReleaseAt = toUTCISOString(releaseDate)
        }
      }
    }

    // Build the publish data with current timestamp
    const publishNowData: UnifiedPublishData = {
      startTime: startTimeNow,
      endTime: endTime,
      schedulingMode: publishData.schedulingMode,
      resultPolicy: publishData.resultPolicy || 'instant',
      resultReleaseAt: resultReleaseAt || ''
    }

    // Bypass validation and call onConfirm directly
    onConfirm(publishNowData)
  }


  const handleClose = () => {
    if (!isProcessing) {
      setPublishData({
        startTime: '',
        endTime: '',
        schedulingMode: 'fixed',
        resultPolicy: 'instant',
        resultReleaseAt: ''
      })
      setErrors({})
      setTouched({})
      onClose()
    }
  }

  const getModalTitle = () => {
    switch (mode) {
      case 'edit': return 'Reschedule Test'
      case 'reschedule': return 'Reschedule Test'
      default: return 'Publish Test'
    }
  }

  const getModalDescription = () => {
    switch (mode) {
      case 'edit': 
      case 'reschedule': 
        return 'Update the scheduling and result declaration settings for this test.'
      default: 
        return 'Set the active window and result declaration policy for your test.'
    }
  }

  return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="w-[95vw] max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ zIndex: 50 }}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span>{getModalTitle()}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {getModalDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Test Information (for edit/reschedule modes) */}
          {test && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Test: {test.name}</span>
              </div>
            </div>
          )}

          {/* Test Scheduling Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-semibold">Test Scheduling</Label>
            </div>
            
            <div className="space-y-2">
              {/* Fixed Time Window */}
              <label className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input 
                  type="radio" 
                  name="scheduling" 
                  value="fixed" 
                  checked={publishData.schedulingMode === 'fixed'} 
                  onChange={() => handleSchedulingModeChange('fixed')} 
                  className="w-4 h-4 text-blue-600" 
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Fixed Time Window</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Test has specific start and end times</p>
                </div>
              </label>
              
              {/* Perpetual Test */}
              <label className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input 
                  type="radio" 
                  name="scheduling" 
                  value="perpetual" 
                  checked={publishData.schedulingMode === 'perpetual'} 
                  onChange={() => handleSchedulingModeChange('perpetual')} 
                  className="w-4 h-4 text-blue-600" 
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Infinity className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Perpetual Test</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Test starts at a specific time but has no end date</p>
                </div>
              </label>
            </div>
          </div>

          {/* Start Date & Time */}
          <div className="space-y-3">
            <Label className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>Test Start Date & Time *</span>
            </Label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Start Date */}
              <div className="space-y-1">
                <Label htmlFor="start-date" className="text-xs font-medium text-gray-600">
                  Start Date
                </Label>
                <MaterialDatePicker
                  value={startDateValue}
                  onChange={(date) => {
                    setStartDateValue(date)
                    if (date) {
                      const utcString = toUTCISOString(date)
                      setPublishData(prev => ({ ...prev, startTime: utcString }))
                      if (errors.startTime) {
                        setErrors(prev => ({ ...prev, startTime: '' }))
                      }
                    }
                  }}
                  label="Select start date"
                  minDate={new Date()}
                  error={!!errors.startTime}
                  helperText={errors.startTime}
                />
              </div>

              {/* Start Time */}
              <div className="space-y-1">
                <Label htmlFor="start-time" className="text-xs font-medium text-gray-600">
                  Start Time
                </Label>
                <MaterialTimePicker
                  value={startDateValue}
                  onChange={(date) => {
                    if (date && startDateValue) {
                      // Combine the selected date with the new time
                      const combinedDate = new Date(startDateValue)
                      combinedDate.setHours(date.getHours())
                      combinedDate.setMinutes(date.getMinutes())
                      setStartDateValue(combinedDate)
                      const utcString = toUTCISOString(combinedDate)
                      setPublishData(prev => ({ ...prev, startTime: utcString }))
                      if (errors.startTime) {
                        setErrors(prev => ({ ...prev, startTime: '' }))
                      }
                    }
                  }}
                  label="Select start time"
                  error={!!errors.startTime}
                  helperText={errors.startTime}
                />
              </div>
            </div>
          </div>

          {/* End Date & Time - Only show for fixed scheduling */}
          {publishData.schedulingMode === 'fixed' && (
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Test End Date & Time *</span>
              </Label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* End Date */}
                <div className="space-y-1">
                  <Label htmlFor="end-date" className="text-xs font-medium text-gray-600">
                    End Date
                  </Label>
                  <MaterialDatePicker
                    value={endDateValue}
                    onChange={(date) => {
                      setEndDateValue(date)
                      if (date) {
                        const utcString = toUTCISOString(date)
                        setPublishData(prev => ({ ...prev, endTime: utcString }))
                        if (errors.endTime) {
                          setErrors(prev => ({ ...prev, endTime: '' }))
                        }
                      }
                    }}
                    label="Select end date"
                    minDate={startDateValue || new Date()}
                    error={!!errors.endTime}
                    helperText={errors.endTime}
                  />
                </div>

                {/* End Time */}
                <div className="space-y-1">
                  <Label htmlFor="end-time" className="text-xs font-medium text-gray-600">
                    End Time
                  </Label>
                  <MaterialTimePicker
                    value={endDateValue}
                    onChange={(date) => {
                      if (date && endDateValue) {
                        // Combine the selected date with the new time
                        const combinedDate = new Date(endDateValue)
                        combinedDate.setHours(date.getHours())
                        combinedDate.setMinutes(date.getMinutes())
                        setEndDateValue(combinedDate)
                        const utcString = toUTCISOString(combinedDate)
                        setPublishData(prev => ({ ...prev, endTime: utcString }))
                        if (errors.endTime) {
                          setErrors(prev => ({ ...prev, endTime: '' }))
                        }
                      }
                    }}
                    label="Select end time"
                    error={!!errors.endTime}
                    helperText={errors.endTime}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Result Declaration Policy Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-semibold">Result Declaration Policy</Label>
            </div>
            
            <div className="space-y-2">
              {/* Instant Results */}
              <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${
                publishData.resultPolicy === 'instant' 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-50'
              } ${publishData.schedulingMode === 'perpetual' ? 'opacity-100' : ''}`}>
                <input 
                  type="radio" 
                  name="resultPolicy" 
                  value="instant" 
                  checked={publishData.resultPolicy === 'instant'} 
                  onChange={() => handleResultPolicyChange('instant')} 
                  className="w-4 h-4 text-blue-600"
                  disabled={publishData.schedulingMode === 'perpetual'} // Always selected for perpetual
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Instantly on submission</span>
                    {publishData.schedulingMode === 'perpetual' && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Auto-selected</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Students see results immediately after submitting</p>
                </div>
              </label>
              
              {/* Scheduled Results - Only available for fixed scheduling */}
              {publishData.schedulingMode === 'fixed' && (
                <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${
                  publishData.resultPolicy === 'scheduled' 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <input 
                    type="radio" 
                    name="resultPolicy" 
                    value="scheduled" 
                    checked={publishData.resultPolicy === 'scheduled'} 
                    onChange={() => handleResultPolicyChange('scheduled')} 
                    className="w-4 h-4 text-blue-600" 
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">At a fixed date/time</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Results are released at a specific time</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Result Release Date & Time - Only show for scheduled results */}
          {publishData.resultPolicy === 'scheduled' && (
            <div className="space-y-2">
              <Label className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Result Release Date & Time *</span>
              </Label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Result Release Date */}
                <div className="space-y-1">
                  <Label htmlFor="result-date" className="text-xs font-medium text-gray-600">
                    Release Date
                  </Label>
                  <MaterialDatePicker
                    value={resultDateValue}
                    onChange={(date) => {
                      setResultDateValue(date)
                      if (date) {
                        const utcString = toUTCISOString(date)
                        setPublishData(prev => ({ ...prev, resultReleaseAt: utcString }))
                        if (errors.resultReleaseAt) {
                          setErrors(prev => ({ ...prev, resultReleaseAt: '' }))
                        }
                      }
                    }}
                    label="Select release date"
                    minDate={publishData.schedulingMode === 'fixed' && endDateValue 
                      ? endDateValue 
                      : startDateValue || new Date()}
                    error={!!errors.resultReleaseAt}
                    helperText={errors.resultReleaseAt}
                  />
                </div>

                {/* Result Release Time */}
                <div className="space-y-1">
                  <Label htmlFor="result-time" className="text-xs font-medium text-gray-600">
                    Release Time
                  </Label>
                  <MaterialTimePicker
                    value={resultDateValue}
                    onChange={(date) => {
                      if (date && resultDateValue) {
                        // Combine the selected date with the new time
                        const combinedDate = new Date(resultDateValue)
                        combinedDate.setHours(date.getHours())
                        combinedDate.setMinutes(date.getMinutes())
                        setResultDateValue(combinedDate)
                        const utcString = toUTCISOString(combinedDate)
                        setPublishData(prev => ({ ...prev, resultReleaseAt: utcString }))
                        if (errors.resultReleaseAt) {
                          setErrors(prev => ({ ...prev, resultReleaseAt: '' }))
                        }
                      }
                    }}
                    label="Select release time"
                    error={!!errors.resultReleaseAt}
                    helperText={errors.resultReleaseAt}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Smart Info Box */}
          <div className={`border rounded-lg p-3 ${
            publishData.schedulingMode === 'perpetual' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start space-x-3">
              {publishData.schedulingMode === 'perpetual' ? (
                <Infinity className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="text-sm">
                <p className="font-medium mb-2">
                  {publishData.schedulingMode === 'perpetual' ? 'Perpetual Test Configuration:' : 'Test Configuration:'}
                </p>
                <ul className="space-y-1 text-xs">
                  {publishData.schedulingMode === 'perpetual' ? (
                    <>
                      <li>• Test will be available from the start date onwards</li>
                      <li>• No end date - students can take it anytime after start</li>
                      <li>• Results are shown instantly (only logical option)</li>
                      <li>• Perfect for practice tests and open-ended assignments</li>
                    </>
                  ) : (
                    <>
                      <li>• Students can only access the test during the specified time window</li>
                      <li>• The test will automatically close when the end time is reached</li>
                      <li>• Results will be {publishData.resultPolicy === 'instant' ? 'shown immediately' : 'released at the specified time'}</li>
                      <li>• Make sure to set appropriate time limits for your test duration</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className="w-full sm:w-auto text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublishNow}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isProcessing ? 'Publishing...' : 'Publish Now'}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm"
          >
            {isProcessing ? 'Publishing...' : 'Confirm & Publish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
