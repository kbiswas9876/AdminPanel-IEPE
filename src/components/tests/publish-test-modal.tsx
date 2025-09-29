'use client'

import { useState } from 'react'
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
import { Calendar, Clock, AlertCircle, Infinity } from 'lucide-react'
import type { PublishData } from './test-finalization-stage'

interface PublishTestModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (publishData: PublishData) => void
  isProcessing: boolean
}

export function PublishTestModal({
  open,
  onClose,
  onConfirm,
  isProcessing
}: PublishTestModalProps) {
  const [publishData, setPublishData] = useState<PublishData>({
    startTime: '',
    endTime: '',
    resultPolicy: 'instant',
    resultReleaseAt: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Helper function to format datetime-local input value
  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Helper function to parse datetime-local input and create proper Date object
  const parseDateTimeLocal = (value: string): Date => {
    if (!value) return new Date()
    
    // Create date object from the datetime-local value
    // This ensures we're working with the exact date/time the user selected
    const date = new Date(value)
    
    // Validate the date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date')
    }
    
    return date
  }

  const validatePublishData = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!publishData.startTime) {
      newErrors.startTime = 'Start time is required'
    }
    
    // Only require end time if not perpetual
    if (publishData.resultPolicy !== 'perpetual' && !publishData.endTime) {
      newErrors.endTime = 'End time is required'
    }
    
    if (publishData.startTime) {
      try {
        const startDate = parseDateTimeLocal(publishData.startTime)
        
        if (startDate <= new Date()) {
          newErrors.startTime = 'Start time must be in the future'
        }
      } catch {
        newErrors.startTime = 'Invalid start date format'
      }
    }
    
    if (publishData.endTime && publishData.resultPolicy !== 'perpetual') {
      try {
        const startDate = parseDateTimeLocal(publishData.startTime)
        const endDate = parseDateTimeLocal(publishData.endTime)
        
        if (startDate >= endDate) {
          newErrors.endTime = 'End time must be after start time'
        }
      } catch {
        newErrors.endTime = 'Invalid end date format'
      }
    }
    
    if (publishData.resultPolicy === 'scheduled' && !publishData.resultReleaseAt) {
      newErrors.resultReleaseAt = 'Result release date is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirm = () => {
    if (validatePublishData()) {
      // Ensure we pass the exact datetime values the user selected
      const processedData: PublishData = {
        ...publishData,
        // For perpetual tests, set endTime to null or empty
        endTime: publishData.resultPolicy === 'perpetual' ? '' : publishData.endTime
      }
      onConfirm(processedData)
    }
  }

  const updatePublishData = (field: keyof PublishData, value: string) => {
    setPublishData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      setPublishData({ startTime: '', endTime: '', resultPolicy: 'instant', resultReleaseAt: '' })
      setErrors({})
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span>Publish Test</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Set the active window for your test. Students will only be able to take the test during this time period.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Result policy */}
          <div className="space-y-3">
            <Label className="text-xs sm:text-sm font-semibold">Result Declaration Policy</Label>
            <label className="flex items-center space-x-3">
              <input 
                type="radio" 
                name="policy" 
                value="instant" 
                checked={publishData.resultPolicy === 'instant'} 
                onChange={() => setPublishData((p) => ({ ...p, resultPolicy: 'instant', resultReleaseAt: '' }))} 
                className="w-4 h-4 text-blue-600" 
              />
              <span className="text-xs sm:text-sm">Instantly on submission</span>
            </label>
            <label className="flex items-center space-x-3">
              <input 
                type="radio" 
                name="policy" 
                value="scheduled" 
                checked={publishData.resultPolicy === 'scheduled'} 
                onChange={() => setPublishData((p) => ({ ...p, resultPolicy: 'scheduled' }))} 
                className="w-4 h-4 text-blue-600" 
              />
              <span className="text-xs sm:text-sm">At a fixed date/time</span>
            </label>
            {publishData.resultPolicy === 'scheduled' && (
              <div className="ml-7 space-y-2">
                <Label htmlFor="result-release" className="text-xs sm:text-sm">Result Release Date & Time *</Label>
                <Input 
                  id="result-release" 
                  type="datetime-local" 
                  value={publishData.resultReleaseAt || ''} 
                  onChange={(e) => setPublishData((p) => ({ ...p, resultReleaseAt: e.target.value }))} 
                  className="text-xs sm:text-sm" 
                />
                {errors.resultReleaseAt && (
                  <p className="text-xs sm:text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.resultReleaseAt}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Test Scheduling Options */}
          <div className="space-y-3">
            <Label className="text-xs sm:text-sm font-semibold">Test Scheduling</Label>
            
            {/* Fixed Time Window */}
            <label className="flex items-center space-x-3">
              <input 
                type="radio" 
                name="scheduling" 
                value="fixed" 
                checked={publishData.resultPolicy !== 'perpetual'} 
                onChange={() => setPublishData((p) => ({ ...p, resultPolicy: p.resultPolicy === 'perpetual' ? 'instant' : p.resultPolicy }))} 
                className="w-4 h-4 text-blue-600" 
              />
              <span className="text-xs sm:text-sm">Fixed Time Window (Start and End Date)</span>
            </label>
            
            {/* Perpetual Test */}
            <label className="flex items-center space-x-3">
              <input 
                type="radio" 
                name="scheduling" 
                value="perpetual" 
                checked={publishData.resultPolicy === 'perpetual'} 
                onChange={() => setPublishData((p) => ({ ...p, resultPolicy: 'perpetual', endTime: '' }))} 
                className="w-4 h-4 text-blue-600" 
              />
              <span className="text-xs sm:text-sm flex items-center space-x-1">
                <Infinity className="h-3 w-3" />
                <span>Perpetual Test (No End Date)</span>
              </span>
            </label>
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="start-time" className="flex items-center space-x-2 text-xs sm:text-sm">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Test Start Date & Time *</span>
            </Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={publishData.startTime}
              onChange={(e) => updatePublishData('startTime', e.target.value)}
              className={`text-xs sm:text-sm ${errors.startTime ? 'border-red-300' : ''}`}
            />
            {errors.startTime && (
              <p className="text-xs sm:text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.startTime}</span>
              </p>
            )}
          </div>

          {/* End Time - Only show if not perpetual */}
          {publishData.resultPolicy !== 'perpetual' && (
            <div className="space-y-2">
              <Label htmlFor="end-time" className="flex items-center space-x-2 text-xs sm:text-sm">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Test End Date & Time *</span>
              </Label>
              <Input
                id="end-time"
                type="datetime-local"
                value={publishData.endTime}
                onChange={(e) => updatePublishData('endTime', e.target.value)}
                className={`text-xs sm:text-sm ${errors.endTime ? 'border-red-300' : ''}`}
              />
              {errors.endTime && (
                <p className="text-xs sm:text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.endTime}</span>
                </p>
              )}
            </div>
          )}

          {/* Perpetual Test Info */}
          {publishData.resultPolicy === 'perpetual' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Infinity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-green-800">
                  <p className="font-medium mb-1">Perpetual Test:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Test will be available from the start date onwards</li>
                    <li>• No end date - students can take it anytime after start</li>
                    <li>• Perfect for practice tests and open-ended assignments</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Mobile-Optimized Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-blue-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Students can only access the test during the specified time window</li>
                  <li>• The test will automatically close when the end time is reached (unless perpetual)</li>
                  <li>• Make sure to set appropriate time limits for your test duration</li>
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