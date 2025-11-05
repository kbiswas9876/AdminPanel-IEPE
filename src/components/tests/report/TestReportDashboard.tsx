'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { BarChart3, Trophy, Clock, Users, TrendingUp, ArrowLeft, TrendingDown, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { PopulatedOverallAnalyticsTab } from './PopulatedOverallAnalyticsTab'
import { StudentRankingsTab } from './StudentRankingsTab'
import { QuestionInsightsTab } from './QuestionInsightsTab'
import { IntegrityReportTab } from './IntegrityReportTab'
import { formatSecondsToHumanReadable } from '@/lib/utils/formatTime'
import dynamic from 'next/dynamic'

const QuestionInsightsPage = dynamic(() => import('../question-insights/QuestionInsightsPage'), { ssr: false })

const USE_NEW_QUESTION_INSIGHTS = true
import { TopicDifficultyTab } from './TopicDifficultyTab'
import type { Test } from '@/lib/supabase/admin'
import type { TestOverviewStats, StudentRanking } from '@/lib/actions/test-reports'

interface TestReportDashboardProps {
  test: Test
  stats: TestOverviewStats | null
  rankings: StudentRanking[]
}

export function TestReportDashboard({ test, stats, rankings }: TestReportDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tests">
                <Button variant="ghost" size="sm" className="h-9 gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Tests
                </Button>
              </Link>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{test.name}</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Test Report & Analytics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-xs font-medium text-blue-700">
                  {test.status === 'live' ? '🟢 Live' : '✅ Completed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Total Participants</span>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.totalParticipants}</div>
            </Card>

            <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Class Average</span>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {stats.averagePercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.averageScore.toFixed(2)} / {stats.totalMarks} marks
              </p>
            </Card>

            <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Median Score</span>
                <Target className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {stats.medianScore.toFixed(1)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                50th percentile
              </p>
            </Card>

            <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Highest Score</span>
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {stats.highestScore.toFixed(1)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.highestPercentage.toFixed(1)}%
              </p>
            </Card>

            <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Lowest Score</span>
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {stats.lowestScore.toFixed(1)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.lowestPercentage.toFixed(1)}%
              </p>
            </Card>

            <Card className="p-6 border-slate-200 bg-white/60 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Avg. Time Taken</span>
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {formatSecondsToHumanReadable(stats.averageTimeSeconds)}
              </div>
            </Card>
          </div>
        )}

        {/* No Data State */}
        {stats?.totalParticipants === 0 && (
          <Card className="p-12 border-slate-200 bg-white/60 backdrop-blur-sm text-center">
            <BarChart3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Submissions Yet
            </h3>
            <p className="text-sm text-slate-500">
              Once students start submitting their tests, analytics will appear here.
            </p>
          </Card>
        )}

        {/* Tabbed Analytics */}
        {stats && stats.totalParticipants > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className={cn(
              "grid w-full max-w-3xl h-12 bg-slate-100/80 p-1",
              test.is_proctored ? "grid-cols-5" : "grid-cols-4"
            )}>
              <TabsTrigger 
                value="overview" 
                className="h-10 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="leaderboard" 
                className="h-10 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Leaderboard
              </TabsTrigger>
              <TabsTrigger 
                value="questions" 
                className="h-10 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Question Insights
              </TabsTrigger>
              <TabsTrigger 
                value="topics" 
                className="h-10 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Topic Analysis
              </TabsTrigger>
              {test.is_proctored && (
                <TabsTrigger 
                  value="integrity" 
                  className="h-10 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Integrity Report
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <PopulatedOverallAnalyticsTab testId={test.id} />
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <StudentRankingsTab testId={test.id} rankings={rankings} />
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              {USE_NEW_QUESTION_INSIGHTS ? (
                <QuestionInsightsPage testId={test.id} />
              ) : (
                <QuestionInsightsTab testId={test.id} />
              )}
            </TabsContent>

            <TabsContent value="topics" className="space-y-6">
              <TopicDifficultyTab testId={test.id} />
            </TabsContent>

            {test.is_proctored && (
              <TabsContent value="integrity" className="space-y-6">
                <IntegrityReportTab testId={test.id} />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  )
}

