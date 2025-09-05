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
import { bulkUpdateQuestionTags } from '@/lib/actions/bulk-tagging'
import { toast } from 'sonner'
import { Tag, Plus, Minus } from 'lucide-react'

interface BulkTagManagementModalProps {
  isOpen: boolean
  onClose: () => void
  selectedQuestionIds: number[]
  selectedCount: number
  onSuccess: () => void
}

export function BulkTagManagementModal({
  isOpen,
  onClose,
  selectedQuestionIds,
  selectedCount,
  onSuccess,
}: BulkTagManagementModalProps) {
  const [addTags, setAddTags] = useState('')
  const [removeTags, setRemoveTags] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!addTags.trim() && !removeTags.trim()) {
      toast.error('Please specify tags to add or remove')
      return
    }

    setIsLoading(true)
    try {
      const result = await bulkUpdateQuestionTags(
        selectedQuestionIds,
        addTags.trim(),
        removeTags.trim()
      )

      if (result.success) {
        toast.success(result.message)
        onSuccess()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error updating tags:', error)
      toast.error('An unexpected error occurred while updating tags')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setAddTags('')
    setRemoveTags('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Managing Tags for {selectedCount} Selected Question{selectedCount !== 1 ? 's' : ''}
          </DialogTitle>
          <DialogDescription>
            Add or remove tags from the selected questions. Use commas to separate multiple tags.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add Tags Section */}
          <div className="space-y-2">
            <Label htmlFor="add-tags" className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-green-600" />
              Add Tags
            </Label>
            <Input
              id="add-tags"
              placeholder="e.g., Election Based, New Pattern, Tricky"
              value={addTags}
              onChange={(e) => setAddTags(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              These tags will be added to all selected questions (duplicates will be ignored)
            </p>
          </div>

          {/* Remove Tags Section */}
          <div className="space-y-2">
            <Label htmlFor="remove-tags" className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-red-600" />
              Remove Tags
            </Label>
            <Input
              id="remove-tags"
              placeholder="e.g., Old Pattern, Deprecated"
              value={removeTags}
              onChange={(e) => setRemoveTags(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              These tags will be removed from all selected questions
            </p>
          </div>

          {/* Preview Section */}
          {(addTags.trim() || removeTags.trim()) && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="rounded-md border p-3 bg-gray-50">
                {addTags.trim() && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-green-600">Adding:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {addTags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {removeTags.trim() && (
                  <div>
                    <span className="text-xs font-medium text-red-600">Removing:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {removeTags.split(',').map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || (!addTags.trim() && !removeTags.trim())}>
            {isLoading ? 'Applying Changes...' : 'Apply Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
