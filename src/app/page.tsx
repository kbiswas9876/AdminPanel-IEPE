import { MainLayout } from '@/components/layout/main-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function Home() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to the Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your application from this secure admin panel.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dashboard Overview
              </h3>
              <p className="text-gray-600">
                This is your main dashboard. Future features will be added here.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quick Actions
              </h3>
              <p className="text-gray-600">
                Common administrative tasks will be available here.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                System Status
              </h3>
              <p className="text-gray-600">
                Monitor system health and performance metrics.
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}