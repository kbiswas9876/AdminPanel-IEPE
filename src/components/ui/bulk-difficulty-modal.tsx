'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tag, Loader2 } from 'lucide-react'
import { bulkUpdateDifficulty } from '@/lib/actions/questions'
import { toast } from 'sonner'

interface BulkDifficultyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  selectedQuestionIds: number[]
  onUpdated: () => void
}

const DIFFICULTY_OPTIONS = [
  { value: 'Easy', label: 'Easy' },
  { value: 'Easy-Moderate', label: 'Easy-Moderate' },
  { value: 'Moderate', label: 'Moderate' },
  { value: 'Moderate-Hard', label: 'Moderate-Hard' },
  { value: 'Hard', label: 'Hard' }
]

export function BulkDifficultyModal({
  open,
  onOpenChange,
  selectedCount,
  selectedQuestionIds,
  onUpdated
}: BulkDifficultyModalProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleApplyChanges = async () => {
    if (!selectedDifficulty) return

    setIsUpdating(true)
    try {
      const result = await bulkUpdateDifficulty(
        selectedQuestionIds,
        selectedDifficulty as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard'
      )

      if (result.success) {
        toast.success(result.message, { duration: 2000 })
        onUpdated()
        onOpenChange(false)
        setSelectedDifficulty('')
      } else {
        toast.error(result.message, { duration: 5000 })
      }
    } catch (error) {
      console.error('Error updating difficulty:', error)
      toast.error('Failed to update question difficulties. Please try again.', { duration: 5000 })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    setSelectedDifficulty('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-orange-600" />
            Bulk Update Difficulty
          </DialogTitle>
          <DialogDescription className="text-base">
            You have selected <strong>{selectedCount}</strong> question{selectedCount !== 1 ? 's' : ''}. 
            Choose a new difficulty level to apply to all selected questions.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <label htmlFor="difficulty-select" className="text-sm font-medium text-gray-700">
              New Difficulty Level
            </label>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger id="difficulty-select" className="w-full">
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUpdating}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApplyChanges}
            disabled={!selectedDifficulty || isUpdating}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Apply Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
