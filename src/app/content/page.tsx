import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ContentManagement } from '@/components/content/content-management'
import { BulkImport } from '@/components/content/bulk-import'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function ContentPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Content Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage and view all questions in the master question bank.
            </p>
          </div>
          
          <Tabs defaultValue="manage" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage">Manage Questions</TabsTrigger>
              <TabsTrigger value="import">Bulk Import</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manage" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Individual Question Management
                  </h2>
                  <p className="text-sm text-gray-600">
                    Add, edit, and delete individual questions.
                  </p>
                </div>
                <Link href="/content/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Question
                  </Button>
                </Link>
              </div>
              <ContentManagement />
            </TabsContent>
            
            <TabsContent value="import" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Bulk Import Questions
                </h2>
                <p className="text-sm text-gray-600">
                  Import hundreds of questions at once using a CSV file.
                </p>
              </div>
              <BulkImport />
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
