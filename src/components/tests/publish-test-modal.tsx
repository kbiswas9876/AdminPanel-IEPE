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
import { Calendar, Clock, AlertCircle } from 'lucide-react'
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
    endTime: ''
  })
  const [resultPolicy, setResultPolicy] = useState<'instant' | 'scheduled'>('instant')
  const [resultReleaseAt, setResultReleaseAt] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validatePublishData = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!publishData.startTime) {
      newErrors.startTime = 'Start time is required'
    }
    
    if (!publishData.endTime) {
      newErrors.endTime = 'End time is required'
    }
    
    if (publishData.startTime && publishData.endTime) {
      const startDate = new Date(publishData.startTime)
      const endDate = new Date(publishData.endTime)
      
      if (startDate >= endDate) {
        newErrors.endTime = 'End time must be after start time'
      }
      
      if (startDate <= new Date()) {
        newErrors.startTime = 'Start time must be in the future'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirm = () => {
    if (validatePublishData()) {
      // Extend publish payload by putting result policy in the server call via parent
      onConfirm({ ...publishData })
      // Parent already has form data; policy is controlled there when saving/publishing
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
      setPublishData({ startTime: '', endTime: '' })
      setErrors({})
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Publish Test</span>
          </DialogTitle>
          <DialogDescription>
            Set the active window for your test. Students will only be able to take the test during this time period.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Result policy */}
          <div className="space-y-3">
            <Label className="text-sm">Result Declaration Policy</Label>
            <label className="flex items-center space-x-3">
              <input type="radio" name="policy" value="instant" checked={resultPolicy==='instant'} onChange={() => setResultPolicy('instant')} className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Instantly on submission</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="radio" name="policy" value="scheduled" checked={resultPolicy==='scheduled'} onChange={() => setResultPolicy('scheduled')} className="w-4 h-4 text-blue-600" />
              <span className="text-sm">At a fixed date/time</span>
            </label>
            {resultPolicy==='scheduled' && (
              <div className="ml-7 space-y-2">
                <Label htmlFor="result-release">Result Release Date & Time *</Label>
                <Input id="result-release" type="datetime-local" value={resultReleaseAt} onChange={(e)=>setResultReleaseAt(e.target.value)} />
              </div>
            )}
          </div>
          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="start-time" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Test Start Date & Time *</span>
            </Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={publishData.startTime}
              onChange={(e) => updatePublishData('startTime', e.target.value)}
              className={errors.startTime ? 'border-red-300' : ''}
            />
            {errors.startTime && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.startTime}</span>
              </p>
            )}
          </div>

          {/* End Time */}
          <div className="space-y-2">
            <Label htmlFor="end-time" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Test End Date & Time *</span>
            </Label>
            <Input
              id="end-time"
              type="datetime-local"
              value={publishData.endTime}
              onChange={(e) => updatePublishData('endTime', e.target.value)}
              className={errors.endTime ? 'border-red-300' : ''}
            />
            {errors.endTime && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.endTime}</span>
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Students can only access the test during the specified time window</li>
                  <li>• The test will automatically close when the end time is reached</li>
                  <li>• Make sure to set appropriate time limits for your test duration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? 'Publishing...' : 'Confirm & Publish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

