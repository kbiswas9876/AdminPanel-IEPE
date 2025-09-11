import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ContentManagement } from '@/components/content/content-management'
import { BulkImport } from '@/components/content/bulk-import'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, BookOpen, Upload } from 'lucide-react'

export default function ContentPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                Content Management
              </h1>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg text-gray-600 font-medium">
                Manage and view all questions in the master question bank.
              </p>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Link href="/content/new" className="w-full sm:w-auto">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Add New Question</span>
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Main Content */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-gray-200/50 overflow-hidden">
            <CardContent className="p-0">
              <Tabs defaultValue="manage" className="w-full">
                <div className="border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
                    <TabsTrigger 
                      value="manage" 
                      className="flex items-center justify-center space-x-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-200"
                    >
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Manage Questions</span>
                      <span className="sm:hidden">Manage</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="import"
                      className="flex items-center justify-center space-x-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-200"
                    >
                      <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Bulk Import</span>
                      <span className="sm:hidden">Import</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="manage" className="flex flex-col h-[calc(100vh-200px)] sm:h-[calc(100vh-280px)] m-0">
                  <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/30 to-white/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                          Individual Question Management
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                          Add, edit, and delete individual questions with precision.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 p-4 sm:p-6">
                    <ContentManagement />
                  </div>
                </TabsContent>
                
                <TabsContent value="import" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
                  <div className="border-b border-gray-100/50 pb-4 sm:pb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                      Bulk Import Questions
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                      Import hundreds of questions at once using a CSV file.
                    </p>
                  </div>
                  <BulkImport />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
