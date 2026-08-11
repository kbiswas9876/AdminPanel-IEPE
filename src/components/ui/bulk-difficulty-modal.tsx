'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ 
            duration: 0.15, 
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          <DialogHeader>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.1 }}
            >
              <DialogTitle className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <Tag className="h-5 w-5 text-orange-600" />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.1 }}
                >
                  Bulk Update Difficulty
                </motion.span>
              </DialogTitle>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.1 }}
            >
              <DialogDescription className="text-base">
                You have selected <strong>{selectedCount}</strong> question{selectedCount !== 1 ? 's' : ''}. 
                Choose a new difficulty level to apply to all selected questions.
              </DialogDescription>
            </motion.div>
          </DialogHeader>

          <motion.div 
            className="py-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.1 }}
          >
            <div className="space-y-2">
              <motion.label 
                htmlFor="difficulty-select" 
                className="text-sm font-medium text-gray-700"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.1 }}
              >
                New Difficulty Level
              </motion.label>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.1 }}
              >
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger id="difficulty-select" className="w-full">
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    <AnimatePresence mode="wait">
                      {DIFFICULTY_OPTIONS.map((option, index) => (
                        <motion.div
                          key={option.value}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{ 
                            duration: 0.05, 
                            delay: index * 0.01,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }}
                        >
                          <SelectItem value={option.value}>
                            {option.label}
                          </SelectItem>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </SelectContent>
                </Select>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.1 }}
          >
            <DialogFooter className="gap-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
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
              </motion.div>
            </DialogFooter>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
