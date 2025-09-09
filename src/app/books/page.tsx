import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { BookManager } from '@/components/books/book-manager'
import { Card, CardContent } from '@/components/ui/card'
import { Library } from 'lucide-react'

export default function BooksPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 lg:space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="mobile-text-xl font-bold text-gray-900 tracking-tight">
                Book Manager
              </h1>
              <p className="mt-2 sm:mt-3 mobile-text-sm text-gray-600 font-medium">
                Manage book sources for your question bank.
              </p>
            </div>
            <div className="flex items-center justify-center sm:justify-end">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                <Library className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-gray-200/50 overflow-hidden">
            <CardContent className="p-0">
              <BookManager />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}



