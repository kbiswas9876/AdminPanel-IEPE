import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { BookManager } from '@/components/books/book-manager'

export default function BooksPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Book Manager
            </h1>
            <p className="mt-2 text-gray-600">
              Manage book sources for your question bank.
            </p>
          </div>
          
          <BookManager />
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}

