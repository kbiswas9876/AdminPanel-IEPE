'use client'

import { useState, useEffect } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker'
import { Button } from '@/components/ui/button'
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

// Helper to check if two dates are on the same day
const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

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
      
      setStartDateValue(defaultStart)
      setEndDateValue(defaultEnd)
      setResultDateValue(null)
      
      setErrors({})
    }
  }, [open])

  const handleDatePartChange = (field: 'startTime' | 'endTime' | 'resultReleaseAt', newDate: Date | null) => {
    const dateSetter = {
      startTime: setStartDateValue,
      endTime: setEndDateValue,
      resultReleaseAt: setResultDateValue,
    }[field]

    if (newDate) {
      const originalDate = {
        startTime: startDateValue,
        endTime: endDateValue,
        resultReleaseAt: resultDateValue,
      }[field]
      
      const finalDate = new Date(newDate)
      if (originalDate) {
        finalDate.setHours(originalDate.getHours())
        finalDate.setMinutes(originalDate.getMinutes())
      }
      
      dateSetter(finalDate)
      setPublishData(prev => ({ ...prev, [field]: toUTCISOString(finalDate) }))
    } else {
      dateSetter(null)
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleTimePartChange = (field: 'startTime' | 'endTime' | 'resultReleaseAt', newTime: Date | null) => {
    const originalDate = {
      startTime: startDateValue,
      endTime: endDateValue,
      resultReleaseAt: resultDateValue,
    }[field]

    if (newTime && originalDate) {
      const finalDate = new Date(originalDate)
      finalDate.setHours(newTime.getHours())
      finalDate.setMinutes(newTime.getMinutes())
      
      const dateSetter = {
        startTime: setStartDateValue,
        endTime: setEndDateValue,
        resultReleaseAt: setResultDateValue,
      }[field]
      dateSetter(finalDate)

      setPublishData(prev => ({ ...prev, [field]: toUTCISOString(finalDate) }))
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }))
      }
    }
  }

  const handleSchedulingModeChange = (mode: 'fixed' | 'perpetual') => {
    setPublishData(prev => ({
      ...prev,
      schedulingMode: mode,
      resultPolicy: mode === 'perpetual' ? 'instant' : prev.resultPolicy,
      resultReleaseAt: mode === 'perpetual' ? '' : prev.resultReleaseAt
    }))
    
    if (mode === 'perpetual') {
      setResultDateValue(null)
    }
    
    setErrors(prev => ({
      ...prev,
      endTime: '',
      resultReleaseAt: ''
    }))
  }

  const handleResultPolicyChange = (policy: 'instant' | 'scheduled') => {
    setPublishData(prev => ({
      ...prev,
      resultPolicy: policy,
      resultReleaseAt: policy === 'instant' ? '' : prev.resultReleaseAt
    }))
    
    setErrors(prev => ({
      ...prev,
      resultReleaseAt: ''
    }))
  }

  const validatePublishData = (): boolean => {
    const newErrors: Record<string, string> = {}
    
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
    
    if (publishData.resultPolicy === 'scheduled') {
      if (!publishData.resultReleaseAt) {
        newErrors.resultReleaseAt = 'Result release date is required'
      } else {
        try {
          const releaseDate = fromUTCISOString(publishData.resultReleaseAt)
          const startDate = fromUTCISOString(publishData.startTime)
          
          if (publishData.schedulingMode === 'fixed') {
            const endDate = fromUTCISOString(publishData.endTime)
            if (releaseDate <= endDate) {
              newErrors.resultReleaseAt = 'Result release must be after test end time'
            }
          } else {
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
    const now = new Date()
    const startTimeNow = toUTCISOString(now)

    let endTime = ''
    if (publishData.schedulingMode === 'fixed') {
      if (publishData.endTime) {
        try {
          const currentEndDate = fromUTCISOString(publishData.endTime)
          if (currentEndDate > now) {
            endTime = publishData.endTime
          } else {
            const defaultEndDate = new Date(now)
            defaultEndDate.setHours(defaultEndDate.getHours() + 24)
            endTime = toUTCISOString(defaultEndDate)
          }
        } catch {
          const defaultEndDate = new Date(now)
          defaultEndDate.setHours(defaultEndDate.getHours() + 24)
          endTime = toUTCISOString(defaultEndDate)
        }
      } else {
        const defaultEndDate = new Date(now)
        defaultEndDate.setHours(defaultEndDate.getHours() + 24)
        endTime = toUTCISOString(defaultEndDate)
      }
    }

    let resultReleaseAt = publishData.resultReleaseAt
    if (publishData.resultPolicy === 'scheduled') {
      if (!resultReleaseAt) {
        if (publishData.schedulingMode === 'fixed' && endTime) {
          try {
            const endDate = fromUTCISOString(endTime)
            const releaseDate = new Date(endDate)
            releaseDate.setHours(releaseDate.getHours() + 1)
            resultReleaseAt = toUTCISOString(releaseDate)
          } catch {
            const releaseDate = new Date(now)
            releaseDate.setHours(releaseDate.getHours() + 25)
            resultReleaseAt = toUTCISOString(releaseDate)
          }
        } else {
          const releaseDate = new Date(now)
          releaseDate.setHours(releaseDate.getHours() + 1)
          resultReleaseAt = toUTCISOString(releaseDate)
        }
      }
    }

    const publishNowData: UnifiedPublishData = {
      startTime: startTimeNow,
      endTime: endTime,
      schedulingMode: publishData.schedulingMode,
      resultPolicy: publishData.resultPolicy || 'instant',
      resultReleaseAt: resultReleaseAt || ''
    }

    onConfirm(publishNowData)
  }

  const handleClose = () => {
    if (!isProcessing) {
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

  // Calculate minTime for time pickers
  const startTimeMinTime = isSameDay(startDateValue, new Date()) ? new Date() : undefined
  const endTimeMinTime = isSameDay(startDateValue, endDateValue) ? startDateValue : undefined
  const resultReleaseMinTime = isSameDay(endDateValue, resultDateValue) ? endDateValue : (isSameDay(startDateValue, resultDateValue) ? startDateValue : undefined)

  const timePickerSlotProps = {
    dialog: { disablePortal: true },
    timeClock: {
      sx: {
        '.MuiClock-amButton, .MuiClock-pmButton': {
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          '&.Mui-selected': {
            backgroundColor: '#1976d2',
            color: '#fff',
            borderColor: '#1976d2',
          },
          '&:not(.Mui-selected)': {
            backgroundColor: '#f5f5f5',
            color: '#000',
          },
        },
      },
    },
  }


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
          
          <div className="space-y-6 py-4">
            {test && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Test: {test.name}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Label className="flex items-center space-x-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Test Scheduling</span>
              </Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="scheduling" value="fixed" checked={publishData.schedulingMode === 'fixed'} onChange={() => handleSchedulingModeChange('fixed')} className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2"><Calendar className="h-4 w-4 text-gray-600" /><span className="text-sm font-medium">Fixed Time Window</span></div>
                    <p className="text-xs text-gray-500 mt-1">Test has specific start and end times</p>
                  </div>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name="scheduling" value="perpetual" checked={publishData.schedulingMode === 'perpetual'} onChange={() => handleSchedulingModeChange('perpetual')} className="w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2"><Infinity className="h-4 w-4 text-gray-600" /><span className="text-sm font-medium">Perpetual Test</span></div>
                    <p className="text-xs text-gray-500 mt-1">Test starts at a specific time but has no end date</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center space-x-2 text-sm font-semibold">Test Start Date & Time *</Label>
              <div className="grid grid-cols-2 gap-3">
                <MobileDatePicker
                  value={startDateValue}
                  onChange={(newValue) => handleDatePartChange('startTime', newValue)}
                  disablePast
                  slotProps={{ dialog: { disablePortal: true } }}
                />
                <MobileTimePicker
                  value={startDateValue}
                  onChange={(newValue) => handleTimePartChange('startTime', newValue)}
                  minTime={startTimeMinTime}
                  slotProps={timePickerSlotProps}
                />
              </div>
               {errors.startTime && <p className="text-sm text-red-500">{errors.startTime}</p>}
            </div>

            {publishData.schedulingMode === 'fixed' && (
              <div className="space-y-3">
                <Label className="flex items-center space-x-2 text-sm font-semibold">Test End Date & Time *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <MobileDatePicker
                    value={endDateValue}
                    onChange={(newValue) => handleDatePartChange('endTime', newValue)}
                    minDate={startDateValue || new Date()}
                    slotProps={{ dialog: { disablePortal: true } }}
                  />
                  <MobileTimePicker
                    value={endDateValue}
                    onChange={(newValue) => handleTimePartChange('endTime', newValue)}
                    minTime={endTimeMinTime}
                    slotProps={timePickerSlotProps}
                  />
                </div>
                {errors.endTime && <p className="text-sm text-red-500">{errors.endTime}</p>}
              </div>
            )}

            <div className="space-y-3">
              <Label className="flex items-center space-x-2 text-sm font-semibold"><CheckCircle className="h-4 w-4 text-blue-600" /><span>Result Declaration Policy</span></Label>
              <div className="space-y-2">
                <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${publishData.resultPolicy === 'instant' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'} ${publishData.schedulingMode === 'perpetual' ? 'opacity-100' : ''}`}>
                  <input type="radio" name="resultPolicy" value="instant" checked={publishData.resultPolicy === 'instant'} onChange={() => handleResultPolicyChange('instant')} className="w-4 h-4 text-blue-600" disabled={publishData.schedulingMode === 'perpetual'} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-sm font-medium">Instantly on submission</span>{publishData.schedulingMode === 'perpetual' && (<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Auto-selected</span>)}</div>
                    <p className="text-xs text-gray-500 mt-1">Students see results immediately after submitting</p>
                  </div>
                </label>
                {publishData.schedulingMode === 'fixed' && (
                  <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${publishData.resultPolicy === 'scheduled' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="resultPolicy" value="scheduled" checked={publishData.resultPolicy === 'scheduled'} onChange={() => handleResultPolicyChange('scheduled')} className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2"><Clock className="h-4 w-4 text-orange-600" /><span className="text-sm font-medium">At a fixed date/time</span></div>
                      <p className="text-xs text-gray-500 mt-1">Results are released at a specific time</p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {publishData.resultPolicy === 'scheduled' && (
              <div className="space-y-3">
                <Label className="flex items-center space-x-2 text-sm font-semibold">Result Release Date & Time *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <MobileDatePicker
                    value={resultDateValue}
                    onChange={(newValue) => handleDatePartChange('resultReleaseAt', newValue)}
                    minDate={publishData.schedulingMode === 'fixed' ? (endDateValue || new Date()) : (startDateValue || new Date())}
                    slotProps={{ dialog: { disablePortal: true } }}
                  />
                  <MobileTimePicker
                    value={resultDateValue}
                    onChange={(newValue) => handleTimePartChange('resultReleaseAt', newValue)}
                    minTime={resultReleaseMinTime}
                    slotProps={timePickerSlotProps}
                  />
                </div>
                {errors.resultReleaseAt && <p className="text-sm text-red-500">{errors.resultReleaseAt}</p>}
              </div>
            )}

            <div className={`border rounded-lg p-3 ${publishData.schedulingMode === 'perpetual' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start space-x-3">
                {publishData.schedulingMode === 'perpetual' ? <Infinity className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />}
                <div className="text-sm">
                  <p className="font-medium mb-2">{publishData.schedulingMode === 'perpetual' ? 'Perpetual Test Configuration:' : 'Test Configuration:'}</p>
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

          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:space-x-3 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isProcessing} className="w-full sm:w-auto text-sm">Cancel</Button>
            <Button onClick={handlePublishNow} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm"><Zap className="h-4 w-4 mr-2" />{isProcessing ? 'Publishing...' : 'Publish Now'}</Button>
            <Button onClick={handleConfirm} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm">{isProcessing ? 'Publishing...' : 'Confirm & Publish'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LocalizationProvider>
  )
}
