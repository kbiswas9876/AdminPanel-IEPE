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
import { Calendar, Loader2 } from 'lucide-react'
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
  const [perpetual, setPerpetual] = useState(false)
  const [policy, setPolicy] = useState<'instant' | 'scheduled'>('instant')
  const [releaseAt, setReleaseAt] = useState('')

  const handlePublish = async () => {
    if (!perpetual) {
      if (!startTime || !endTime) {
        alert('Please select both start and end times')
        return
      }
      if (new Date(startTime) >= new Date(endTime)) {
        alert('End time must be after start time')
        return
      }
    }

    setIsPublishing(true)
    try {
      const result = await publishTest(
        test.id,
        perpetual ? null : startTime,
        perpetual ? null : endTime,
        policy,
        policy === 'scheduled' ? (releaseAt || null) : null
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
        <Button size="sm" className="h-7 px-2.5 text-xs font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transition-all duration-200 shadow-sm hover:shadow-md">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Publish</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
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

          {/* Result policy and release time */}
          <div className="space-y-3">
            <Label className="text-sm">Result Declaration Policy</Label>
            <label className="flex items-center space-x-3">
              <input type="radio" name="policy" value="instant" checked={policy==='instant'} onChange={() => setPolicy('instant')} className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Instantly on submission</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="radio" name="policy" value="scheduled" checked={policy==='scheduled'} onChange={() => setPolicy('scheduled')} className="w-4 h-4 text-blue-600" />
              <span className="text-sm">At a fixed date/time</span>
            </label>
            {policy==='scheduled' && (
              <div className="ml-7 space-y-2">
                <Label htmlFor="release-at">Result Release Date & Time *</Label>
                <Input id="release-at" type="datetime-local" value={releaseAt} onChange={(e)=>setReleaseAt(e.target.value)} />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time</Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              disabled={perpetual}
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
              disabled={perpetual}
            />
          </div>

          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={perpetual} onChange={(e)=>setPerpetual(e.target.checked)} />
            <span className="text-sm">Perpetual (available indefinitely)</span>
          </label>
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={setDefaultTimes}
              className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
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
            className="hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing || !startTime || !endTime}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            {isPublishing ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-75 animate-pulse"></div>
                <Loader2 className="h-4 w-4 mr-2 animate-spin relative z-10" />
                <span className="relative z-10">Publishing...</span>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative z-10">Publish Test</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


