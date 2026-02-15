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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Premium Header Section - Apple Style */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-200/60 ring-1 ring-black/5">
                <ClipboardList className="h-7 w-7 text-gray-900" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight">
                  Mock Tests
                </h1>
                <p className="mt-1 text-base text-gray-500">
                  Create, manage, and schedule competitive assessments
                </p>
              </div>
            </div>
            
            {/* Create Button */}
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="h-11 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow"
            >
              <Plus className="h-4 w-4 mr-2" strokeWidth={2} />
              Create Test
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
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

