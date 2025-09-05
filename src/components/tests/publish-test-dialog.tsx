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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'
import type { Test } from '@/lib/supabase/admin'

interface PublishTestDialogProps {
  test: Test
  onPublish: () => void
}

export function PublishTestDialog({ test, onPublish }: PublishTestDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const handlePublish = async () => {
    if (!startTime || !endTime) {
      alert('Please select both start and end times')
      return
    }

    if (new Date(startTime) >= new Date(endTime)) {
      alert('End time must be after start time')
      return
    }

    setIsPublishing(true)
    try {
      const result = await publishTest(test.id, startTime, endTime)
      
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

  // Set default times (1 hour from now for start, 2 hours from now for end)
  const setDefaultTimes = () => {
    const now = new Date()
    const start = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
    
    setStartTime(start.toISOString().slice(0, 16))
    setEndTime(end.toISOString().slice(0, 16))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Calendar className="h-4 w-4 mr-1" />
          Publish
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Publish Mock Test</DialogTitle>
          <DialogDescription>
            Schedule this test to make it available to students. Set the start and end times for the test window.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="test-name">Test Name</Label>
            <Input
              id="test-name"
              value={test.name}
              disabled
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time</Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-time">End Time</Label>
            <Input
              id="end-time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              min={startTime || new Date().toISOString().slice(0, 16)}
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={setDefaultTimes}
            >
              Set Default Times
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing || !startTime || !endTime}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPublishing ? 'Publishing...' : 'Publish Test'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


