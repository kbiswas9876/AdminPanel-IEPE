import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { BookManager } from '@/components/books/book-manager'
import { Card, CardContent } from '@/components/ui/card'
import { Library } from 'lucide-react'

export default function BooksPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Book Manager
              </h1>
              <p className="mt-3 text-lg text-gray-600 font-medium">
                Manage book sources for your question bank.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                <Library className="h-6 w-6 text-blue-600" />
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



