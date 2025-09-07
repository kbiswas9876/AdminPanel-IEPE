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
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Content Management
              </h1>
              <p className="mt-3 text-lg text-gray-600 font-medium">
                Manage and view all questions in the master question bank.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/content/new">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Question
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
                      className="flex items-center space-x-2 px-6 py-4 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-200"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Manage Questions</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="import"
                      className="flex items-center space-x-2 px-6 py-4 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-200"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Bulk Import</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="manage" className="flex flex-col h-[calc(100vh-280px)] m-0">
                  <div className="flex-shrink-0 p-6 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/30 to-white/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                          Individual Question Management
                        </h2>
                        <p className="text-sm text-gray-600 font-medium mt-1">
                          Add, edit, and delete individual questions with precision.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 p-6">
                    <ContentManagement />
                  </div>
                </TabsContent>
                
                <TabsContent value="import" className="space-y-6 m-0 p-6">
                  <div className="border-b border-gray-100/50 pb-6">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                      Bulk Import Questions
                    </h2>
                    <p className="text-sm text-gray-600 font-medium mt-1">
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
