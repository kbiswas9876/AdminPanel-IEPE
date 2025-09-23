import { ContentManagement } from '@/components/content/ContentManagement'
import { BulkImport } from '@/components/content/bulk-import'
import NewBulkUpload from '@/components/content/new-bulk-upload'
import { Button } from '@/components/ui/button'
import { SmoothTabs, SmoothTabsContent, SmoothTabsList, SmoothTabsTrigger } from '@/components/ui/smooth-tabs'
import Link from 'next/link'
import { Plus, BookOpen, Upload, Database, Zap } from 'lucide-react'

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-full">
        {/* Compact Header */}
        <div className="bg-white border-b px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Question Management</h1>
            </div>
            <Link href="/content/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </Button>
            </Link>
          </div>
        </div>
      
        {/* Main Content - Full Height */}
        <div className="flex-1 min-h-0">
          <SmoothTabs defaultValue="manage" className="h-full flex flex-col">
            <div className="flex-shrink-0 border-b bg-white">
              <SmoothTabsList className="grid w-full grid-cols-3 bg-transparent h-10">
                <SmoothTabsTrigger value="manage" className="text-sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage
                </SmoothTabsTrigger>
                <SmoothTabsTrigger value="import" className="text-sm">
                  <Upload className="h-4 w-4 mr-2" />
                  CSV Import
                </SmoothTabsTrigger>
                <SmoothTabsTrigger value="new-import" className="text-sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Advanced
                </SmoothTabsTrigger>
              </SmoothTabsList>
            </div>
            
            <SmoothTabsContent value="manage" className="flex-1 min-h-0 m-0">
              <ContentManagement />
            </SmoothTabsContent>
            
                <SmoothTabsContent value="import" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
                  <div className="border-b border-white/30 pb-4 sm:pb-6">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg sm:rounded-xl blur-sm opacity-60 pointer-events-none"></div>
                        <div className="relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 shadow-lg">
                          <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                          CSV Bulk Import (Legacy)
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                          Import questions using CSV format with basic validation.
                        </p>
                      </div>
                    </div>
                  </div>
                  <BulkImport />
                </SmoothTabsContent>

                <SmoothTabsContent value="new-import" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
                  <div className="border-b border-white/30 pb-4 sm:pb-6">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg sm:rounded-xl blur-sm opacity-60 pointer-events-none"></div>
                        <div className="relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 shadow-lg">
                          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                          Advanced Bulk Import (Recommended)
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                          Upload questions in JSONL, Parquet, or CSV format with advanced validation, progress tracking, and LaTeX-safe processing.
                        </p>
                      </div>
                    </div>
                  </div>
                  <NewBulkUpload />
                </SmoothTabsContent>
            </SmoothTabs>
            </div>
          </div>
        </div>
  )
}
