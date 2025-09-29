'use client'

import { useState } from 'react'
import { publishTest } from '@/lib/actions/tests'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Calendar, Loader2 } from 'lucide-react'
import { UnifiedPublishModal, type UnifiedPublishData } from './unified-publish-modal'
import type { Test } from '@/lib/supabase/admin'

interface PublishTestDialogProps {
  test: Test
  onPublish: () => void
}

export function PublishTestDialog({ test, onPublish }: PublishTestDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublish = async (publishData: UnifiedPublishData) => {
    setIsPublishing(true)
    try {
      const result = await publishTest(
        test.id,
        publishData.startTime, // Always set start time
        publishData.schedulingMode === 'perpetual' ? null : publishData.endTime, // Only set end time for non-perpetual
        publishData.resultPolicy,
        publishData.resultPolicy === 'scheduled' ? (publishData.resultReleaseAt || null) : null
      )
      
      if (result.success) {
        setOpen(false)
        onPublish()
      } else {
        console.error('Publish failed:', result.message)
        alert(result.message)
      }
    } catch (error) {
      console.error('Error publishing test:', error)
      alert('An error occurred while publishing the test')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 px-5 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors duration-150 shadow-sm hover:shadow-md rounded-lg">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <span>Publish</span>
          </Button>
        </DialogTrigger>
      </Dialog>
      
      {/* Use the unified modal */}
      <UnifiedPublishModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handlePublish}
        isProcessing={isPublishing}
        test={test}
        mode="edit"
      />
    </>
  )
}