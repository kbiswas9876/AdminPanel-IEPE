import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ContentManagement } from '@/components/content/ContentManagement'
import { BulkImport } from '@/components/content/bulk-import'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, BookOpen, Upload, Target, Database } from 'lucide-react'

export default function ContentPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
          <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
            {/* Premium Header Section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-indigo-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700 pointer-events-none"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/30 shadow-2xl shadow-blue-500/10 hover:shadow-3xl hover:shadow-blue-500/20 transition-all duration-500 p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-6 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl sm:rounded-2xl blur-sm opacity-60 pointer-events-none"></div>
                        <div className="relative p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 shadow-lg">
                          <Database className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent tracking-tight">
                          Content Management
                        </h1>
                        <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg text-gray-600 font-medium">
                          Manage and view all questions in the master question bank with precision and ease.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <Link href="/content/new" className="w-full sm:w-auto">
                      <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 w-full sm:w-auto hover:scale-105 active:scale-95">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                        <Plus className="mr-2 h-4 w-4 relative z-10" />
                        <span className="text-sm sm:text-base font-semibold relative z-10">Add New Question</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          
            {/* Premium Main Content */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-indigo-400/10 to-blue-400/10 rounded-2xl sm:rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700 pointer-events-none"></div>
              <Card className="relative border-0 bg-white/90 backdrop-blur-xl shadow-2xl shadow-purple-500/10 overflow-hidden rounded-2xl sm:rounded-3xl">
                <CardContent className="p-0">
                  <Tabs defaultValue="manage" className="w-full">
                    <div className="border-b border-white/30 bg-gradient-to-r from-white/90 via-purple-50/50 to-indigo-50/50">
                      <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
                        <TabsTrigger 
                          value="manage" 
                          className="group relative flex items-center justify-center space-x-2 px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm font-semibold data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-300 hover:bg-white/50"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 relative z-10" />
                          <span className="hidden sm:inline relative z-10">Manage Questions</span>
                          <span className="sm:hidden relative z-10">Manage</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="import"
                          className="group relative flex items-center justify-center space-x-2 px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm font-semibold data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all duration-300 hover:bg-white/50"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          <Upload className="h-3 w-3 sm:h-4 sm:w-4 relative z-10" />
                          <span className="hidden sm:inline relative z-10">Bulk Import</span>
                          <span className="sm:hidden relative z-10">Import</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>
                
                    <TabsContent value="manage" className="flex flex-col h-[calc(100vh-200px)] sm:h-[calc(100vh-280px)] m-0">
                      <div className="flex-shrink-0 p-4 sm:p-6 border-b border-white/30 bg-gradient-to-r from-white/90 via-purple-50/30 to-indigo-50/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg sm:rounded-xl blur-sm opacity-60 pointer-events-none"></div>
                              <div className="relative p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 shadow-lg">
                                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                              </div>
                            </div>
                            <div>
                              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                                Individual Question Management
                              </h2>
                              <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                                Add, edit, and delete individual questions with precision and advanced filtering.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-h-0 p-4 sm:p-6">
                        <ContentManagement />
                      </div>
                    </TabsContent>
                
                    <TabsContent value="import" className="space-y-4 sm:space-y-6 m-0 p-4 sm:p-6">
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
                              Bulk Import Questions
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                              Import hundreds of questions at once using a CSV file with advanced validation.
                            </p>
                          </div>
                        </div>
                      </div>
                      <BulkImport />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
