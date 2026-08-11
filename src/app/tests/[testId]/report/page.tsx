import { notFound } from 'next/navigation'
import { getTestOverviewStats, getTestRankings } from '@/lib/actions/test-reports'
import { getTestDetails } from '@/lib/actions/tests'
import { TestReportDashboard } from '@/components/tests/report/TestReportDashboard'

interface PageProps {
  params: Promise<{
    testId: string
  }>
}

export default async function TestReportPage({ params }: PageProps) {
  const resolvedParams = await params
  const testId = parseInt(resolvedParams.testId)
  
  if (isNaN(testId)) {
    notFound()
  }
  
  // Fetch all data in parallel
  const [{ test, questionCount }, stats, rankings] = await Promise.all([
    getTestDetails(testId),
    getTestOverviewStats(testId),
    getTestRankings(testId)
  ])
  
  if (!test) {
    notFound()
  }
  
  return (
    <TestReportDashboard
      test={test}
      stats={stats}
      rankings={rankings}
    />
  )
}

