import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { TestManagement } from '@/components/tests/test-management'
import { Plus, FileText } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TestsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="min-h-screen bg-gray-50/30">
          {/* Ultra-Compact Mobile Header */}
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Left Section - Title & Icon */}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 shadow-sm">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-base font-bold text-gray-900 tracking-tight">
                      Mock Tests
                    </h1>
                    <p className="text-xs text-gray-600 font-medium">
                      Create, manage, and schedule competitive mock tests
                    </p>
                  </div>
                </div>
                
                {/* Right Section - Create Button */}
                <div className="flex-shrink-0 ml-3">
                  <Link href="/tests/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm px-3 py-2 h-8 flex items-center justify-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      <span className="font-medium text-xs">New</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content - Perfectly Aligned with Header */}
          <div className="pb-4">
            <TestManagement />
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}


