'use client'

import { useState } from 'react'
import { TestManagement } from '@/components/tests/test-management'
import { TestCreationOptionsModal } from '@/components/tests/test-creation-options-modal'
import { Plus, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import type { Question } from '@/lib/types'

export default function TestsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  const handleBlueprintSelect = () => {
    setShowCreateModal(false)
    // Clear any existing editingTestId to ensure we're in create mode
    localStorage.removeItem('editingTestId')
    router.push('/tests/new')
  }

  const handleQuestionBankSelect = (questions: Question[]) => {
    setShowCreateModal(false)
    // Clear any existing editingTestId to ensure we're in create mode
    localStorage.removeItem('editingTestId')
    // Store the selected questions in localStorage for the Review & Refine page
    localStorage.setItem('selectedTestQuestions', JSON.stringify(questions))
    // Navigate to the Review & Refine page
    router.push('/tests/review-and-refine')
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Premium Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-br from-slate-50 via-white to-slate-50/80 backdrop-blur-xl border-b border-slate-200/60 shadow-lg shadow-slate-200/20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section - Title & Icon */}
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div className="flex-shrink-0 p-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/25">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                  Mock Tests
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Create, manage, and schedule competitive assessments
                </p>
              </div>
            </div>
            
            {/* Right Section - Create Button */}
            <div className="flex-shrink-0 ml-4">
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-sm px-6 py-3 h-11 flex items-center justify-center gap-2 rounded-xl font-bold"
              >
                <Plus className="h-4 w-4" />
                <span className="font-bold">Create Test</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content - Perfectly Aligned with Header */}
      <div className="pb-4">
        <TestManagement onCreateTest={() => setShowCreateModal(true)} />
      </div>

      {/* Create New Test Modal */}
      <TestCreationOptionsModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onBlueprintSelect={handleBlueprintSelect}
        onQuestionBankSelect={handleQuestionBankSelect}
      />
    </div>
  )
}

