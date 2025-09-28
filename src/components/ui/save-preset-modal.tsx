'use client'

import React, { useState, useEffect } from 'react'
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
import { Save, X, Sparkles } from 'lucide-react'

interface SavePresetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string) => void
  existingPresets: string[]
}

export function SavePresetModal({
  open,
  onOpenChange,
  onSave,
  existingPresets
}: SavePresetModalProps) {
  const [presetName, setPresetName] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setPresetName('')
      setErrorMessage('')
      setIsValid(false)
    }
  }, [open])

  // Validate preset name
  useEffect(() => {
    if (!presetName.trim()) {
      setIsValid(false)
      setErrorMessage('')
      return
    }

    const trimmedName = presetName.trim()
    if (trimmedName.length < 2) {
      setIsValid(false)
      setErrorMessage('Preset name must be at least 2 characters long')
      return
    }

    if (trimmedName.length > 50) {
      setIsValid(false)
      setErrorMessage('Preset name must be less than 50 characters')
      return
    }

    if (existingPresets.includes(trimmedName)) {
      setIsValid(false)
      setErrorMessage('A preset with this name already exists')
      return
    }

    setIsValid(true)
    setErrorMessage('')
  }, [presetName, existingPresets])

  const handleSave = () => {
    if (isValid) {
      onSave(presetName.trim())
      onOpenChange(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleSave()
    } else if (e.key === 'Escape') {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-md opacity-20" />
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2 shadow-lg">
                <Save className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Save Filter Preset
              </DialogTitle>
              <DialogDescription className="text-gray-600 font-medium">
                Create a reusable filter combination for quick access
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="preset-name" className="text-sm font-semibold text-gray-900">
              Preset Name
            </Label>
            <div className="relative">
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a descriptive name..."
                className="pl-4 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md focus:shadow-md focus:border-blue-300/50 transition-all duration-200 text-sm font-medium"
                autoFocus
              />
              {isValid && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>
              )}
            </div>
            
            {errorMessage && (
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                <X className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            
            {isValid && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <Sparkles className="h-4 w-4 flex-shrink-0" />
                <span>Perfect! This name is available</span>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Current Filters</span>
            </div>
            <p className="text-xs text-blue-700 font-medium">
              Your current filter selections will be saved as "{presetName.trim() || 'Untitled Preset'}"
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6 py-2 border border-gray-200/50 hover:border-gray-300/50 bg-white/80 hover:bg-gray-50 transition-all duration-200 rounded-xl font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Preset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
