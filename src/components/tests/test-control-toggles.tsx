'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { updateTestControlSettings } from '@/lib/actions/tests'
import { Pause, Timer } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { Test } from '@/lib/supabase/admin'

interface TestControlTogglesProps {
  test: Test
  onUpdate: () => void
}

export function TestControlToggles({ test, onUpdate }: TestControlTogglesProps) {
  const [allowPausing, setAllowPausing] = useState(test.allow_pausing ?? false)
  const [showInQuestionTimer, setShowInQuestionTimer] = useState(test.show_in_question_timer ?? false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async (setting: 'allow_pausing' | 'show_in_question_timer', value: boolean) => {
    setIsUpdating(true)
    try {
      const result = await updateTestControlSettings(test.id, { [setting]: value })
      
      if (result.success) {
        // Update local state
        if (setting === 'allow_pausing') {
          setAllowPausing(value)
        } else {
          setShowInQuestionTimer(value)
        }
        
        // Refresh the parent component
        onUpdate()
        
        toast({
          title: "Settings Updated",
          description: `${setting === 'allow_pausing' ? 'Pause' : 'Timer'} setting updated successfully`,
        })
      } else {
        toast({
          title: "Update Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating test settings:', error)
      toast({
        title: "Update Failed",
        description: "An error occurred while updating settings",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-3 p-3 bg-gray-50/50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center">
          <Pause className="h-3 w-3 text-white" />
        </div>
        <h4 className="text-sm font-semibold text-gray-900">Test Controls</h4>
      </div>
      
      {/* Allow Pausing Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pause className="h-4 w-4 text-gray-500" />
          <Label className="text-sm font-medium text-gray-700">Allow Pausing</Label>
        </div>
        <Switch
          checked={allowPausing}
          onCheckedChange={(checked) => handleToggle('allow_pausing', checked)}
          disabled={isUpdating}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>

      {/* Show In-Question Timer Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-gray-500" />
          <Label className="text-sm font-medium text-gray-700">Show Timer</Label>
        </div>
        <Switch
          checked={showInQuestionTimer}
          onCheckedChange={(checked) => handleToggle('show_in_question_timer', checked)}
          disabled={isUpdating}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>
    </div>
  )
}
