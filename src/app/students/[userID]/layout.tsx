import { getStudentSummary } from '@/lib/actions/studentAnalyticsActions'
import Link from 'next/link'
import { notFound } from 'next/navigation' 
import { NavigationTabs } from './NavigationTabs'
import { AdminControlsWrapper } from '../[userID]/components/AdminControlsWrapper'
import { ExportDataButton } from '../[userID]/components/ExportDataButton'

interface StudentLayoutProps {
  params: Promise<{ userID: string }>
  children: React.ReactNode
}

export default async function StudentLayout({ params, children }: StudentLayoutProps) {
  const { userID: userId } = await params
  
  // Fetch student summary data
  const studentSummary = await getStudentSummary(userId)
  
  if (!studentSummary) {
    notFound()
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Student Avatar */}
            {studentSummary.profile_picture_url ? (
              <img
                src={studentSummary.profile_picture_url}
                alt={studentSummary.name || 'Student Avatar'}
                className="h-16 w-16 rounded-full object-cover border-2 border-emerald-500 shadow-md"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold">
                {studentSummary.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            
            {/* Student Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {studentSummary.name || 'Unknown Student'}
              </h1>
              <p className="text-sm text-gray-600">{studentSummary.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Joined {new Date(studentSummary.joined_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {/* Key Stats and Actions */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{studentSummary.total_sessions}</div>
              <div className="text-xs text-gray-600">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{studentSummary.overall_accuracy.toFixed(1)}%</div>
              <div className="text-xs text-gray-600">Accuracy</div>
            </div>
            <ExportDataButton userId={userId} />
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <NavigationTabs userId={userId} />
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 px-6 py-2 border-b border-gray-200">
        <nav className="text-sm">
          <Link href="/students" className="text-gray-600 hover:text-gray-900">
            Students
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{studentSummary.name}</span>
        </nav>
      </div>
      
      {/* Content with Admin Controls Sidebar */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
          
          {/* Admin Controls Sidebar */}
          <div className="w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto">
            <AdminControlsWrapper userId={userId} />
          </div>
        </div>
      </div>
    </div>
  )
}

