import { ActivityFeed } from './components/ActivityFeed'
import { ActivitySummaryStats } from './components/ActivitySummaryStats'
import { getStudentActivityFeed } from '@/lib/actions/studentAnalyticsActions'

// Disable caching to ensure fresh data
export const revalidate = 0

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
        
        {/* Activity Feed */}
        <ActivityFeed
          userId={userId}
          initialData={initialData}
        />
      </div>
    </div>
  )
}
