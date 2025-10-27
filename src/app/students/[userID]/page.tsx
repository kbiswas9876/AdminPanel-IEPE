import { ActivityFeed } from './components/ActivityFeed'
import { ActivitySummaryStats } from './components/ActivitySummaryStats'
import { getStudentActivityFeed } from '@/lib/actions/studentAnalyticsActions'
import { AISummaryCard } from '@/components/students/AISummaryCard'

interface StudentPageProps {
  params: Promise<{ userID: string }>
}

export default async function StudentPage({ params }: StudentPageProps) {
  const { userID: userId } = await params
  
  // Fetch initial activity feed
  const initialData = await getStudentActivityFeed(userId, {}, { page: 1, limit: 20 })
  
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Summary Statistics */}
        <ActivitySummaryStats userId={userId} />
        
        {/* AI Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              📊 Performance Trajectory feature requires additional setup. It will calculate performance trends based on test results.
            </p>
          </div>
          <AISummaryCard userId={userId} />
        </div>
        
        {/* Activity Feed */}
        <ActivityFeed
          userId={userId}
          initialData={initialData}
        />
      </div>
    </div>
  )
}
